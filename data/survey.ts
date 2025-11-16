export interface Question {
  question: string;
  choices: Choice[];
  feedback: string;
  end: boolean;
}

export interface Choice {
  label: string;
  emoji: string;
  value: string;
}

const initialFeedbacks: string[] = [
  "🔥 fire",
  "💯 solid",
  "nice 👍",
  "perfect ✨",
  "got it ✅",
  "love it ❤️",
  "mood 😎",
];

export const generateInitialQuestion = (): Question => {
  return {
    question: "What's your vibe today?",
    choices: [
      { label: "Eat", emoji: "🍔", value: "eat" },
      { label: "Drink", emoji: "🥂", value: "drink" },
      { label: "Work", emoji: "🧑‍💻", value: "work" },
      { label: "Hangout", emoji: "🎲", value: "hangout" },
    ],
    feedback:
      initialFeedbacks[Math.floor(Math.random() * initialFeedbacks.length)],
    end: false,
  };
};
