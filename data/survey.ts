// ============================================================================
// TYPES
// ============================================================================

/**
 * Represents a single choice option in a survey question.
 */
export interface Choice {
  /** Display label for the choice */
  label: string;

  /** Emoji icon for the choice */
  emoji: string;

  /** Value identifier for the choice (lowercase, hyphenated) */
  value: string;
}

/**
 * Represents feedback displayed when a user selects a choice.
 */
export interface ChoiceFeedback {
  /** Emoji icon for the feedback */
  emoji: string;

  /** Text label for the feedback (Gen Z slang) */
  label: string;
}

/**
 * Represents a complete survey question with choices and feedback.
 */
export interface Question {
  /** The question text to display */
  question: string;

  /** Array of choice options for the user to select from */
  choices: Choice[];

  /** Feedback message to display when a choice is selected */
  feedback: ChoiceFeedback;

  /** Whether this is the last question in the survey */
  isLast: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Predefined "sponty" choice option for survey questions.
 */
export const SpontyChoice: Choice = {
  label: "sponty",
  emoji: "🚀",
  value: "sponty",
};

/**
 * Predefined "lazy" choice option for survey questions.
 */
export const LazyChoice: Choice = {
  label: "lazy",
  emoji: "🤔",
  value: "lazy",
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

// ============================================================================
// FUNCTIONS
// ============================================================================

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
