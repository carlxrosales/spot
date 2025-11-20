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
  fetchSuggestions: (location: LocationCoordinates) => void;
  error: string | null;
  handleSkip: () => void;
  handleSelect: (suggestionId: string) => void;
  handleFilterByDistance: (
    minDistanceInKm: number,
    maxDistanceInKm: number
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
  const { answers } = useSurvey();
  const { displayToast } = useToast();
  const [allSuggestions, setAllSuggestions] = useState<Suggestion[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [photoUrisMap, setPhotoUrisMap] = useState<
    Map<string, Map<string, string>>
  >(new Map());
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

  const fetchSuggestions = useCallback(
    async (location: LocationCoordinates) => {
      console.log(
        "fetchSuggestions",
        location,
        isLoading,
        hasFetched,
        answers.length === 0
      );
      if (!location || isLoading || hasFetched || answers.length === 0) {
        return;
      }

      setIsLoading(true);
      setError(null);

      const MAX_RETRIES = 3;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const newSuggestions = await generateSuggestions(answers, location);
          setAllSuggestions(newSuggestions);

          const filterByDistance = (maxDistance: number) =>
            newSuggestions.filter(
              (suggestion) =>
                suggestion.distanceInKm !== undefined &&
                suggestion.distanceInKm > DEFAULT_MIN_DISTANCE_IN_KM &&
                suggestion.distanceInKm <= maxDistance
            );

          let filteredSuggestions = filterByDistance(
            DEFAULT_MAX_DISTANCE_IN_KM
          );
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
          setIsLoading(false);
          setHasFetched(true);
          return;
        } catch {
          const isLastAttempt = attempt === MAX_RETRIES;

          if (isLastAttempt) {
            setError("Yikes! Somethin' went wrong");
            displayToast({
              message: "Yikes! Somethin' went wrong",
            });
          }
        }
      }

      setIsLoading(false);
      setHasFetched(true);
    },
    [answers, isLoading, hasFetched]
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

    if (nextIndex >= suggestions.length) {
      displayToast({
        message: "Aw! We've run out of spots, looping back...",
      });
    }

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
  }, [currentIndex, suggestions, photoUrisMap, displayToast]);

  const handleSelect = useCallback((suggestionId: string) => {
    setSelectedSuggestionIds((prev) =>
      prev.includes(suggestionId) ? prev : [...prev, suggestionId]
    );
  }, []);

  const handleFilterByDistance = useCallback(
    async (minDistance: number, maxDistance: number) => {
      setMinDistanceInKm(minDistance);
      setMaxDistanceInKm(maxDistance);
      await filterSuggestions(minDistance, maxDistance);
    },
    [filterSuggestions]
  );

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
      setMinDistanceInKm(DEFAULT_MIN_DISTANCE_IN_KM);
      setMaxDistanceInKm(DEFAULT_MAX_DISTANCE_IN_KM);
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
