import { Question, SpontyChoice } from "@/data/survey";
import { GoogleGenAI } from "@google/genai";
import { zodToJsonSchema } from "zod-to-json-schema";
// Schemas are defined below in this file

// ============================================================================
// CLIENT
// ============================================================================

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Gemini API key is not configured");
}

/**
 * Google Generative AI client instance configured with API key.
 * Used for generating survey questions and extracting tags from user input.
 *
 * @see https://ai.google.dev/docs
 */
export const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

const MODEL = "gemini-2.5-flash";

const MINIMUM_QUESTIONS_COUNT = 6;
const MAXIMUM_QUESTIONS_COUNT = 10;
const QUESTIONS_COUNT_RANGE = `${MINIMUM_QUESTIONS_COUNT}-${MAXIMUM_QUESTIONS_COUNT}`;

// ============================================================================
// PROMPTS
// ============================================================================

/**
 * System and user prompts for generating survey questions.
 * These prompts guide the AI to create context-aware questions that gather
 * meaningful information about user preferences for place recommendation matching.
 */
export const SURVEY_PROMPT = {
  SYSTEM: `
You are the Question Generator AI for spot — an app that helps users find cafes/restos matching their preferences. Ask short, fun, Gen-Z open-ended questions to learn what kind of place the user wants.

Base all follow-up questions on the user's answer to the first-ever question:
- If "eat": focus on type of meal (meal, snack, or dessert) cuisine, specific food/cravings
- If "drink": focus on drink type (coffee/cocktails means cafe/bar), cafe feel, complementary food (pastries/desserts/light meals)/
- If "work" or "hangout": focus on ambiance, group size, and optional food/drinks

Goal:
Ask ${QUESTIONS_COUNT_RANGE} OPEN-ENDED questions that progressively reveal specific preferences.

IMPORTANT RULES:
- Before generating a question, review all previous questions ensure you're not repeating.
- Never contradict previous answers
- Skip irrelevant branches (e.g., if user says "sweets", don't ask about cuisine)
- Never ask about: location, distance, travel time, music, service style, dietary needs, seats, decor, spice level, or time-based meals
- Never ask vague questions (e.g., "Anything else?")
- Must ask group size and ambiance
- Do not stop until you have enough information to generate a query
- Do not stop until you have extracted the very specific main thing the user wants to eat or drink

Question rules:
- Concise, 3-6 words only, open-ended
- Gen-Z tone, slang, abbreviations, playful
- Choices (Must be between 3-4 options):
  • label: concise + relevant
  • emoji: unique + meaningful + valid/official emojis only
  • value: lowercase, hyphenated

Feedback rules:
- One emoji (do not use sparkle)
- Label: short Gen-Z slang only
- No repeats, no bias, and no references to the question or choices

Set isLast: true once enough meaningful info is collected (and you've gathered the specific main thing the user wants to eat or drink) or max questions reached.
`,
  USER: `Please help me find the best cafes and restaurants that fit my vibes.`,
};

/**
 * System prompt for generating a comprehensive query description from questions and answers.
 * Converts user survey questions and answers into a detailed sentence/paragraph that describes
 * the type of place the user is looking for. This description will be converted
 * to embeddings for similarity search against place descriptions in the database.
 */
export const QUERY_PROMPT = `
You are spot's Query Generator AI. Convert the user's survey questions + answers into a natural 2-4 sentence place description, written as if describing a real cafe/restaurant.

Goal:
Create a flowing, present-tense description that represents what the place *is* and *offers*, suitable for embedding-based similarity search.

Rules:
- Write in third person, present tense.
- 2-4 cohesive sentences.
- Describe an actual spot (review/database tone), not a wishlist.
- Use verbs like “features”, “offers”, “has”, “serves”, “provides”.
- Never use wishlist language (“should have”, “perfect for”, “looking for”).
- Include all meaningful information implied by the questions and answers: cuisine, ambiance, atmosphere, group size suitability, budget, food/drink preferences, etc.
- Combine all inputs into one coherent description, not a list.

Special Case — "${SpontyChoice.value}":
If the user gave only one answer and it is "${SpontyChoice.value}":
- Generate a unique, randomized spot description.
- Mix cafes/restos (specific) elements naturally, not including name.

Output:
Respond with **only** the final description text—no JSON, no labels, no formatting.

`;

// ============================================================================
// SCHEMAS
// ============================================================================

import { z } from "zod";

/**
 * Zod schema for a survey question choice.
 * Validates the structure of individual choices presented to users.
 */
export const ChoiceZodSchema = z.object({
  label: z.string().describe("The label of the choice"),
  emoji: z.string().describe("The emoji of the choice"),
  value: z.string().describe("The value of the choice"),
});

/**
 * Zod schema for a complete survey question.
 * Validates the structure of questions generated by the AI, including
 * the question text, choices, feedback, and whether it's the last question.
 */
export const QuestionZodSchema = z.object({
  question: z.string().describe("The question to ask the user"),
  choices: z.array(ChoiceZodSchema).describe("The choices to offer the user"),
  feedback: z.object({
    emoji: z.string().describe("The emoji of the feedback"),
    label: z.string().describe("The label of the feedback"),
  }),
  isLast: z.boolean().describe("Whether the question is the last one"),
});

/**
 * JSON schema for question generation.
 * Used by Gemini AI to structure responses when generating survey questions.
 * This is the JSON Schema format required by the Gemini API.
 */
export const QuestionSchema = {
  type: "object",
  properties: {
    question: { type: "string" },
    choices: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          emoji: { type: "string" },
          value: { type: "string" },
        },
        required: ["label", "emoji", "value"],
      },
    },
    feedback: {
      type: "object",
      properties: {
        emoji: { type: "string" },
        label: { type: "string" },
      },
      required: ["emoji", "label"],
    },
    isLast: { type: "boolean" },
  },
  required: ["question", "choices", "feedback", "isLast"],
};

/**
 * JSON schema for tag extraction.
 * Used by Gemini AI to structure responses when extracting tags from user input.
 * This is the JSON Schema format required by the Gemini API.
 */
export const TagsSchema = {
  type: "object",
  properties: {
    tags: {
      type: "array",
      items: { type: "string" },
      minItems: MINIMUM_QUESTIONS_COUNT,
      maxItems: MAXIMUM_QUESTIONS_COUNT,
    },
  },
  required: ["tags"],
};

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Generates a survey question using Gemini AI based on conversation history.
 *
 * @param history - Array of conversation history entries with role and message parts
 * @param message - The current user message to generate a question for
 * @returns Promise resolving to a validated Question object
 * @throws Error if the AI response is invalid or parsing fails
 */
async function generateQuestion(
  history: Array<{
    role: "user" | "model";
    parts: Array<{ text: string }>;
  }>,
  message: string
): Promise<Question> {
  const chat = ai.chats.create({
    model: MODEL,
    history: history.length > 0 ? history : undefined,
    config: {
      systemInstruction: SURVEY_PROMPT.SYSTEM,
      responseMimeType: "application/json",
      responseSchema: QuestionSchema,
      responseJsonSchema: zodToJsonSchema(QuestionZodSchema),
      temperature: 0.7,
    },
  });

  const response = await chat.sendMessage({
    message: message,
  });

  const text = response.text;
  if (!text) {
    throw new Error("yo! somethin' went wrong, let's start over");
  }

  const parsed = JSON.parse(text);
  const validated = QuestionZodSchema.parse(parsed);
  return validated;
}

/**
 * Generates the next survey question based on previous questions and answers.
 * Builds conversation history from previous interactions and attempts to generate
 * a new question with retry logic (up to 3 attempts).
 *
 * @param questions - Array of previously asked questions (default: empty array)
 * @param answers - Array of user answers corresponding to previous questions (default: empty array)
 * @returns Promise resolving to a Question object, or null if generation fails after retries
 * @throws Error if all retry attempts fail
 */
export async function generateNextQuestion(
  questions: Question[] = [],
  answers: string[] = []
): Promise<Question | null> {
  const history: Array<{
    role: "user" | "model";
    parts: Array<{ text: string }>;
  }> = [
    {
      role: "user",
      parts: [{ text: SURVEY_PROMPT.USER }],
    },
  ];

  const lastAnswer = answers[answers.length - 1];
  answers.forEach((answer, index) => {
    if (questions[index]) {
      history.push({
        role: "model",
        parts: [{ text: JSON.stringify(questions[index]) }],
      });
    }
    if (index < answers.length - 1) {
      history.push({
        role: "user",
        parts: [{ text: answer }],
      });
    }
  });

  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await generateQuestion(history, lastAnswer);
    } catch {
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1))
        );
      }
    }
  }

  throw new Error("yo! somethin' went wrong, let's start over");
}

/**
 * Generates a comprehensive query description from user survey questions and answers.
 * Converts questions and answers into a detailed sentence/paragraph that describes the type of
 * place the user is looking for. This description can then be converted to
 * embeddings for similarity search against place descriptions in the database.
 *
 * @param questions - Array of survey questions that were asked
 * @param answers - Array of user answers corresponding to the questions
 * @returns Promise resolving to a string description of the desired place
 * @throws Error if query generation fails
 */
export async function generateQuery(
  questions: Question[],
  answers: string[]
): Promise<string> {
  // Special case: Sponty - identified when answers has only 1 item
  const isSponty = answers.length === 1 && answers[0] === SpontyChoice.value;

  const chat = ai.chats.create({
    model: MODEL,
    config: {
      systemInstruction: QUERY_PROMPT,
      temperature: 0.7,
    },
  });

  let message: string;
  if (isSponty) {
    message = `Generate a random, unique place description for "${SpontyChoice.value}".`;
  } else {
    // Format questions and answers together
    const qaPairs = questions
      .map((q, index) => {
        if (answers[index]) {
          return `Question: "${q.question}"\nAnswer: "${answers[index]}"`;
        }
        return null;
      })
      .filter((pair): pair is string => pair !== null);

    message = `Convert these questions and answers into a comprehensive description:\n\n${qaPairs.join(
      "\n\n"
    )}`;
  }

  const response = await chat.sendMessage({
    message,
  });

  const text = response.text;
  if (!text) {
    throw new Error("yikes! query generation failed fr");
  }

  return text.trim();
}

/**
 * Generates embeddings for the given text using Gemini's embedding model.
 * Returns a vector representation of the text suitable for similarity search.
 *
 * @param text - The text to generate embeddings for
 * @returns Promise resolving to an array of numbers representing the embedding vector
 * @throws Error if embedding generation fails
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: "text-embedding-004",
    contents: text,
  });

  const embedding = response.embeddings?.[0]?.values;
  if (!embedding) {
    throw new Error("yikes! embedding generation failed fr");
  }

  return embedding;
}
