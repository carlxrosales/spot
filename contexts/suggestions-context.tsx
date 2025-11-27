import { useSurvey } from "@/contexts/survey-context";
import {
  DEFAULT_MAX_DISTANCE_IN_KM,
  generateSuggestions,
  LAST_DISTANCE_OPTION,
  loadFirstPhotoForSuggestion,
  loadPhotoByName as loadPhotoByNameUtil,
  Suggestion,
} from "@/data/suggestions";
import { LocationCoordinates } from "@/data/types";
import { saveSpot } from "@/services/storage";
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
  filterOpenNow: boolean;
  filterCity: string | null;
  filterMaxDistance: number | null;
  setHasFetched: (hasFetched: boolean) => void;
  fetchSuggestions: (
    location: LocationCoordinates,
    forceRefetch?: boolean,
    openNowFilter?: boolean,
    cityFilter?: string | null,
    maxDistanceFilter?: number | null
  ) => Promise<void>;
  setFilterOpenNow: (filterOpenNow: boolean) => void;
  setFilterCity: (filterCity: string | null) => void;
  setFilterMaxDistance: (maxDistance: number | null) => void;
  error: string | null;
  handleSkip: () => void;
  handleSelect: (suggestionId: string) => void;
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
  const [filterOpenNow, setFilterOpenNow] = useState<boolean>(false);
  const [filterCity, setFilterCity] = useState<string | null>(null);
  const [filterMaxDistance, setFilterMaxDistance] = useState<number | null>(
    null
  );

  const fetchSuggestions = useCallback(
    async (
      location: LocationCoordinates,
      forceRefetch: boolean = false,
      openNowFilter?: boolean,
      cityFilter?: string | null,
      maxDistanceFilter?: number | null
    ) => {
      if (
        !location?.lat ||
        !location?.lng ||
        isLoading ||
        (hasFetched && !forceRefetch) ||
        answers.length === 0
      ) {
        return;
      }

      setIsLoading(true);
      setHasFetched(false);
      setError(null);
      setSuggestions([]);
      setCurrentIndex(0);
      setSelectedSuggestionIds([]);

      const openNowFilterValue =
        openNowFilter !== undefined ? openNowFilter : filterOpenNow;
      const cityFilterValue =
        cityFilter !== undefined ? cityFilter : filterCity;
      const maxDistanceFilterValue =
        maxDistanceFilter !== undefined ? maxDistanceFilter : filterMaxDistance;

      try {
        let newSuggestions: Suggestion[] = [];

        if (maxDistanceFilterValue === null) {
          newSuggestions = await generateSuggestions(
            questions,
            answers,
            location,
            openNowFilterValue,
            cityFilterValue,
            DEFAULT_MAX_DISTANCE_IN_KM
          );
          setInitialMaxDistance(DEFAULT_MAX_DISTANCE_IN_KM);
        } else {
          newSuggestions = await generateSuggestions(
            questions,
            answers,
            location,
            openNowFilterValue,
            cityFilterValue,
            maxDistanceFilterValue === LAST_DISTANCE_OPTION
              ? null
              : maxDistanceFilterValue
          );
        }

        if (newSuggestions.length > 0) {
          const firstSuggestion = newSuggestions[0];
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

        setSuggestions(newSuggestions);
        setCurrentIndex(0);
      } catch {
        setError("yikes! somethin' went wrong");
      } finally {
        setIsLoading(false);
        setHasFetched(true);
      }
    },
    [
      questions,
      answers,
      isLoading,
      hasFetched,
      filterOpenNow,
      filterCity,
      filterMaxDistance,
    ]
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

  const handleSelect = useCallback(
    async (suggestionId: string) => {
      setSelectedSuggestionIds((prev) =>
        prev.includes(suggestionId) ? prev : [...prev, suggestionId]
      );

      const suggestion = suggestions.find((s) => s.id === suggestionId);
      if (suggestion) {
        try {
          await saveSpot(suggestion);
        } catch {}
      }
    },
    [suggestions]
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
      setInitialMaxDistance(DEFAULT_MAX_DISTANCE_IN_KM);
      setSuggestions([]);
      setPhotoUrisMap(new Map<string, Map<string, string>>());
      setCurrentIndex(0);
      setSelectedSuggestionIds([]);
      setIsLoading(false);
      setHasFetched(false);
      setError(null);
      setFilterOpenNow(false);
      setFilterCity(null);
      setFilterMaxDistance(null);
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
        filterOpenNow,
        filterCity,
        filterMaxDistance,
        setHasFetched,
        fetchSuggestions,
        setFilterOpenNow,
        setFilterCity,
        setFilterMaxDistance,
        error,
        handleSkip,
        handleSelect,
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
