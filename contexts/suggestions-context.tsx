import { useSurvey } from "@/contexts/survey-context";
import {
  DEFAULT_MAX_DISTANCE_IN_KM,
  DEFAULT_MIN_DISTANCE_IN_KM,
  DISTANCE_OPTIONS,
  generateSuggestions,
  loadFirstPhotoForSuggestion,
  loadPhotoByName as loadPhotoByNameUtil,
  MINIMUM_SUGGESTIONS_COUNT,
  Suggestion,
} from "@/data/suggestions";
import { LocationCoordinates } from "@/data/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Image } from "react-native";

interface SuggestionsContextType {
  isLoading: boolean;
  suggestions: Suggestion[];
  selectedSuggestionIds: string[];
  initialMaxDistance: number;
  currentIndex: number;
  hasFetched: boolean;
  setHasFetched: (hasFetched: boolean) => void;
  fetchSuggestions: (location: LocationCoordinates) => void;
  error: string | null;
  handleSkip: () => void;
  handleSelect: (suggestionId: string) => void;
  filterSuggestions: (
    minDistance: number,
    maxDistance: number
  ) => Promise<void>;
  loadPhotoByName: (suggestionId: string, photoName: string) => Promise<void>;
  getPhotoUris: (suggestionId: string) => string[] | undefined;
  getPhotoUri: (suggestionId: string, photoName: string) => string | undefined;
}

const SuggestionsContext = createContext<SuggestionsContextType | undefined>(
  undefined
);

interface SuggestionsProviderProps {
  children: ReactNode;
}

export function SuggestionsProvider({ children }: SuggestionsProviderProps) {
  const { questions, answers } = useSurvey();
  const [allSuggestions, setAllSuggestions] = useState<Suggestion[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [photoUrisMap, setPhotoUrisMap] = useState<
    Map<string, Map<string, string>>
  >(new Map());
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<string[]>(
    []
  );
  const [initialMaxDistance, setInitialMaxDistance] = useState<number>(
    DEFAULT_MAX_DISTANCE_IN_KM
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(
    async (location: LocationCoordinates) => {
      if (
        !location?.lat ||
        !location?.lng ||
        isLoading ||
        hasFetched ||
        answers.length === 0
      ) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const newSuggestions = await generateSuggestions(
          questions,
          answers,
          location
        );
        setAllSuggestions(newSuggestions);

        const filterByDistance = (maxDistance: number) =>
          newSuggestions.filter(
            (suggestion) =>
              !suggestion.distanceInKm ||
              (suggestion.distanceInKm > DEFAULT_MIN_DISTANCE_IN_KM &&
                suggestion.distanceInKm <= maxDistance)
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

          setInitialMaxDistance(finalMaxDistance);
        }

        if (filteredSuggestions.length > 0) {
          const firstSuggestion = filteredSuggestions[0];
          if (firstSuggestion.photos.length > 0) {
            const firstPhotoUri = await loadFirstPhotoForSuggestion(
              firstSuggestion
            );
            if (firstPhotoUri) {
              setPhotoUrisMap((prev) => {
                const updated = new Map(prev);
                const photoMap = new Map<string, string>();
                photoMap.set(firstSuggestion.photos[0], firstPhotoUri);
                updated.set(firstSuggestion.id, photoMap);
                return updated;
              });
              await Image.prefetch(firstPhotoUri).catch(() => {});
            }
          }
        }

        setSuggestions(filteredSuggestions);
        setCurrentIndex(0);
      } catch {
        setError("Yikes! Somethin' went wrong");
      } finally {
        setIsLoading(false);
        setHasFetched(true);
      }
    },
    [questions, answers, isLoading, hasFetched]
  );

  const filterSuggestions = useCallback(
    async (minDistance: number, maxDistance: number) => {
      const filteredSuggestions = allSuggestions.filter(
        (suggestion) =>
          suggestion.distanceInKm !== undefined &&
          suggestion.distanceInKm > minDistance &&
          suggestion.distanceInKm <= maxDistance
      );

      if (filteredSuggestions.length > 0) {
        const firstSuggestion = filteredSuggestions[0];
        if (firstSuggestion.photos.length > 0) {
          const firstPhotoUri = await loadFirstPhotoForSuggestion(
            firstSuggestion
          );
          if (firstPhotoUri) {
            setPhotoUrisMap((prev) => {
              const updated = new Map(prev);
              const photoMap = new Map<string, string>();
              photoMap.set(firstSuggestion.photos[0], firstPhotoUri);
              updated.set(firstSuggestion.id, photoMap);
              return updated;
            });
            await Image.prefetch(firstPhotoUri).catch(() => {});
          }
        }
      }

      setSuggestions(filteredSuggestions);
      setCurrentIndex(0);
    },
    [allSuggestions]
  );

  const handleSkip = useCallback(async () => {
    const nextIndex =
      currentIndex + 1 >= suggestions.length ? 0 : currentIndex + 1;

    const nextSuggestion = suggestions[nextIndex];
    const updatedMap = new Map(photoUrisMap);

    if (nextSuggestion && nextSuggestion.photos.length > 0) {
      const nextPhotoMap = updatedMap.get(nextSuggestion.id);
      const firstPhotoName = nextSuggestion.photos[0];
      if (!nextPhotoMap || !nextPhotoMap.has(firstPhotoName)) {
        const photoUri = await loadFirstPhotoForSuggestion(nextSuggestion);
        if (photoUri) {
          const photoMap = new Map<string, string>();
          photoMap.set(firstPhotoName, photoUri);
          updatedMap.set(nextSuggestion.id, photoMap);

          await Image.prefetch(photoUri).catch(() => {});
        }
      }
    }

    setPhotoUrisMap(updatedMap);
    setCurrentIndex(nextIndex);
  }, [currentIndex, suggestions, photoUrisMap]);

  const handleSelect = useCallback((suggestionId: string) => {
    setSelectedSuggestionIds((prev) =>
      prev.includes(suggestionId) ? prev : [...prev, suggestionId]
    );
  }, []);

  const getPhotoUris = useCallback(
    (suggestionId: string) => {
      const photoMap = photoUrisMap.get(suggestionId);
      if (!photoMap) return undefined;
      const suggestion = suggestions.find((s) => s.id === suggestionId);
      if (!suggestion) return undefined;
      return suggestion.photos
        .map((photoName) => photoMap.get(photoName))
        .filter((uri): uri is string => uri !== undefined);
    },
    [photoUrisMap, suggestions]
  );

  const getPhotoUri = useCallback(
    (suggestionId: string, photoName: string) => {
      const photoMap = photoUrisMap.get(suggestionId);
      return photoMap?.get(photoName);
    },
    [photoUrisMap]
  );

  const loadPhotoByName = useCallback(
    async (suggestionId: string, photoName: string) => {
      const photoMap = photoUrisMap.get(suggestionId);
      if (photoMap?.has(photoName)) {
        return;
      }

      const photoUri = await loadPhotoByNameUtil(photoName);
      if (photoUri) {
        setPhotoUrisMap((prev) => {
          const updated = new Map(prev);
          const existing =
            updated.get(suggestionId) || new Map<string, string>();
          existing.set(photoName, photoUri);
          updated.set(suggestionId, existing);
          return updated;
        });
        await Image.prefetch(photoUri).catch(() => {});
      }
    },
    [photoUrisMap]
  );

  useEffect(() => {
    if (!isLoading && suggestions.length === 1 && hasFetched) {
      setSuggestions((prev) => [...prev, ...prev]);
    }
  }, [suggestions, isLoading, hasFetched]);

  useEffect(() => {
    if (answers.length === 0) {
      setInitialMaxDistance(DEFAULT_MAX_DISTANCE_IN_KM);
      setAllSuggestions([]);
      setSuggestions([]);
      setPhotoUrisMap(new Map<string, Map<string, string>>());
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
        initialMaxDistance,
        currentIndex,
        hasFetched,
        setHasFetched,
        fetchSuggestions,
        error,
        handleSkip,
        handleSelect,
        filterSuggestions,
        loadPhotoByName,
        getPhotoUris,
        getPhotoUri,
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
