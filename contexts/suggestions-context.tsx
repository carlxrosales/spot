import { generateSuggestions, Suggestion } from "@/data/suggestions";
import { DEFAULT_MAX_DISTANCE_IN_KM } from "@/data/suggestions/constants";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocation } from "./location-context";
import { useSurvey } from "./survey-context";

interface SuggestionsContextType {
  isLoading: boolean;
  suggestions: Suggestion[];
  selectedSuggestionIds: string[];
  currentIndex: number;
  maxDistanceInKm: number;
  fetchSuggestions: () => void;
  error: string | null;
  handleSkip: () => void;
  handleSelect: (suggestionId: string) => void;
  handleFilterByDistance: (distanceInKm: number) => void;
}

const SuggestionsContext = createContext<SuggestionsContextType | undefined>(
  undefined
);

interface SuggestionsProviderProps {
  children: ReactNode;
}

export function SuggestionsProvider({ children }: SuggestionsProviderProps) {
  const { answers, isComplete } = useSurvey();
  const { location } = useLocation();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<string[]>(
    []
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [maxDistanceInKm, setMaxDistanceInKm] = useState<number>(
    DEFAULT_MAX_DISTANCE_IN_KM
  );

  const fetchSuggestions = useCallback(async () => {
    if (!isComplete || answers.length === 0 || !location) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const dummySuggestions = generateSuggestions(
        answers,
        location,
        maxDistanceInKm
      );
      setSuggestions(dummySuggestions);
      setCurrentIndex(0);
    } catch {
      setError("Failed to load suggestions");
    } finally {
      setIsLoading(false);
    }
  }, [answers, isComplete, location, maxDistanceInKm]);

  const handleSkip = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      return next >= suggestions.length ? 0 : next;
    });
  }, [suggestions.length]);

  const handleSelect = useCallback((suggestionId: string) => {
    setSelectedSuggestionIds((prev) => [...prev, suggestionId]);
  }, []);

  const handleFilterByDistance = useCallback(
    (distanceInKm: number) => {
      setMaxDistanceInKm(distanceInKm);
      fetchSuggestions();
    },
    [fetchSuggestions]
  );

  useEffect(() => {
    if (answers.length === 0) {
      setSuggestions([]);
      setCurrentIndex(0);
      setSelectedSuggestionIds([]);
      setIsLoading(true);
      setError(null);
    }
  }, [answers]);

  return (
    <SuggestionsContext.Provider
      value={{
        isLoading,
        suggestions,
        selectedSuggestionIds,
        currentIndex,
        maxDistanceInKm,
        fetchSuggestions,
        error,
        handleSkip,
        handleSelect,
        handleFilterByDistance,
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
