import { initialFeedbacks, initialQuestions } from "./constants";
import { Question } from "./types";

export const generateInitialQuestion = (): Question => {
  return {
    question:
      initialQuestions[Math.floor(Math.random() * initialQuestions.length)],
    choices: [
      { label: "Eat", emoji: "🍔", value: "eat" },
      { label: "Drink", emoji: "🥂", value: "drink" },
      { label: "Work", emoji: "🧑‍💻", value: "work" },
      { label: "Hangout", emoji: "🎲", value: "hangout" },
    ],
    feedback:
      initialFeedbacks[Math.floor(Math.random() * initialFeedbacks.length)],
    isLast: false,
  };
};
