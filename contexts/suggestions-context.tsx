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
import { Image } from "react-native";
import { useLocation } from "./location-context";
import { useSurvey } from "./survey-context";
import { useToast } from "./toast-context";

interface SuggestionsContextType {
  isLoading: boolean;
  suggestions: Suggestion[];
  selectedSuggestionIds: string[];
  currentIndex: number;
  maxDistanceInKm: number;
  minDistanceInKm: number;
  fetchSuggestions: () => void;
  error: string | null;
  handleSkip: () => void;
  handleSelect: (suggestionId: string) => void;
  handleFilterByDistance: (
    minDistanceInKm: number,
    maxDistanceInKm: number
  ) => void;
}

const SuggestionsContext = createContext<SuggestionsContextType | undefined>(
  undefined
);

interface SuggestionsProviderProps {
  children: ReactNode;
}

export function SuggestionsProvider({ children }: SuggestionsProviderProps) {
  const { answers, isComplete } = useSurvey();
  const { displayToast } = useToast();
  const { location } = useLocation();
  const [allSuggestions, setAllSuggestions] = useState<Suggestion[]>([]);
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
  const [minDistanceInKm, setMinDistanceInKm] = useState<number>(0);

  const fetchSuggestions = useCallback(async () => {
    if (!isComplete || answers.length === 0 || !location) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newSuggestions = await generateSuggestions(answers, location);
      setAllSuggestions(newSuggestions);

      if (newSuggestions.length > 0) {
        const firstSuggestion = newSuggestions[0];
        if (firstSuggestion.photoUris && firstSuggestion.photoUris.length > 0) {
          await Promise.all(
            firstSuggestion.photoUris.map((photo) =>
              Image.prefetch(photo).catch(() => {})
            )
          );
        }
      }

      // Treat 250 as 1000 for maximum distance filtering
      const effectiveMaxDistance =
        maxDistanceInKm === 250 ? 1000 : maxDistanceInKm;

      const filteredSuggestions = newSuggestions.filter(
        (suggestion) =>
          suggestion.distanceInKm !== undefined &&
          suggestion.distanceInKm > minDistanceInKm &&
          suggestion.distanceInKm <= effectiveMaxDistance
      );

      setSuggestions(filteredSuggestions);
      setCurrentIndex(0);
    } catch {
      setError("Failed to load suggestions");
    } finally {
      setIsLoading(false);
    }
  }, [answers, isComplete, location, minDistanceInKm, maxDistanceInKm]);

  const filterSuggestions = useCallback(
    (minDistance: number, maxDistance: number) => {
      // Treat 250 as 1000 for maximum distance filtering
      const effectiveMaxDistance = maxDistance === 250 ? 1000 : maxDistance;

      setSuggestions(
        allSuggestions.filter(
          (suggestion) =>
            suggestion.distanceInKm !== undefined &&
            suggestion.distanceInKm > minDistance &&
            suggestion.distanceInKm <= effectiveMaxDistance
        )
      );
      setCurrentIndex(0);
    },
    [allSuggestions]
  );

  const handleSkip = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= suggestions.length) {
        displayToast({
          message: "Aw! We've run out of spots, looping back...",
        });
      }
      return next >= suggestions.length ? 0 : next;
    });
  }, [suggestions.length]);

  const handleSelect = useCallback((suggestionId: string) => {
    setSelectedSuggestionIds((prev) => [...prev, suggestionId]);
  }, []);

  const handleFilterByDistance = useCallback(
    (minDistance: number, maxDistance: number) => {
      setMinDistanceInKm(minDistance);
      setMaxDistanceInKm(maxDistance);
      filterSuggestions(minDistance, maxDistance);
    },
    [filterSuggestions]
  );

  useEffect(() => {
    suggestions
      .slice(currentIndex, currentIndex + 2)
      .forEach((suggestion: Suggestion) => {
        const photosToPrefetch = suggestion.photoUris;
        if (photosToPrefetch) {
          photosToPrefetch.forEach((photo) => {
            Image.prefetch(photo).catch(() => {});
          });
        }
      });
  }, [suggestions, currentIndex]);

  useEffect(() => {
    if (suggestions.length === 1) {
      setSuggestions((prev) => [...prev, ...prev]);
    }
  }, [suggestions]);

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
        minDistanceInKm,
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
