import { Choice, ChoiceFeedback } from "./types";

export const SpontyChoice: Choice = {
  label: "sponty",
  emoji: "🚀",
  value: "sponty",
};

export const initialQuestions: string[] = [
  "What's your vibe rn?",
  "What's the move?",
  "What you feeling?",
  "What's the plan?",
  "What you on?",
];

export const initialFeedbacks: ChoiceFeedback[] = [
  { emoji: "🔥", label: "fire" },
  { emoji: "💯", label: "solid" },
  { emoji: "👍", label: "nice" },
  { emoji: "😎", label: "mood" },
  { emoji: "🤝", label: "bet" },
  { emoji: "🔥", label: "yessir" },
  { emoji: "💯", label: "that's it" },
];
