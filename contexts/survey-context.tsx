import { Animation } from "@/constants/theme";
import { generateInitialQuestion, Question } from "@/data/survey";
import { generateNextQuestion } from "@/services/gemini";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface SurveyContextType {
  answers: string[];
  setAnswers: (answers: string[]) => void;
  currentQuestion: Question | undefined;
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  isComplete: boolean;
  setIsComplete: (isComplete: boolean) => void;
  handleChoicePress: (value: string) => Promise<void>;
  handleStartOver: () => void;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

interface SurveyProviderProps {
  children: ReactNode;
}

export function SurveyProvider({ children }: SurveyProviderProps) {
  const [answers, setAnswers] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([
    generateInitialQuestion(),
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const currentQuestion = useMemo(
    () => questions[questions.length - 1],
    [questions]
  );

  const handleChoicePress = useCallback(
    async (choice: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedAnswers = [...answers, choice];

        if (currentQuestion?.isLast) {
          setAnswers(updatedAnswers);
          setQuestions((prev) => [...prev, prev[prev.length - 1]]);
          await new Promise((resolve) =>
            setTimeout(resolve, Animation.duration.slow)
          );
          setIsComplete(true);
          return;
        }

        const nextQuestion = await generateNextQuestion(
          questions,
          updatedAnswers
        );

        if (!nextQuestion) {
          setError("Yo! Somethin' went wrong");
          return;
        }

        setQuestions((prev) => [...prev, nextQuestion]);
        setAnswers(updatedAnswers);
      } catch {
        setError("Yo! Somethin' went wrong, let's start over");
      } finally {
        setIsLoading(false);
      }
    },
    [answers, currentQuestion, questions]
  );

  const handleStartOver = useCallback(() => {
    setAnswers([]);
    setQuestions([generateInitialQuestion()]);
    setIsLoading(false);
    setError(null);
    setIsComplete(false);
  }, []);

  return (
    <SurveyContext.Provider
      value={{
        answers,
        setAnswers,
        currentQuestion,
        questions,
        isLoading,
        error,
        isComplete,
        setIsComplete,
        handleChoicePress,
        handleStartOver,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (context === undefined) {
    throw new Error("useSurveyContext must be used within a SurveyProvider");
  }
  return context;
}
