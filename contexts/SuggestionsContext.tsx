import { generateSuggestions, Suggestion } from "@/data/suggestions";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { useSurvey } from "./SurveyContext";

interface SuggestionsContextType {
  isLoading: boolean;
  suggestions: Suggestion[];
  currentIndex: number;
  fetchSuggestions: () => void;
  error: string | null;
  handleSwipeLeft: () => void;
  handleSwipeRight: () => void;
}

const SuggestionsContext = createContext<SuggestionsContextType | undefined>(
  undefined
);

interface SuggestionsProviderProps {
  children: ReactNode;
}

export function SuggestionsProvider({ children }: SuggestionsProviderProps) {
  const { choices, isComplete } = useSurvey();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    // if (!isComplete || choices.length === 0) {
    //   return;
    // }

    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const dummySuggestions = generateSuggestions(choices);
      setSuggestions(dummySuggestions);
      setCurrentIndex(0);
    } catch (err) {
      setError("Failed to load suggestions");
    } finally {
      setIsLoading(false);
    }
  }, [choices, isComplete]);

  const handleSwipeLeft = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      return next >= suggestions.length ? 0 : next;
    });
  }, [suggestions.length]);

  const handleSwipeRight = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      return next >= suggestions.length ? 0 : next;
    });
  }, [suggestions.length]);

  return (
    <SuggestionsContext.Provider
      value={{
        isLoading,
        suggestions,
        currentIndex,
        fetchSuggestions,
        error,
        handleSwipeLeft,
        handleSwipeRight,
      }}
    >
      {children}
    </SuggestionsContext.Provider>
  );
}

export function useSuggestions() {
  const context = useContext(SuggestionsContext);
  if (context === undefined) {
    throw new Error(
      "useSuggestionsContext must be used within a SuggestionsProvider"
    );
  }
  return context;
}
