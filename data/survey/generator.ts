import { initialFeedbacks, initialQuestions } from "./constants";
import { Question } from "./types";

/**
 * Generates the initial survey question with predefined choices and random feedback.
 * This is the first question shown to users, asking about their current activity preference.
 *
 * @returns A Question object with random initial question text and feedback
 */
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
