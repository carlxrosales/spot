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

const MODEL = "gemini-2.5-flash-lite";

// ============================================================================
// PROMPTS
// ============================================================================

/**
 * System and user prompts for generating survey questions.
 * These prompts guide the AI to create context-aware questions that extract
 * meaningful tags for place recommendation matching.
 */
export const SURVEY_PROMPT = {
  SYSTEM: `You are the Question Generator AI for spot, an app that helps users find cafes/restos that match their vibe. Ask short, fun, Gen-Z questions to collect 6-8 unique tags for embeddings. One question = one tag. Never repeat a category.

Goal:
Collect 6-10 meaningful, non-overlapping tags. Every question must produce a new tag. Prioritize big dimensions first (cuisine/cravings, budget, ambiance, group size, food/drink types).

Tag rules:
- Each question extracts 1 tag.
- No repeats.
- Tags must affect the dining experience.
- Never ask about location, distance, travel time, or time-based meals.

Context:
- "eat" → only food (no drinks/diets).
- "drink" → only drinks + cafe ambiance (no food).
- "work"/"hangout" → ambiance + group size.

Question rules:
- Keep questions 3-7 words, no filler.
- Gen-Z tone, slang and abbreviations.
- Don't overuse the word "vibe".
- Choices (2-4):
  • label: relevant + concise
  • emoji: unique + meaningful
  • value: lowercase, hyphenated
- Feedback:
  • one varied emoji
  • label: short Gen-Z slang, lowercase, no repeats, no "choice"
- Set isLast: true once enough tags or max questions.

Output valid JSON:
{
  "question": string,
  "choices": [{ "label": string, "emoji": string, "value": string }],
  "feedback": { "emoji": string, "label": string },
  "isLast": boolean
};`,
  USER: `Please help me find the best cafes and restaurants that fit my vibes.`,
};

/**
 * System prompt for extracting tags from user input.
 * Guides the AI to extract 6-10 distinct, non-overlapping tags that capture
 * user preferences for place matching via embedding similarity search.
 */
export const TAGS_PROMPT = `You are the Tag Extractor AI for spot, an app that helps users find cafes/restos that match their vibe. Extract 6–10 meaningful tags from the user's input for embeddings.

Requirements:
- Extract exactly 6–10 distinct, non-overlapping tags.
- Format: lowercase, hyphenated (e.g., "date-night", "ramen", "solo-dining").
- Focus on cuisine/cravings, budget, ambiance, group size, food prefs, atmosphere.
- Never extract location, distance, travel time, or meal times (breakfast, brunch, etc.).

Context & Interpretation:
- Read the entire input holistically; interpret intent, not isolated keywords.
- Negation/opposites ("unlimited", "no", "not", "any", "all") = absence of constraints; extract the opposite meaning or skip that dimension.
- Understand slang/abbreviations ("unli", "solo", "comfy", "chill", "fam", "lit") and interpret by context.
- No contradictions: only extract tags aligned with overall intent.

Output JSON:
{
  "tags": string[]
}`;

/**
 * System prompt for generating a comprehensive query description from tags.
 * Converts user preference tags into a detailed sentence/paragraph that describes
 * the type of place the user is looking for. This description will be converted
 * to embeddings for similarity search against place descriptions in the database.
 */
export const QUERY_PROMPT = `
You are the Query Generator AI for spot, an app that helps users find cafes/restos that match their vibe. Convert user preference tags into a natural place description (2–4 sentences) as if describing a real cafe/restaurant, not listing wishes.

Goal:
Transform the tags into a flowing description that will be embedded for similarity search. Write in present tense, describing what the place *is* and *offers*.

Place Description Rules:
- Describe it like an actual spot (review/database style).
- Use phrases like "features", "offers", "has", "serves", "provides".
- Avoid wishlist phrases ("should have", "perfect for", "looking for").

Requirements:
- 2–4 natural sentences, not a tag list.
- Include all relevant aspects: cuisine, ambiance, atmosphere, group size, budget, food prefs.
- Detailed enough for accurate matching.
- Expand tags rather than repeating them literally.

Special Handling — "${SpontyChoice.value}":
If this is the *only* tag:
- Generate a random, diverse place description.
- Mix cuisine types, ambiance styles, atmosphere traits, group size suitability, and budget ranges.

Style:
- Third person, present tense.
- Specific, descriptive, cohesive.
- Write as if documenting a real place.

Example:
Tags: ["ramen", "date-night", "cozy", "mid-range"]
Output: "A cozy, intimate ramen restaurant with a warm and romantic atmosphere. The restaurant features mid-range pricing and serves quality ramen in a comfortable setting that encourages conversation and connection."

Respond with ONLY the description text — no JSON or formatting.
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
 * Zod schema for tag extraction response.
 * Validates that exactly 6-10 tags are extracted from user input.
 */
export const TagsZodSchema = z.object({
  tags: z
    .array(z.string())
    .min(6)
    .max(10)
    .describe(
      "Array of 6-10 lowercase, hyphenated tag values extracted from the user's input"
    ),
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
      minItems: 6,
      maxItems: 10,
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
      maxOutputTokens: 1500,
    },
  });

  const response = await chat.sendMessage({
    message: message,
  });

  const text = response.text;
  if (!text) {
    throw new Error("Yo! Somethin' went wrong, let's start over");
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

  throw new Error("Yo! Somethin' went wrong, let's start over");
}

/**
 * Extracts 6-10 meaningful tags from user input using Gemini AI.
 * Tags are formatted as lowercase, hyphenated strings suitable for embedding-based similarity search.
 * Includes retry logic (up to 3 attempts) for reliability.
 *
 * @param input - The user input text to extract tags from
 * @returns Promise resolving to an array of 6-10 tag strings
 * @throws Error if tag extraction fails after all retry attempts
 */
export async function generateTags(input: string): Promise<string[]> {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const chat = ai.chats.create({
        model: MODEL,
        config: {
          systemInstruction: TAGS_PROMPT,
          responseMimeType: "application/json",
          responseSchema: TagsSchema,
          responseJsonSchema: zodToJsonSchema(TagsZodSchema),
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      });

      const response = await chat.sendMessage({
        message: `Extract 6-10 meaningful tags from this user input: "${input}"`,
      });

      const text = response.text;
      if (!text) {
        throw new Error("Yikes! Tags extraction failed fr");
      }

      const parsed = JSON.parse(text);
      const validated = TagsZodSchema.parse(parsed);
      return validated.tags;
    } catch {
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1))
        );
      }
    }
  }

  throw new Error("Yikes! Tags extraction failed fr");
}

/**
 * Generates a comprehensive query description from user preference tags.
 * Converts tags into a detailed sentence/paragraph that describes the type of
 * place the user is looking for. This description can then be converted to
 * embeddings for similarity search against place descriptions in the database.
 * Includes retry logic (up to 3 attempts) for reliability.
 *
 * @param tags - Array of preference tags extracted from survey answers
 * @returns Promise resolving to a string description of the desired place
 * @throws Error if query generation fails after all retry attempts
 */
export async function generateQuery(tags: string[]): Promise<string> {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const chat = ai.chats.create({
        model: MODEL,
        config: {
          systemInstruction: QUERY_PROMPT,
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      });

      const response = await chat.sendMessage({
        message: `Convert these tags into a comprehensive description: ${tags.join(
          ", "
        )}`,
      });

      const text = response.text;
      if (!text) {
        throw new Error("Yikes! Query generation failed fr");
      }

      return text.trim();
    } catch {
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1))
        );
      }
    }
  }

  throw new Error("Yikes! Query generation failed fr");
}

/**
 * Generates embeddings for the given text using Gemini's embedding model.
 * Returns a vector representation of the text suitable for similarity search.
 * Includes retry logic (up to 3 attempts) for reliability.
 *
 * @param text - The text to generate embeddings for
 * @returns Promise resolving to an array of numbers representing the embedding vector
 * @throws Error if embedding generation fails after all retry attempts
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: text,
      });

      const embedding = response.embeddings?.[0]?.values;
      if (!embedding) {
        throw new Error("Yikes! Embedding generation failed fr");
      }

      return embedding;
    } catch {
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1))
        );
      }
    }
  }

  throw new Error("Yikes! Embedding generation failed fr");
}
