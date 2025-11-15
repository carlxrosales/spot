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

export const initialCategoryQuestion: Question = {
  question: "What's your vibe today?",
  choices: [
    { label: "Eat", emoji: "🍔", value: "eat" },
    { label: "Drink", emoji: "🥂", value: "drink" },
    { label: "Work", emoji: "🧑‍💻", value: "work" },
    { label: "Hangout", emoji: "🎲", value: "hangout" },
  ],
  feedback: "✅ bet",
  end: false,
};
