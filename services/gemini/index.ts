import { Question } from "@/data/survey";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ai } from "./client";
import { QUERY_PROMPT, SURVEY_PROMPT, TAGS_PROMPT } from "./prompt";
import {
  QuestionSchema,
  QuestionZodSchema,
  TagsSchema,
  TagsZodSchema,
} from "./schema";

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
      maxOutputTokens: 1200,
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
