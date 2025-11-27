import {
  getClosingTimeForToday,
  getOpeningTimeForToday,
  loadFirstPhotoForSuggestion,
  loadPhotoByName as loadPhotoByNameUtil,
  Suggestion,
} from "@/data/suggestions";
import { LocationCoordinates } from "@/data/types";
import { getPlacesByIds } from "@/services/supabase";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { Image } from "react-native";

interface RecommendationsContextType {
  isLoading: boolean;
  recommendations: Suggestion[];
  selectedSuggestionIds: string[];
  currentIndex: number;
  hasFetched: boolean;
  error: string | null;
  fetchRecommendations: (
    placeIds: string[],
    userLocation?: LocationCoordinates,
    forceRefetch?: boolean
  ) => Promise<void>;
  handleSkip: () => void;
  handleSelect: (suggestionId: string) => void;
  loadPhotoByName: (suggestionId: string, photoName: string) => Promise<void>;
  getPhotoUris: (suggestionId: string) => string[] | undefined;
  getPhotoUri: (suggestionId: string, photoName: string) => string | undefined;
}

const RecommendationsContext = createContext<
  RecommendationsContextType | undefined
>(undefined);

interface RecommendationsProviderProps {
  children: ReactNode;
}

export function RecommendationsProvider({
  children,
}: RecommendationsProviderProps) {
  const [recommendations, setRecommendations] = useState<Suggestion[]>([]);
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

  const fetchRecommendations = useCallback(
    async (
      placeIds: string[],
      userLocation?: LocationCoordinates,
      forceRefetch?: boolean
    ): Promise<void> => {
      if (placeIds.length === 0) {
        setError("No place IDs provided");
        setIsLoading(false);
        setHasFetched(true);
        return;
      }

      if (isLoading || (hasFetched && !forceRefetch)) {
        return;
      }

      setIsLoading(true);
      setHasFetched(false);
      setError(null);
      setRecommendations([]);
      setCurrentIndex(0);
      setSelectedSuggestionIds([]);
      setPhotoUrisMap(new Map());

      try {
        const fetchedPlaces = await getPlacesByIds({
          placeIds,
          userLocation: userLocation || undefined,
        });

        const recommendationsWithComputedFields = fetchedPlaces.map(
          (suggestion: Suggestion) => {
            if (suggestion.openingHours) {
              const opensAt = getOpeningTimeForToday(suggestion.openingHours);
              const closesAt = getClosingTimeForToday(suggestion.openingHours);
              return {
                ...suggestion,
                opensAt,
                closesAt,
              };
            }
            return suggestion;
          }
        );

        if (recommendationsWithComputedFields.length > 0) {
          const firstRecommendation = recommendationsWithComputedFields[0];
          if (firstRecommendation.photos.length > 0) {
            const firstPhotoUri = await loadFirstPhotoForSuggestion(
              firstRecommendation
            );
            if (firstPhotoUri) {
              setPhotoUrisMap((prev) => {
                const updated = new Map(prev);
                const photoMap = new Map<string, string>();
                photoMap.set(firstRecommendation.photos[0], firstPhotoUri);
                updated.set(firstRecommendation.id, photoMap);
                return updated;
              });
              await Image.prefetch(firstPhotoUri).catch(() => {});
            }
          }
        }

        setRecommendations(recommendationsWithComputedFields);
        setCurrentIndex(0);
      } catch (err) {
        setError("yikes! somethin' went wrong");
      } finally {
        setIsLoading(false);
        setHasFetched(true);
      }
    },
    [isLoading, hasFetched]
  );

  const handleSkip = useCallback(async () => {
    const nextIndex =
      currentIndex + 1 >= recommendations.length ? 0 : currentIndex + 1;

    const nextRecommendation = recommendations[nextIndex];
    const updatedMap = new Map(photoUrisMap);

    if (nextRecommendation && nextRecommendation.photos.length > 0) {
      const nextPhotoMap = updatedMap.get(nextRecommendation.id);
      const firstPhotoName = nextRecommendation.photos[0];
      if (!nextPhotoMap || !nextPhotoMap.has(firstPhotoName)) {
        const photoUri = await loadFirstPhotoForSuggestion(nextRecommendation);
        if (photoUri) {
          const photoMap = new Map<string, string>();
          photoMap.set(firstPhotoName, photoUri);
          updatedMap.set(nextRecommendation.id, photoMap);
          await Image.prefetch(photoUri).catch(() => {});
        }
      }
    }

    setPhotoUrisMap(updatedMap);
    setCurrentIndex(nextIndex);
  }, [currentIndex, recommendations, photoUrisMap]);

  const handleSelect = useCallback((suggestionId: string) => {
    setSelectedSuggestionIds((prev) =>
      prev.includes(suggestionId) ? prev : [...prev, suggestionId]
    );
  }, []);

  const getPhotoUris = useCallback(
    (suggestionId: string) => {
      const photoMap = photoUrisMap.get(suggestionId);
      if (!photoMap) return undefined;
      const recommendation = recommendations.find((s) => s.id === suggestionId);
      if (!recommendation) return undefined;
      return recommendation.photos
        .map((photoName) => photoMap.get(photoName))
        .filter((uri): uri is string => uri !== undefined);
    },
    [photoUrisMap, recommendations]
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

  return (
    <RecommendationsContext.Provider
      value={{
        isLoading,
        recommendations,
        selectedSuggestionIds,
        currentIndex,
        hasFetched,
        error,
        fetchRecommendations,
        handleSkip,
        handleSelect,
        loadPhotoByName,
        getPhotoUris,
        getPhotoUri,
      }}
    >
      {children}
    </RecommendationsContext.Provider>
  );
}

export function useRecommendations() {
  const context = useContext(RecommendationsContext);
  if (context === undefined) {
    throw new Error(
      "useRecommendations must be used within a RecommendationsProvider"
    );
  }
  return context;
}
