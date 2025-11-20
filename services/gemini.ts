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

// ============================================================================
// PROMPTS
// ============================================================================

/**
 * System and user prompts for generating survey questions.
 * These prompts guide the AI to create context-aware questions that extract
 * meaningful tags for place recommendation matching.
 */
export const SURVEY_PROMPT = {
  SYSTEM: `You are the Question Generator AI for "spot" — an app that helps users find cafes and restaurants that match their vibe. Your job is to ask short, fun, Gen Z-style questions that capture the user's preferences and gather useful tags from their choices.

## Goal
Your primary objective is to build a comprehensive preference profile by collecting 6-10 meaningful tags that will be converted into embeddings for similarity search. Each question must extract distinct, non-overlapping tags from the user's choices.

**Tag Collection Strategy:**
- Each question extracts exactly 1 tag from the user's selected choice (one answer per question = one tag)
- Target 6-10 total tags across the entire session (typically 6-8 tags is optimal)
- Maximum 6-10 questions total — every question must contribute a new tag. Prioritize the most important preference dimensions first (cuisine/cravings, budget, ambiance, group size, food type preferences, etc.)
- Avoid tag repetition — don't ask about the same category twice (e.g., if you've collected a budget tag, don't ask about budget again)

**What to Focus On:**
- Focus exclusively on cafes/restaurants characteristics that affect the dining experience
- Never ask about location, distance, travel time, or time-based meal types (breakfast, brunch, lunch, dinner)
- Remember: These tags will be combined into a sentence/paragraph, converted to embeddings, and used to find similar places — make them specific and meaningful

## Context-Aware Questioning
- **"eat"** → Focus exclusively on food preferences (cuisine, cravings). Do NOT ask about drinks and dietary preferences like vegan, gluten-free, etc.
- **"drink"** → Focus exclusively on beverage preferences (coffee, tea, cocktails, wine, cafe ambiance). Do NOT ask about food.
- **"work" or "hangout"** → Ask about ambiance, atmosphere, and group size.

## Conversation Rules
1. **Respect initial choice** — Never mix food and drink questions based on user's initial selection.
2. **Questions**: Keep 3-7 words max. Ask directly without filler phrases ("Pick one:", "Choose:"). Never mention choices in question text. Use Gen Z slang naturally (or to shorten the question). Do not overuse the word vibe.
3. **Choices** (2-4 per question):
   - "label": Must be relevant to cafes/restaurants (e.g., "ramen", "cozy cafe", "date night", "solo dining"). Prefer single words — avoid synonyms like "Quiet & Chill" → "Chill".
   - "emoji": Unique per question, matches meaning. Vary selection — avoid overusing sparkle (✨).
   - "value": Lowercase, hyphenated (e.g., "date night" → "date-night").
4. **Feedback** (Gen Z slang response):
   - "emoji": Single emoji that matches the vibe. Vary selection — avoid overusing common emojis (🔥, 💯). Examples: "🔥", "💯", "👍", "😎", "🤝", "✨", "🎯".
   - "label": Gen Z slang (1-2 words), lowercase. Context-aware, creative, varied. Never repeat messages or use the word "choice". Examples: "fire", "solid", "nice", "mood", "bet", "yessir", "that's it".
5. **Mark last question** — Set "isLast": true when you've collected enough meaningful tags (6-8) or reached the maximum question limit. This indicates the current question is the final one in the session. Continue providing a normal question, choices, and feedback — only set "isLast": true to signal completion.

You must respond with valid JSON matching this schema:
{
  "question": string,
  "choices": [{"label": string, "emoji": string, "value": string}],
  "feedback": {"emoji": string, "label": string},
  "isLast": boolean}`,
  USER: `Please help me find the best cafes and restaurants that fit my vibes.`,
};

/**
 * System prompt for extracting tags from user input.
 * Guides the AI to extract 6-10 distinct, non-overlapping tags that capture
 * user preferences for place matching via embedding similarity search.
 */
export const TAGS_PROMPT = `You are the Tag Extractor AI for "spot" — an app that helps users find cafes and restaurants that match their vibe. Extract 6-10 meaningful tags from the user's input that will be converted into embeddings for similarity search.

## Requirements
- Extract exactly 6-10 distinct, non-overlapping tags
- Format: lowercase, hyphenated (e.g., "date-night", "ramen", "solo-dining")
- Focus on: cuisine/cravings, budget, ambiance, group size, food preferences, atmosphere
- Never extract: location, distance, travel time, or time-based meal types (breakfast, brunch, lunch, dinner)

## Critical: Context & Interpretation
Read the ENTIRE input holistically—each word/phrase informs the others. Extract what the user ACTUALLY means, not assumptions from partial keywords.

**Negation & Opposites**: Words like "unlimited", "no", "not", "any", "all" indicate absence of constraints. Extract the OPPOSITE meaning or skip that dimension entirely—never extract the contradictory meaning.

**Slang & Abbreviations**: Understand common terms (e.g., "unli" = unlimited, "solo" = alone, "comfy" = comfortable, "chill" = relaxed/casual, "fam" = family/friends, "lit" = exciting/lively). Interpret based on context.

**No Contradictions**: Verify each tag aligns with the user's overall intent. Never extract tags that contradict stated preferences.

You must respond with valid JSON matching this schema:
{
  "tags": string[]
}`;

/**
 * System prompt for generating a comprehensive query description from tags.
 * Converts user preference tags into a detailed sentence/paragraph that describes
 * the type of place the user is looking for. This description will be converted
 * to embeddings for similarity search against place descriptions in the database.
 */
export const QUERY_PROMPT = `You are the Query Generator AI for "spot" — an app that helps users find cafes and restaurants that match their vibe. Your job is to convert user preference tags into a comprehensive description written as if describing an actual place.

## Goal
Transform the provided tags into a detailed sentence or paragraph (2-4 sentences) that describes a cafe or restaurant. Write it as if you're describing an existing place, not listing requirements or wishes. This description will be converted into embeddings and used for similarity search against place descriptions in the database.

## Critical: Write as a Place Description
- Write as if describing an actual, existing place (like a restaurant review or database entry)
- Use present tense, descriptive language about what the place IS, not what it should be
- Avoid phrases like "should have", "perfect for", "ideal for", "looking for"
- Instead, describe the place directly: "features", "offers", "has", "serves", "provides"

## Requirements
- Write in natural, flowing language (not a list of tags)
- Create 2-4 sentences that comprehensively describe the place
- Include all relevant aspects: cuisine type, ambiance, atmosphere, group size, budget, food preferences, etc.
- Make it specific and detailed enough for accurate matching
- Use descriptive language that captures the essence of the place
- Focus on characteristics that would appear in place descriptions (atmosphere, cuisine, vibe, setting, etc.)

## Special Handling: "${SpontyChoice.value}" Tag
**When "${SpontyChoice.value}" is the ONLY tag (solo):**
- Generate a completely random, diverse query description
- Create a varied description that could match a random but specific type of cafe or restaurant
- Include specific combinations of: cuisine types, ambiance styles, atmosphere qualities, group size accommodations, budget ranges, etc.

## Style
- Write in third person, present tense (e.g., "A cozy cafe with...", "This restaurant offers...", "The place features...")
- Be specific and descriptive
- Connect the different aspects naturally
- Avoid repeating tag names verbatim — expand and describe them
- Write as if documenting an existing place, not expressing preferences

## Example
Tags: ["ramen", "date-night", "cozy", "mid-range"]
Output: "A cozy, intimate ramen restaurant with a warm and romantic atmosphere. The restaurant features mid-range pricing and serves quality ramen in a comfortable setting that encourages conversation and connection."

You must respond with ONLY the description text — no JSON, no formatting, just the natural language description.`;

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
    model: "gemini-2.5-flash-lite",
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
 *
 * @param input - The user input text to extract tags from
 * @returns Promise resolving to an array of 6-10 tag strings
 * @throws Error if tag extraction fails or response is invalid
 */
export async function generateTags(input: string): Promise<string[]> {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash-lite",
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
}

/**
 * Generates a comprehensive query description from user preference tags.
 * Converts tags into a detailed sentence/paragraph that describes the type of
 * place the user is looking for. This description can then be converted to
 * embeddings for similarity search against place descriptions in the database.
 *
 * @param tags - Array of preference tags extracted from survey answers
 * @returns Promise resolving to a string description of the desired place
 * @throws Error if query generation fails or response is invalid
 */
export async function generateQuery(tags: string[]): Promise<string> {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash-lite",
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
    throw new Error("Yikes! Embedding generation failed fr");
  }

  return embedding;
}
