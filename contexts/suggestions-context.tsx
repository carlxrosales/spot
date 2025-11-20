import {
  DEFAULT_MAX_DISTANCE_IN_KM,
  DEFAULT_MIN_DISTANCE_IN_KM,
  DISTANCE_OPTIONS,
  generateSuggestions,
  loadFirstPhoto,
  loadNextPhotoForSuggestion,
  loadPhotosForCurrentAndNextSuggestions,
  MINIMUM_SUGGESTIONS_COUNT,
  Suggestion,
} from "@/data/suggestions";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
  loadNextPhoto: (suggestionId: string) => Promise<void>;
  getPhotoUris: (suggestionId: string) => string[] | undefined;
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
  const [photoUrisMap, setPhotoUrisMap] = useState<Map<string, string[]>>(
    new Map()
  );
  const photoUrisMapRef = useRef(photoUrisMap);
  photoUrisMapRef.current = photoUrisMap;
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

      if (filteredSuggestions.length > 0) {
        const firstSuggestion = filteredSuggestions[0];
        if (firstSuggestion.photos.length > 0) {
          const firstPhotoUri = await loadFirstPhoto(firstSuggestion);
          if (firstPhotoUri) {
            setPhotoUrisMap((prev) => {
              const updated = new Map(prev);
              updated.set(firstSuggestion.id, [firstPhotoUri]);
              return updated;
            });
            await Image.prefetch(firstPhotoUri).catch(() => {});
          }
        }
      }
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

  const handleSkip = useCallback(async () => {
    const nextIndex =
      currentIndex + 1 >= suggestions.length ? 0 : currentIndex + 1;

    if (nextIndex >= suggestions.length) {
      displayToast({
        message: "Aw! We've run out of spots, looping back...",
      });
    }

    const nextSuggestion = suggestions[nextIndex];
    const nextNextSuggestion = suggestions[nextIndex + 1];
    const updatedMap = new Map(photoUrisMap);

    const loadPromises: Promise<void>[] = [];

    if (nextSuggestion && nextSuggestion.photos.length > 0) {
      const nextPhotoUris = updatedMap.get(nextSuggestion.id);
      if (!nextPhotoUris || nextPhotoUris.length === 0) {
        loadPromises.push(
          loadFirstPhoto(nextSuggestion).then((photoUri) => {
            if (photoUri) {
              updatedMap.set(nextSuggestion.id, [photoUri]);
            }
          })
        );
      }
    }

    if (nextNextSuggestion && nextNextSuggestion.photos.length > 0) {
      const nextNextPhotoUris = updatedMap.get(nextNextSuggestion.id);
      if (!nextNextPhotoUris || nextNextPhotoUris.length === 0) {
        loadPromises.push(
          loadFirstPhoto(nextNextSuggestion).then((photoUri) => {
            if (photoUri) {
              updatedMap.set(nextNextSuggestion.id, [photoUri]);
            }
          })
        );
      }
    }

    await Promise.all(loadPromises);
    setPhotoUrisMap(updatedMap);
    setCurrentIndex(nextIndex);
  }, [currentIndex, suggestions, photoUrisMap, displayToast]);

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

  const getPhotoUris = useCallback(
    (suggestionId: string) => {
      return photoUrisMap.get(suggestionId);
    },
    [photoUrisMap]
  );

  const loadNextPhoto = useCallback(
    async (suggestionId: string) => {
      const suggestion = suggestions.find((s) => s.id === suggestionId);
      if (!suggestion) return;

      const loadedPhotoCount = photoUrisMap.get(suggestionId)?.length || 0;
      const remainingPhotoUris = await loadNextPhotoForSuggestion(
        suggestion,
        loadedPhotoCount
      );

      if (remainingPhotoUris.length > 0) {
        setPhotoUrisMap((prev) => {
          const updated = new Map(prev);
          const existing = updated.get(suggestionId) || [];
          updated.set(suggestionId, [...existing, ...remainingPhotoUris]);
          return updated;
        });
      }
    },
    [suggestions, photoUrisMap]
  );

  useEffect(() => {
    const loadPhotos = async () => {
      if (suggestions.length === 0) return;

      const currentSuggestion = suggestions[currentIndex];
      const nextSuggestion = suggestions[currentIndex + 1];
      const currentMap = photoUrisMapRef.current;

      const currentPhotoUris = currentMap.get(currentSuggestion?.id);
      const nextPhotoUris = currentMap.get(nextSuggestion?.id);

      const needsCurrentLoad =
        currentSuggestion &&
        currentSuggestion.photos.length > 0 &&
        (!currentPhotoUris || currentPhotoUris.length === 0);

      const needsNextLoad =
        nextSuggestion &&
        nextSuggestion.photos.length > 0 &&
        (!nextPhotoUris || nextPhotoUris.length === 0);

      if (!needsCurrentLoad && !needsNextLoad) {
        if (currentPhotoUris?.[0]) {
          Image.prefetch(currentPhotoUris[0]).catch(() => {});
        }
        if (nextPhotoUris?.[0]) {
          Image.prefetch(nextPhotoUris[0]).catch(() => {});
        }
        return;
      }

      const updatedMap = await loadPhotosForCurrentAndNextSuggestions(
        suggestions,
        currentIndex,
        currentMap
      );

      const updatedCurrentPhotoUris = updatedMap.get(
        suggestions[currentIndex]?.id
      );
      const updatedNextPhotoUris = updatedMap.get(
        suggestions[currentIndex + 1]?.id
      );

      if (updatedCurrentPhotoUris?.[0]) {
        Image.prefetch(updatedCurrentPhotoUris[0]).catch(() => {});
      }
      if (updatedNextPhotoUris?.[0]) {
        Image.prefetch(updatedNextPhotoUris[0]).catch(() => {});
      }

      setPhotoUrisMap(updatedMap);
    };

    loadPhotos();
  }, [currentIndex, suggestions.length]);

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
      setPhotoUrisMap(new Map());
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
        loadNextPhoto,
        getPhotoUris,
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
