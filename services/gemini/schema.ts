import { z } from "zod";

export const ChoiceZodSchema = z.object({
  label: z.string().describe("The label of the choice"),
  emoji: z.string().describe("The emoji of the choice"),
  value: z.string().describe("The value of the choice"),
});

export const QuestionZodSchema = z.object({
  question: z.string().describe("The question to ask the user"),
  choices: z.array(ChoiceZodSchema).describe("The choices to offer the user"),
  feedback: z.object({
    emoji: z.string().describe("The emoji of the feedback"),
    label: z.string().describe("The label of the feedback"),
  }),
  isLast: z.boolean().describe("Whether the question is the last one"),
});

export const TagsZodSchema = z.object({
  tags: z
    .array(z.string())
    .min(6)
    .max(10)
    .describe(
      "Array of 6-10 lowercase, hyphenated tag values extracted from the user's input"
    ),
});

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
