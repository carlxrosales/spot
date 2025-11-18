export interface Choice {
  label: string;
  emoji: string;
  value: string;
}

export interface ChoiceFeedback {
  emoji: string;
  label: string;
}

export interface Question {
  question: string;
  choices: Choice[];
  feedback: ChoiceFeedback;
  isLast: boolean;
}
