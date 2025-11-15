import { initialCategoryQuestion, Question } from "@/data/survey";
import { generateQuestion } from "@/services/openai";
import { createContext, ReactNode, useContext, useState } from "react";

interface SurveyContextType {
  currentStep: number;
  choices: string[];
  currentQuestion: Question | undefined;
  questions: Question[];
  isLoading: boolean;
  isAnimatingOut: boolean;
  error: string | null;
  isComplete: boolean;
  handleChoicePress: (value: string) => Promise<void>;
  handleStartOver: () => void;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

interface SurveyProviderProps {
  children: ReactNode;
}

export function SurveyProvider({ children }: SurveyProviderProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([
    initialCategoryQuestion,
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const currentQuestion = questions[currentStep];

  const getCategory = (): string | null => {
    return choices[0] || null;
  };

  const handleChoicePress = async (value: string) => {
    const newChoices = [...choices, value];
    setChoices(newChoices);

    const category = getCategory();
    const currentQuestion = questions[currentStep];

    // Start exit animation
    setIsAnimatingOut(true);

    // Wait for exit animation to complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Clear exit animation state and start loading
    setIsAnimatingOut(false);
    setIsLoading(true);
    setError(null);

    if (!category) {
      try {
        const previousQuestions = questions
          .slice(1) // Skip initial category question
          .map((q) => q.question);
        const previousFeedback = questions
          .slice(1) // Skip initial category question
          .map((q) => q.feedback)
          .filter((f) => f); // Filter out empty feedback
        const nextQuestion = await generateQuestion(
          value,
          [],
          previousQuestions,
          previousFeedback
        );
        setQuestions((prev) => [...prev, nextQuestion]);
        setCurrentStep(currentStep + 1);

        if (nextQuestion.end) {
          setIsComplete(true);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate question"
        );
        console.error("Error generating question:", err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const previousQuestions = questions
        .slice(1) // Skip initial category question
        .map((q) => q.question);
      const previousFeedback = questions
        .slice(1) // Skip initial category question
        .map((q) => q.feedback)
        .filter((f) => f); // Filter out empty feedback
      const nextQuestion = await generateQuestion(
        category,
        newChoices.slice(1),
        previousQuestions,
        previousFeedback
      );
      setQuestions((prev) => [...prev, nextQuestion]);
      setCurrentStep(currentStep + 1);

      if (nextQuestion.end) {
        setIsComplete(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate question"
      );
      console.error("Error generating question:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setCurrentStep(0);
    setChoices([]);
    setQuestions([initialCategoryQuestion]);
    setIsLoading(false);
    setIsAnimatingOut(false);
    setError(null);
    setIsComplete(false);
  };

  return (
    <SurveyContext.Provider
      value={{
        currentStep,
        choices,
        currentQuestion,
        questions,
        isLoading,
        isAnimatingOut,
        error,
        isComplete,
        handleChoicePress,
        handleStartOver,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurveyContext() {
  const context = useContext(SurveyContext);
  if (context === undefined) {
    throw new Error("useSurveyContext must be used within a SurveyProvider");
  }
  return context;
}
