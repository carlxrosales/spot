import { generateInitialQuestion, Question } from "@/data/survey";
import { generateNextQuestion } from "@/services/openai";
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
    generateInitialQuestion(),
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const currentQuestion = questions[currentStep];

  const handleChoicePress = async (choice: string) => {
    // Start exit animation
    setIsAnimatingOut(true);

    // Wait for exit animation to complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Clear exit animation state and start loading
    setIsAnimatingOut(false);
    setIsLoading(true);
    setError(null);

    try {
      const updatedChoices = [...choices, choice];
      const nextQuestion = await generateNextQuestion(
        questions,
        updatedChoices
      );

      if (!nextQuestion) {
        setError("Failed to generate question");
        return;
      }

      if (nextQuestion.end) {
        setIsComplete(true);
        return;
      }

      setQuestions((prev) => [...prev, nextQuestion]);
      setChoices(updatedChoices);
      setCurrentStep(currentStep + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate question"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setCurrentStep(0);
    setChoices([]);
    setQuestions([generateInitialQuestion()]);
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
