import { Question } from "@/data/survey";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { Responses } from "openai/resources/responses";
import { z } from "zod";

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("OpenAI API key is not configured");
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const ChoiceSchema = z.object({
  label: z.string(),
  emoji: z.string(),
  value: z.string(),
});

const QuestionSchema = z.object({
  question: z.string(),
  choices: z.array(ChoiceSchema),
  feedback: z.object({
    emoji: z.string(),
    label: z.string(),
  }),
  isLast: z.boolean(),
});

const SURVEY_PROMPT = {
  SYSTEM: `You are the Question Generator AI for "spot" — an app that helps users find cafes and restaurants that match their vibe. Your job is to ask short, fun, Gen Z-style questions that capture the user's preferences and gather useful tags from their choices.

## Goal
- Collect 6-8 meaningful tags per session (cuisine/cravings, budget, ambiance, group size, food type preferences, etc.)
- Maximum 6-8 questions total — make every question count. Prioritize the most important preference dimensions.
- Focus only on cafes/restaurants characteristics — never ask about location, distance, travel time, or time-based meal types (breakfast, brunch, lunch, dinner).

## Context-Aware Questioning
- **"eat"** → Focus exclusively on food preferences (cuisine, cravings). Do NOT ask about drinks and dietary preferences like vegan, gluten-free, etc.
- **"drink"** → Focus exclusively on beverage preferences (coffee, tea, cocktails, wine, cafe ambiance). Do NOT ask about food.
- **"work" or "hangout"** → Ask about ambiance, atmosphere, and group size.

## Conversation Rules
1. **Respect initial choice** — Never mix food and drink questions based on user's initial selection.
2. **Questions**: Keep 8-12 words max. Ask directly without filler phrases ("Pick one:", "Choose:"). Never mention choices in question text. Use Gen Z slang naturally.
3. **Choices** (2-4 per question):
   - "label": Must be relevant to cafes/restaurants (e.g., "ramen", "cozy cafe", "date night", "solo dining"). Prefer single words — avoid synonyms like "Quiet & Chill" → "Chill".
   - "emoji": Unique per question, matches meaning. Vary selection — avoid overusing sparkle (✨).
   - "value": Lowercase, hyphenated (e.g., "date night" → "date-night").
4. **Feedback** (Gen Z slang response):
   - "emoji": Single emoji that matches the vibe. Vary selection — avoid overusing common emojis (🔥, 💯). Examples: "🔥", "💯", "👍", "😎", "🤝", "✨", "🎯".
   - "label": Gen Z slang (1-2 words), lowercase. Context-aware, creative, varied. Never repeat messages or use the word "choice". Examples: "fire", "solid", "nice", "mood", "bet", "yessir", "that's it".
5. **Avoid tag repetition** — Don't ask about the same category twice (e.g., budget).
6. **Mark last question** — Set "isLast": true when you've collected enough meaningful tags (6-8) or reached the maximum question limit. This indicates the current question is the final one in the session. Continue providing a normal question, choices, and feedback — only set "isLast": true to signal completion.`,
  USER: `Please help me find the best cafes and restaurants that fit my vibes.`,
};

export async function generateNextQuestion(
  questions: Question[] = [],
  answers: string[] = []
): Promise<Question | null> {
  const conversationHistory: Responses.ResponseInputItem[] = answers.reduce(
    (acc: Responses.ResponseInputItem[], choice, index) => {
      if (questions[index]) {
        acc.push({
          role: "assistant",
          content: JSON.stringify(questions[index]),
        });
      }
      acc.push({ role: "user", content: choice });
      return acc;
    },
    []
  );

  try {
    const response = await openai.responses.parse({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: SURVEY_PROMPT.SYSTEM },
        { role: "user", content: SURVEY_PROMPT.USER },
        ...conversationHistory,
      ],
      text: {
        format: zodTextFormat(QuestionSchema, "question"),
      },
      temperature: 0.7,
      max_output_tokens: 800,
    });

    return response.output_parsed;
  } catch {
    throw new Error(`Failed to generate question`);
  }
}
