export interface Choice {
  label: string;
  emoji: string;
  value: string;
}

interface ChoiceFeedback {
  emoji: string;
  label: string;
}

export interface Question {
  question: string;
  choices: Choice[];
  feedback: ChoiceFeedback;
  end: boolean;
}

export const ImFeelingSpontyChoice: Choice = {
  label: "I'm feeling sponty",
  emoji: "🚀",
  value: "im-feeling-sponty",
};

const initialQuestions: string[] = [
  "What's your vibe rn?",
  "What's the move?",
  "What you feeling?",
  "What's the plan?",
  "What you on?",
];

const initialFeedbacks: ChoiceFeedback[] = [
  { emoji: "🔥", label: "fire" },
  { emoji: "💯", label: "solid" },
  { emoji: "👍", label: "nice" },
  { emoji: "😎", label: "mood" },
  { emoji: "🤝", label: "bet" },
  { emoji: "🔥", label: "yessir" },
  { emoji: "💯", label: "that's it" },
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
