import { Choice, ChoiceFeedback } from "./types";

/**
 * Predefined "sponty" choice option for survey questions.
 */
export const SpontyChoice: Choice = {
  label: "sponty",
  emoji: "🚀",
  value: "sponty",
};

/**
 * Array of initial question prompts for the survey.
 * Randomly selected when generating the first survey question.
 */
export const initialQuestions: string[] = [
  "What's your vibe rn?",
  "What's the move?",
  "What you feeling?",
  "What's the plan?",
  "What you on?",
];

/**
 * Array of initial feedback messages for survey choices.
 * Randomly selected when generating the first survey question.
 */
export const initialFeedbacks: ChoiceFeedback[] = [
  { emoji: "🔥", label: "fire" },
  { emoji: "💯", label: "solid" },
  { emoji: "👍", label: "nice" },
  { emoji: "😎", label: "mood" },
  { emoji: "🤝", label: "bet" },
  { emoji: "🔥", label: "yessir" },
  { emoji: "💯", label: "that's it" },
];
