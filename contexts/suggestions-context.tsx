import { generateSuggestions, Suggestion } from "@/data/suggestions";
import {
  DEFAULT_MAX_DISTANCE_IN_KM,
  DEFAULT_MIN_DISTANCE_IN_KM,
  DISTANCE_OPTIONS,
  MINIMUM_SUGGESTIONS_COUNT,
} from "@/data/suggestions/constants";
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
  hasFetched: boolean;
  setHasFetched: (hasFetched: boolean) => void;
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
  const { location, hasPermission } = useLocation();
  const [allSuggestions, setAllSuggestions] = useState<Suggestion[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<string[]>(
    []
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [maxDistanceInKm, setMaxDistanceInKm] = useState<number>(
    DEFAULT_MAX_DISTANCE_IN_KM
  );
  const [minDistanceInKm, setMinDistanceInKm] = useState<number>(
    DEFAULT_MIN_DISTANCE_IN_KM
  );

  const fetchSuggestions = useCallback(async () => {
    if (
      !isComplete ||
      !location ||
      !hasPermission ||
      isLoading ||
      hasFetched ||
      answers.length === 0
    ) {
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

      const filterByDistance = (maxDistance: number) =>
        newSuggestions.filter(
          (suggestion) =>
            suggestion.distanceInKm !== undefined &&
            suggestion.distanceInKm > DEFAULT_MIN_DISTANCE_IN_KM &&
            suggestion.distanceInKm <= maxDistance
        );

      let filteredSuggestions = filterByDistance(DEFAULT_MAX_DISTANCE_IN_KM);
      let finalMaxDistance = DEFAULT_MAX_DISTANCE_IN_KM;

      if (filteredSuggestions.length < MINIMUM_SUGGESTIONS_COUNT) {
        const defaultMaxIndex = DISTANCE_OPTIONS.findIndex(
          (option) => option >= DEFAULT_MAX_DISTANCE_IN_KM
        );
        const startIndex = defaultMaxIndex >= 0 ? defaultMaxIndex + 1 : 0;

        for (
          let i = startIndex;
          i < DISTANCE_OPTIONS.length && filteredSuggestions.length < 8;
          i++
        ) {
          finalMaxDistance = DISTANCE_OPTIONS[i];
          filteredSuggestions = filterByDistance(finalMaxDistance);
        }

        setMaxDistanceInKm(finalMaxDistance);
      }
      setSuggestions(filteredSuggestions);
      setCurrentIndex(0);
    } catch {
      setError("Failed to load suggestions");
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [answers, location, hasPermission, isLoading, hasFetched]);

  const filterSuggestions = useCallback(
    (minDistance: number, maxDistance: number) => {
      setSuggestions(
        allSuggestions.filter(
          (suggestion) =>
            suggestion.distanceInKm !== undefined &&
            suggestion.distanceInKm > minDistance &&
            suggestion.distanceInKm <= maxDistance
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
    setSelectedSuggestionIds((prev) =>
      prev.includes(suggestionId) ? prev : [...prev, suggestionId]
    );
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
    if (!isLoading && suggestions.length === 1 && hasFetched) {
      setSuggestions((prev) => [...prev, ...prev]);
    }
  }, [suggestions, isLoading, hasFetched]);

  useEffect(() => {
    if (answers.length === 0) {
      setMinDistanceInKm(DEFAULT_MIN_DISTANCE_IN_KM);
      setMaxDistanceInKm(DEFAULT_MAX_DISTANCE_IN_KM);
      setAllSuggestions([]);
      setSuggestions([]);
      setCurrentIndex(0);
      setSelectedSuggestionIds([]);
      setIsLoading(false);
      setHasFetched(false);
      setError(null);
    }
  }, [answers.length]);

  return (
    <SuggestionsContext.Provider
      value={{
        isLoading,
        suggestions,
        selectedSuggestionIds,
        currentIndex,
        maxDistanceInKm,
        minDistanceInKm,
        hasFetched,
        setHasFetched,
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
