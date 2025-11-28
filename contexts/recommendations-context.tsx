import {
  DEFAULT_MAX_DISTANCE_IN_KM,
  getClosingTimeForToday,
  getOpeningTimeForToday,
  LAST_DISTANCE_OPTION,
  loadFirstPhotoForSuggestion,
  loadPhotoByName as loadPhotoByNameUtil,
  Suggestion,
} from "@/data/suggestions";
import { LocationCoordinates } from "@/data/types";
import { getSharePlaceIds, recommendPlaces } from "@/services/supabase";
import { useLocalSearchParams } from "expo-router";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Image } from "react-native";

interface RecommendationsContextType {
  isLoading: boolean;
  recommendations: Suggestion[];
  selectedRecommendationIds: string[];
  currentIndex: number;
  hasFetched: boolean;
  error: string | null;
  initialMaxDistance: number;
  filterOpenNow: boolean;
  filterCity: string | null;
  filterMaxDistance: number | null;
  fetchRecommendations: (
    userLocation?: LocationCoordinates,
    forceRefetch?: boolean,
    openNowFilter?: boolean,
    cityFilter?: string | null,
    maxDistanceFilter?: number | null
  ) => Promise<void>;
  setFilterOpenNow: (filterOpenNow: boolean) => void;
  setFilterCity: (filterCity: string | null) => void;
  setFilterMaxDistance: (maxDistance: number | null) => void;
  handleSkip: () => void;
  handleSelect: (recommendationId: string) => void;
  loadPhotoByName: (
    recommendationId: string,
    photoName: string
  ) => Promise<void>;
  getPhotoUris: (recommendationId: string) => string[] | undefined;
  getPhotoUri: (
    recommendationId: string,
    photoName: string
  ) => string | undefined;
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
  const params = useLocalSearchParams<{
    code?: string;
  }>();

  const [placeIds, setPlaceIds] = useState<string[]>([]);

  const [recommendations, setRecommendations] = useState<Suggestion[]>([]);
  const [photoUrisMap, setPhotoUrisMap] = useState<
    Map<string, Map<string, string>>
  >(new Map());
  const [selectedRecommendationIds, setSelectedRecommendationIds] = useState<
    string[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialMaxDistance, setInitialMaxDistance] = useState<number>(
    DEFAULT_MAX_DISTANCE_IN_KM
  );
  const [filterOpenNow, setFilterOpenNow] = useState<boolean>(false);
  const [filterCity, setFilterCity] = useState<string | null>(null);
  const [filterMaxDistance, setFilterMaxDistance] = useState<number | null>(
    null
  );

  const fetchRecommendations = useCallback(
    async (
      userLocation?: LocationCoordinates,
      forceRefetch: boolean = false,
      openNowFilter?: boolean,
      cityFilter?: string | null,
      maxDistanceFilter?: number | null
    ): Promise<void> => {
      if (!params.code) {
        setError("yikes! no share code found");
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
      setSelectedRecommendationIds([]);
      setPhotoUrisMap(new Map());

      const openNowFilterValue =
        openNowFilter !== undefined ? openNowFilter : filterOpenNow;
      const cityFilterValue =
        cityFilter !== undefined ? cityFilter : filterCity;
      const maxDistanceFilterValue =
        maxDistanceFilter !== undefined ? maxDistanceFilter : filterMaxDistance;

      try {
        const sharePlaceIds = await getSharePlaceIds(params.code);
        setPlaceIds(sharePlaceIds);

        if (sharePlaceIds.length === 0) {
          setError("yikes! no spots in this share");
          setIsLoading(false);
          setHasFetched(true);
          return;
        }

        const fetchedPlaces = await recommendPlaces({
          placeIds: sharePlaceIds,
          filterOpenNow: openNowFilterValue,
          filterCity: cityFilterValue,
          userLocation: userLocation || undefined,
          maxDistanceKm:
            maxDistanceFilterValue === LAST_DISTANCE_OPTION
              ? null
              : maxDistanceFilterValue ?? null,
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
        setInitialMaxDistance(
          maxDistanceFilterValue ?? DEFAULT_MAX_DISTANCE_IN_KM
        );
      } catch (err) {
        setError("yikes! somethin' went wrong");
      } finally {
        setIsLoading(false);
        setHasFetched(true);
      }
    },
    [
      isLoading,
      hasFetched,
      params.code,
      filterOpenNow,
      filterCity,
      filterMaxDistance,
    ]
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

  const handleSelect = useCallback((recommendationId: string) => {
    setSelectedRecommendationIds((prev) =>
      prev.includes(recommendationId) ? prev : [...prev, recommendationId]
    );
  }, []);

  const getPhotoUris = useCallback(
    (recommendationId: string) => {
      const photoMap = photoUrisMap.get(recommendationId);
      if (!photoMap) return undefined;
      const recommendation = recommendations.find(
        (s) => s.id === recommendationId
      );
      if (!recommendation) return undefined;
      return recommendation.photos
        .map((photoName) => photoMap.get(photoName))
        .filter((uri): uri is string => uri !== undefined);
    },
    [photoUrisMap, recommendations]
  );

  const getPhotoUri = useCallback(
    (recommendationId: string, photoName: string) => {
      const photoMap = photoUrisMap.get(recommendationId);
      return photoMap?.get(photoName);
    },
    [photoUrisMap]
  );

  const loadPhotoByName = useCallback(
    async (recommendationId: string, photoName: string) => {
      const photoMap = photoUrisMap.get(recommendationId);
      if (photoMap?.has(photoName)) {
        return;
      }

      const photoUri = await loadPhotoByNameUtil(photoName);
      if (photoUri) {
        setPhotoUrisMap((prev) => {
          const updated = new Map(prev);
          const existing =
            updated.get(recommendationId) || new Map<string, string>();
          existing.set(photoName, photoUri);
          updated.set(recommendationId, existing);
          return updated;
        });
        await Image.prefetch(photoUri).catch(() => {});
      }
    },
    [photoUrisMap]
  );

  useEffect(() => {
    if (!isLoading && recommendations.length === 1 && hasFetched) {
      setRecommendations((prev) => [...prev, ...prev]);
    }
  }, [recommendations, isLoading, hasFetched]);

  return (
    <RecommendationsContext.Provider
      value={{
        isLoading,
        recommendations,
        selectedRecommendationIds,
        currentIndex,
        hasFetched,
        error,
        initialMaxDistance,
        filterOpenNow,
        filterCity,
        filterMaxDistance,
        fetchRecommendations,
        setFilterOpenNow,
        setFilterCity,
        setFilterMaxDistance,
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
