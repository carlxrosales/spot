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
