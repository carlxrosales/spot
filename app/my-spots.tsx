import { AbsoluteView } from "@/components/common/absolute-view";
import { AnimatedBackground } from "@/components/common/animated-background";
import { IconButton } from "@/components/common/icon-button";
import { SafeView } from "@/components/common/safe-view";
import { TextButton } from "@/components/common/text-button";
import { SearchBar } from "@/components/my-spots/search-bar";
import { SpotCard } from "@/components/my-spots/spot-card";
import { ButtonSize, ButtonVariant } from "@/constants/buttons";
import { Routes } from "@/constants/routes";
import { ShareProvider } from "@/contexts/share-context";
import { useToast } from "@/contexts/toast-context";
import {
  loadPhotoByName as loadPhotoByNameUtil,
  Suggestion,
} from "@/data/suggestions";
import { loadSpots, removeSpot } from "@/services/storage";
import { getRecommendationUrl } from "@/utils/urls";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Share, Text, View } from "react-native";

const copy = {
  noSpots: "no spots here",
  noResults: "no results found",
};

/**
 * My Spots screen component.
 * Displays all saved spots with options to share, open in maps, get directions, and remove.
 */
export default function MySpots() {
  const router = useRouter();
  const { displayToast } = useToast();
  const [spots, setSpots] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [removingSpotId, setRemovingSpotId] = useState<string | null>(null);
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

  useEffect(() => {
    loadSavedSpots();
  }, []);

  const loadSavedSpots = async () => {
    try {
      setIsLoading(true);
      const savedSpots = await loadSpots();
      setSpots(savedSpots);

      const updatedPhotoUris = new Map<string, Map<string, string>>();
      for (const spot of savedSpots) {
        if (spot.photos && spot.photos.length > 0) {
          const firstPhotoName = spot.photos[0];
          try {
            const photoUri = await loadPhotoByNameUtil(firstPhotoName);
            if (photoUri) {
              const photoMap = new Map<string, string>();
              photoMap.set(firstPhotoName, photoUri);
              updatedPhotoUris.set(spot.id, photoMap);
            }
          } catch {}
        }
      }
      setPhotoUris(updatedPhotoUris);
    } catch {
      displayToast({ message: "yikes! failed to load your spots" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = useCallback(
    async (spotId: string) => {
      try {
        setRemovingSpotId(spotId);
        await removeSpot(spotId);
        setSpots((prev) => prev.filter((s) => s.id !== spotId));
        displayToast({ message: "Spot removed!" });
      } catch {
        displayToast({ message: "yikes! failed to remove spot" });
      } finally {
        setRemovingSpotId(null);
      }
    },
    [displayToast]
  );

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

  const handleBack = useCallback(() => {
    router.navigate(Routes.survey);
  }, [router]);

  const handleShare = useCallback(async () => {
    if (filteredSpots.length < 2) {
      displayToast({ message: "yikes! you need at least 2 spots to share" });
      return;
    }

    try {
      const placeIds = filteredSpots.map((spot) => spot.id);
      const recommendationUrl = getRecommendationUrl(placeIds);

      const result = await Share.share({
        message: `Check out my spots!\n\n👉 ${recommendationUrl}`,
      });

      if (result.action === Share.sharedAction) {
        displayToast({ message: "Shared" });
      } else {
        displayToast({ message: "u cancelled" });
      }
    } catch {
      displayToast({ message: "oof! share failed" });
    }
  }, [filteredSpots, displayToast]);

  const renderSpot = useCallback(
    ({ item: spot }: { item: Suggestion }) => {
      const currentPhotoIndex = currentPhotoIndices.get(spot.id) || 0;
      return (
        <SpotCard
          suggestion={spot}
          getPhotoUri={getPhotoUri}
          onPhotoIndexChange={handlePhotoIndexChange}
          currentPhotoIndex={currentPhotoIndex}
          onRemove={handleRemove}
          isRemoving={removingSpotId === spot.id}
        />
      );
    },
    [
      currentPhotoIndices,
      getPhotoUri,
      handlePhotoIndexChange,
      handleRemove,
      removingSpotId,
    ]
  );

  return (
    <ShareProvider getPhotoUri={getPhotoUri}>
      <>
        <AbsoluteView
          top={0}
          left={0}
          right={0}
          bottom={0}
          className='w-full h-full bg-neonGreen'
        >
          <AnimatedBackground />
          <View className='h-full w-full'>
            <SafeView edges={["top"]}>
              <View></View>
            </SafeView>
            <View className='flex-row justify-between items-center gap-6 px-4 py-4'>
              <IconButton
                onPress={handleBack}
                size={ButtonSize.sm}
                icon='arrow-back'
              />
              <AbsoluteView top={17} left={56} right={56}>
                <View className='items-center justify-center'>
                  <TextButton
                    size={ButtonSize.sm}
                    variant={ButtonVariant.black}
                    label={`My spots: ${filteredSpots.length}`}
                  />
                </View>
              </AbsoluteView>
              <IconButton
                onPress={handleShare}
                size={ButtonSize.sm}
                icon='share-outline'
                variant={ButtonVariant.white}
                disabled={filteredSpots.length < 2}
              />
            </View>
            {isLoading ? (
              <View className='flex-1 items-center justify-center'>
                <ActivityIndicator size='large' color='black' />
              </View>
            ) : filteredSpots.length === 0 ? (
              <View className='flex-1 items-center justify-center px-8'>
                <Text className='text-4xl font-groen text-black text-center'>
                  {searchQuery.trim() ? copy.noResults : copy.noSpots}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredSpots}
                renderItem={renderSpot}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingTop: 0, paddingBottom: 132 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </AbsoluteView>
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </>
    </ShareProvider>
  );
}
