import { AbsoluteView } from "@/components/common/absolute-view";
import { AnimatedBackground } from "@/components/common/animated-background";
import { IconButton } from "@/components/common/icon-button";
import { SafeView } from "@/components/common/safe-view";
import { TextButton } from "@/components/common/text-button";
import { SearchBar } from "@/components/my-spots/search-bar";
import { SpotCard } from "@/components/my-spots/spot-card";
import { ButtonSize, ButtonVariant } from "@/constants/buttons";
import { Routes } from "@/constants/routes";
import { MySpotsProvider, useMySpots } from "@/contexts/my-spots-context";
import { ShareProvider } from "@/contexts/share-context";
import { useToast } from "@/contexts/toast-context";
import { Suggestion } from "@/data/suggestions";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  ViewToken,
} from "react-native";

const copy = {
  noSpots: "no spots here",
  noResults: "no results found",
};

/**
 * My Spots screen component.
 * Displays all saved spots with options to share, open in maps, get directions, and remove.
 */
function MySpots() {
  const router = useRouter();
  const { displayToast } = useToast();
  const {
    filteredSpots,
    isLoading,
    error,
    removingSpotId,
    isSharing,
    searchQuery,
    handleRemove,
    handlePhotoIndexChange,
    getPhotoUri,
    handleShare,
    setSearchQuery,
    getCurrentPhotoIndex,
    loadPhotosForSpot,
  } = useMySpots();
  const [visibleSpotIds, setVisibleSpotIds] = useState<Set<string>>(new Set());
  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 10,
      minimumViewTime: 100,
      waitForInteraction: false,
    }),
    []
  );

  useEffect(() => {
    if (error) {
      displayToast({ message: error });
    }
  }, [error, displayToast]);

  useEffect(() => {
    if (!isLoading && filteredSpots.length > 0) {
      const firstTwoSpots = filteredSpots.slice(0, 2);
      firstTwoSpots.forEach((spot) => {
        loadPhotosForSpot(spot.id);
      });
      setVisibleSpotIds((prev) => {
        const newSet = new Set(prev);
        firstTwoSpots.forEach((spot) => {
          newSet.add(spot.id);
        });
        return newSet;
      });
    }
  }, [filteredSpots, isLoading, loadPhotosForSpot]);

  const handleBack = useCallback(() => {
    router.navigate(Routes.survey);
  }, [router]);

  const handleRemoveWithToast = useCallback(
    async (spotId: string) => {
      try {
        await handleRemove(spotId);
        displayToast({ message: "Removed" });
      } catch {
        displayToast({
          message: "yikes! failed to remove spot",
        });
      }
    },
    [handleRemove, displayToast]
  );

  const handleShareWithToast = useCallback(async () => {
    try {
      await handleShare();
      displayToast({ message: "Shared" });
    } catch {
      displayToast({
        message: "oof! share failed",
      });
    }
  }, [handleShare, displayToast]);

  const loadPhotosForSpotRef = useRef(loadPhotosForSpot);
  const filteredSpotsRef = useRef(filteredSpots);

  useEffect(() => {
    loadPhotosForSpotRef.current = loadPhotosForSpot;
    filteredSpotsRef.current = filteredSpots;
  }, [loadPhotosForSpot, filteredSpots]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const newVisibleIds = new Set<string>();

      viewableItems.forEach((item) => {
        if (item.item && item.isViewable) {
          const spotId = item.item.id;
          newVisibleIds.add(spotId);
          loadPhotosForSpotRef.current(spotId);
        }
      });

      setVisibleSpotIds((prev) => {
        const updated = new Set(newVisibleIds);
        const currentSpots = filteredSpotsRef.current;
        if (currentSpots.length > 0) {
          currentSpots.slice(0, 2).forEach((spot) => {
            updated.add(spot.id);
          });
        }
        return updated;
      });
    }
  ).current;

  const renderSpot = useCallback(
    ({ item: spot, index }: { item: Suggestion; index?: number }) => {
      const currentPhotoIndex = getCurrentPhotoIndex(spot.id);
      const isFirstTwo = index !== undefined && index < 2;
      const isVisible = visibleSpotIds.has(spot.id) || isFirstTwo;
      return (
        <SpotCard
          spot={spot}
          getPhotoUri={getPhotoUri}
          onPhotoIndexChange={handlePhotoIndexChange}
          currentPhotoIndex={currentPhotoIndex}
          onRemove={handleRemoveWithToast}
          isRemoving={removingSpotId === spot.id}
          isVisible={isVisible}
        />
      );
    },
    [
      getCurrentPhotoIndex,
      getPhotoUri,
      handlePhotoIndexChange,
      handleRemoveWithToast,
      removingSpotId,
      visibleSpotIds,
    ]
  );

  const loadPhotoForShare = useCallback(
    async (suggestionId: string, photoIndex: number) => {
      await handlePhotoIndexChange(suggestionId, photoIndex);
    },
    [handlePhotoIndexChange]
  );

  return (
    <ShareProvider getPhotoUri={getPhotoUri} loadPhoto={loadPhotoForShare}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className='flex-1 bg-neonGreen'
      >
        <AbsoluteView top={0} left={0} right={0} bottom={0}>
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
                onPress={handleShareWithToast}
                size={ButtonSize.sm}
                icon='share-outline'
                variant={ButtonVariant.white}
                disabled={filteredSpots.length < 2}
                loading={isSharing}
              />
            </View>
            {isLoading ? (
              <AbsoluteView
                top={0}
                bottom={0}
                left={0}
                right={0}
                className='flex-1 items-center justify-center'
                avoidKeyboard
              >
                <ActivityIndicator size='large' color='black' />
              </AbsoluteView>
            ) : filteredSpots.length === 0 ? (
              <AbsoluteView
                top={0}
                bottom={0}
                left={0}
                right={0}
                className='flex-1 items-center justify-center px-8'
                avoidKeyboard
              >
                <Text className='text-4xl font-groen text-black text-center'>
                  {searchQuery.trim() ? copy.noResults : copy.noSpots}
                </Text>
              </AbsoluteView>
            ) : (
              <FlatList
                data={filteredSpots}
                renderItem={({ item, index }) => renderSpot({ item, index })}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingTop: 0, paddingBottom: 132 }}
                showsVerticalScrollIndicator={false}
                viewabilityConfig={viewabilityConfig}
                onViewableItemsChanged={onViewableItemsChanged}
                removeClippedSubviews={true}
                initialNumToRender={3}
                maxToRenderPerBatch={2}
                windowSize={5}
              />
            )}
          </View>
        </AbsoluteView>
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </KeyboardAvoidingView>
    </ShareProvider>
  );
}

export default function MySpotsWithProvider() {
  return (
    <MySpotsProvider>
      <MySpots />
    </MySpotsProvider>
  );
}
