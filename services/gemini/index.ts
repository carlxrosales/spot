import { Question } from "@/data/survey";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ai } from "./client";
import { SURVEY_PROMPT, TAGS_PROMPT } from "./prompt";
import {
  QuestionSchema,
  QuestionZodSchema,
  TagsSchema,
  TagsZodSchema,
} from "./schema";

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
