import {
  loadPhotoByName as loadPhotoByNameUtil,
  Suggestion,
} from "@/data/suggestions";
import { loadSpots, removeSpot } from "@/services/storage";
import { createShare, recommendPlaces } from "@/services/supabase";
import { getClosingTimeForToday, getOpeningTimeForToday } from "@/utils/places";
import { getRecommendationUrl } from "@/utils/urls";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Share } from "react-native";

interface MySpotsContextType {
  spots: Suggestion[];
  filteredSpots: Suggestion[];
  isLoading: boolean;
  error: string | null;
  removingSpotId: string | null;
  isSharing: boolean;
  searchQuery: string;
  loadSpots: () => Promise<void>;
  handleRemove: (spotId: string) => Promise<void>;
  handlePhotoIndexChange: (spotId: string, index: number) => Promise<void>;
  getPhotoUri: (spotId: string, photoName: string) => string | undefined;
  handleShare: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  getCurrentPhotoIndex: (spotId: string) => number;
  loadPhotosForSpot: (spotId: string) => Promise<void>;
}

const MySpotsContext = createContext<MySpotsContextType | undefined>(undefined);

interface MySpotsProviderProps {
  children: ReactNode;
}

export function MySpotsProvider({ children }: MySpotsProviderProps) {
  const [spots, setSpots] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [removingSpotId, setRemovingSpotId] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPhotoIndices, setCurrentPhotoIndices] = useState<
    Map<string, number>
  >(new Map());
  const [photoUris, setPhotoUris] = useState<Map<string, Map<string, string>>>(
    new Map()
  );

  const filteredSpots = useMemo(() => {
    if (!searchQuery.trim()) {
      return spots;
    }
    const query = searchQuery.toLowerCase().trim();
    return spots.filter((spot) => spot.name.toLowerCase().includes(query));
  }, [spots, searchQuery]);

  const loadSavedSpots = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const savedSpotIds = await loadSpots();

      if (savedSpotIds.length === 0) {
        setSpots([]);
        return;
      }

      // Reuse recommendPlaces to get fresh data from Supabase
      const freshSpots = await recommendPlaces({
        placeIds: savedSpotIds,
      });

      // Compute opensAt and closesAt from openingHours
      const spotsWithComputedFields = freshSpots.map((spot: Suggestion) => {
        if (spot.openingHours) {
          const opensAt = getOpeningTimeForToday(spot.openingHours);
          const closesAt = getClosingTimeForToday(spot.openingHours);
          return {
            ...spot,
            opensAt,
            closesAt,
          };
        }
        return spot;
      });

      setSpots(spotsWithComputedFields);
    } catch {
      setError("yikes! failed to load your spots");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedSpots();
  }, [loadSavedSpots]);

  const handleRemove = useCallback(async (spotId: string) => {
    try {
      setRemovingSpotId(spotId);
      await removeSpot(spotId);
      setSpots((prev) => prev.filter((s) => s.id !== spotId));
    } catch {
      throw new Error("yikes! failed to remove spot");
    } finally {
      setRemovingSpotId(null);
    }
  }, []);

  const handlePhotoIndexChange = useCallback(
    async (spotId: string, index: number) => {
      setCurrentPhotoIndices((prev) => {
        const updated = new Map(prev);
        updated.set(spotId, index);
        return updated;
      });

      const spot = spots.find((s) => s.id === spotId);
      if (spot && spot.photos && spot.photos[index]) {
        const photoName = spot.photos[index];
        const photoMap = photoUris.get(spotId);
        if (!photoMap || !photoMap.has(photoName)) {
          try {
            const photoUri = await loadPhotoByNameUtil(photoName);
            if (photoUri) {
              setPhotoUris((prev) => {
                const updated = new Map(prev);
                const existing =
                  updated.get(spotId) || new Map<string, string>();
                existing.set(photoName, photoUri);
                updated.set(spotId, existing);
                return updated;
              });
            }
          } catch {}
        }
      }
    },
    [spots, photoUris]
  );

  const getPhotoUri = useCallback(
    (spotId: string, photoName: string): string | undefined => {
      const photoMap = photoUris.get(spotId);
      return photoMap?.get(photoName);
    },
    [photoUris]
  );

  const getCurrentPhotoIndex = useCallback(
    (spotId: string): number => {
      return currentPhotoIndices.get(spotId) || 0;
    },
    [currentPhotoIndices]
  );

  const loadPhotosForSpot = useCallback(
    async (spotId: string) => {
      const spot = spots.find((s) => s.id === spotId);
      if (!spot || !spot.photos || spot.photos.length === 0) {
        return;
      }

      const photoMap = photoUris.get(spotId);
      if (photoMap && photoMap.size > 0) {
        return;
      }

      const firstPhotoName = spot.photos[0];
      try {
        const photoUri = await loadPhotoByNameUtil(firstPhotoName);
        if (photoUri) {
          setPhotoUris((prev) => {
            const updated = new Map(prev);
            const existing = updated.get(spotId) || new Map<string, string>();
            existing.set(firstPhotoName, photoUri);
            updated.set(spotId, existing);
            return updated;
          });
        }
      } catch {}
    },
    [spots, photoUris]
  );

  const handleShare = useCallback(async () => {
    if (spots.length < 2) {
      throw new Error("yikes! you need at least 2 spots to share");
    }

    try {
      setIsSharing(true);
      const placeIds = spots.map((spot) => spot.id);
      const code = await createShare(placeIds);
      const recommendationUrl = getRecommendationUrl(code);

      const result = await Share.share({
        message: `Check out my spots!\n\n👉 ${recommendationUrl}`,
      });

      if (result.action !== Share.sharedAction) {
        throw new Error("u cancelled");
      }
    } catch {
      throw new Error("oof! share failed");
    } finally {
      setIsSharing(false);
    }
  }, [spots]);

  return (
    <MySpotsContext.Provider
      value={{
        spots,
        filteredSpots,
        isLoading,
        error,
        removingSpotId,
        isSharing,
        searchQuery,
        loadSpots: loadSavedSpots,
        handleRemove,
        handlePhotoIndexChange,
        getPhotoUri,
        handleShare,
        setSearchQuery,
        getCurrentPhotoIndex,
        loadPhotosForSpot,
      }}
    >
      {children}
    </MySpotsContext.Provider>
  );
}

export function useMySpots() {
  const context = useContext(MySpotsContext);
  if (context === undefined) {
    throw new Error("useMySpots must be used within a MySpotsProvider");
  }
  return context;
}
