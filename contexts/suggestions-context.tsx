import { generateSuggestions, Suggestion } from "@/data/suggestions";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSurvey } from "./survey-context";

interface SuggestionsContextType {
  isLoading: boolean;
  suggestions: Suggestion[];
  selectedSuggestionIds: string[];
  currentIndex: number;
  fetchSuggestions: () => void;
  error: string | null;
  handleSkip: () => void;
  handleSelect: (suggestionId: string) => void;
}

const SuggestionsContext = createContext<SuggestionsContextType | undefined>(
  undefined
);

interface SuggestionsProviderProps {
  children: ReactNode;
}

export function SuggestionsProvider({ children }: SuggestionsProviderProps) {
  const { answers, isComplete } = useSurvey();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<string[]>(
    []
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    if (!isComplete || answers.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const dummySuggestions = generateSuggestions(answers);
      setSuggestions(dummySuggestions);
      setCurrentIndex(0);
    } catch {
      setError("Failed to load suggestions");
    } finally {
      setIsLoading(false);
    }
  }, [answers, isComplete]);

  const handleSkip = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      return next >= suggestions.length ? 0 : next;
    });
  }, [suggestions.length]);

  const handleSelect = useCallback((suggestionId: string) => {
    setSelectedSuggestionIds((prev) => [...prev, suggestionId]);
  }, []);

  useEffect(() => {
    if (answers.length === 0) {
      setSuggestions([]);
      setCurrentIndex(0);
      setSelectedSuggestionIds([]);
    }
  }, [answers]);

  return (
    <SuggestionsContext.Provider
      value={{
        isLoading,
        suggestions,
        selectedSuggestionIds,
        currentIndex,
        fetchSuggestions,
        error,
        handleSkip,
        handleSelect,
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
