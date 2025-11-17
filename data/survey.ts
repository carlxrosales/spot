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

const initialQuestions: string[] = [
  "What's your vibe rn?",
  "What's the move?",
  "What you feeling?",
  "What's the plan?",
  "What you on?",
];

const initialFeedbacks: string[] = [
  "🔥 fire",
  "💯 solid",
  "nice 👍",
  "mood 😎",
  "bet 🤝",
  "yessir 🔥",
  "that's it 💯",
];

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
    end: false,
  };
};
