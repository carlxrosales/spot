import { generateInitialQuestion, Question } from "@/data/survey";
import { generateNextQuestion } from "@/services/openai";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface SurveyContextType {
  choices: string[];
  setChoices: (choices: string[]) => void;
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
  const [choices, setChoices] = useState<string[]>([]);
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
      } catch {
        setError("Failed to generate question, please start over.");
      } finally {
        setIsLoading(false);
      }
    },
    [choices, questions]
  );

  const handleStartOver = useCallback(() => {
    setChoices([]);
    setQuestions([generateInitialQuestion()]);
    setIsLoading(false);
    setError(null);
    setIsComplete(false);
  }, []);

  return (
    <SurveyContext.Provider
      value={{
        choices,
        setChoices,
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
