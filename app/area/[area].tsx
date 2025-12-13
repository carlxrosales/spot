import { AreaCard, AreaCardRef } from "@/components/area/area-card";
import { OpenNowFilterModal } from "@/components/area/open-now-filter-modal";
import { AbsoluteView } from "@/components/common/absolute-view";
import { AnimatedBackground } from "@/components/common/animated-background";
import { IconButton } from "@/components/common/icon-button";
import { PlaceModal } from "@/components/common/place-modal";
import { SafeView } from "@/components/common/safe-view";
import { TextButton } from "@/components/common/text-button";
import { ButtonSize, ButtonVariant } from "@/constants/buttons";
import { Routes } from "@/constants/routes";
import { Animation, Colors } from "@/constants/theme";
import { AreaProvider, useArea } from "@/contexts/area-context";
import { ShareProvider } from "@/contexts/share-context";
import { useToast } from "@/contexts/toast-context";
import { useModal } from "@/hooks/use-modal";
import { useSwipeFeedback } from "@/hooks/use-swipe-feedback";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const copy = {
  findingSpots: "Finding yo' spots...",
  noSuggestions: "oof! no spots found",
};

/**
 * Area screen component for browsing place suggestions by area.
 * Displays swipeable cards with place suggestions based on area search.
 * Provides actions to skip, view details, or select suggestions.
 * Includes open now filtering.
 */
function AreaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ area?: string }>();
  const area = Array.isArray(params.area) ? params.area[0] : params.area;

  const {
    isLoading,
    hasFetched,
    suggestions,
    selectedSuggestionIds,
    fetchSuggestionsByArea,
    currentIndex,
    error,
  } = useArea();
  const { onSwipeSkip, onSwipeSelect } = useSwipeFeedback();
  const { displayToast } = useToast();
  const swipeModal = useModal();
  const openNowModal = useModal();

  const [isSkipLoading, setIsSkipLoading] = useState<boolean>(false);
  const [isProceedLoading, setIsProceedLoading] = useState<boolean>(false);

  const cardRef = useRef<AreaCardRef>(null);

  useEffect(() => {
    if (!area || typeof area !== "string") {
      router.navigate(Routes.survey);
      return;
    }

    fetchSuggestionsByArea(area);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, router]);

  useEffect(() => {
    if (error) {
      displayToast({ message: error });
    }
  }, [error, displayToast]);

  useEffect(() => {
    setIsSkipLoading(false);
    setIsProceedLoading(false);
  }, [currentIndex]);

  const currentSuggestion =
    suggestions.length > 0 ? suggestions[currentIndex] : null;

  const handleSkip = useCallback(() => {
    if (isSkipLoading || isProceedLoading) return;
    onSwipeSkip();
    setIsSkipLoading(true);
    cardRef.current?.swipeLeft();
    setTimeout(() => {
      setIsSkipLoading(false);
    }, Animation.duration.slow);
  }, [isSkipLoading, isProceedLoading, onSwipeSkip]);

  const handleProceed = useCallback(() => {
    if (isSkipLoading || isProceedLoading) return;
    onSwipeSelect();
    setIsProceedLoading(true);
    cardRef.current?.swipeRight();
    setTimeout(() => {
      setIsProceedLoading(false);
    }, Animation.duration.slow);
  }, [isSkipLoading, isProceedLoading, onSwipeSelect]);

  const handleBack = useCallback(() => {
    router.navigate(Routes.survey);
  }, [router]);

  return (
    <AbsoluteView
      top={0}
      left={0}
      right={0}
      bottom={0}
      className='w-full h-full bg-neonGreen'
    >
      <AnimatedBackground />
      <SafeView className='h-full w-full justify-center items-center'>
        {isLoading || !hasFetched ? (
          <View className='items-center gap-6'>
            <ActivityIndicator size='large' color={Colors.black} />
            <Text className='text-4xl font-groen text-black'>
              {copy.findingSpots}
            </Text>
          </View>
        ) : (
          <View className='h-full w-full flex-1 flex-col'>
            <>
              <View className='flex-row justify-between items-center gap-6 px-4 pt-4'>
                <IconButton
                  onPress={handleBack}
                  size={ButtonSize.sm}
                  icon='arrow-back'
                />
                <AbsoluteView top={14} left={56} right={56}>
                  <View className='items-center justify-center'>
                    <TextButton
                      size={ButtonSize.sm}
                      variant={ButtonVariant.black}
                      label={`${
                        suggestions.length > 0 ? currentIndex + 1 : 0
                      } / ${suggestions.length}`}
                    />
                  </View>
                </AbsoluteView>
                <IconButton
                  size={ButtonSize.sm}
                  onPress={openNowModal.handleOpen}
                  icon={"time-outline"}
                  variant={ButtonVariant.white}
                />
              </View>
              {currentSuggestion ? (
                <View className='flex-1'>
                  <AreaCard
                    ref={cardRef}
                    key={`area-card-${currentIndex}`}
                    suggestion={currentSuggestion}
                  />
                </View>
              ) : (
                <View className=' flex-1 items-center justify-center'>
                  <Text className='text-5xl text-center font-groen text-black'>
                    {copy.noSuggestions}
                  </Text>
                </View>
              )}
              <View className='flex-row justify-center items-center gap-6 px-8 pt-4 pb-8'>
                <IconButton
                  onPress={handleSkip}
                  icon='close'
                  variant={ButtonVariant.black}
                  loading={isSkipLoading}
                  disabled={
                    !currentSuggestion || isSkipLoading || isProceedLoading
                  }
                />
                <IconButton
                  onPress={swipeModal.handleOpen}
                  icon='eye'
                  variant={ButtonVariant.white}
                  disabled={
                    !currentSuggestion || isSkipLoading || isProceedLoading
                  }
                />
                <IconButton
                  onPress={handleProceed}
                  icon='checkmark-sharp'
                  variant={ButtonVariant.pink}
                  loading={isProceedLoading}
                  disabled={
                    !currentSuggestion ||
                    isSkipLoading ||
                    isProceedLoading ||
                    selectedSuggestionIds.includes(currentSuggestion.id)
                  }
                />
              </View>
            </>
          </View>
        )}
      </SafeView>
      <PlaceModal
        visible={swipeModal.isVisible}
        onClose={swipeModal.handleClose}
        place={currentSuggestion}
      />
      <OpenNowFilterModal
        visible={openNowModal.isVisible}
        onClose={openNowModal.handleClose}
      />
    </AbsoluteView>
  );
}

function AreaWithShareProvider() {
  const { getPhotoUri, loadPhotoByName, suggestions } = useArea();

  const loadPhoto = useCallback(
    async (suggestionId: string, photoIndex: number) => {
      const suggestion = suggestions.find((s) => s.id === suggestionId);
      if (suggestion && suggestion.photos[photoIndex]) {
        await loadPhotoByName(suggestionId, suggestion.photos[photoIndex]);
      }
    },
    [suggestions, loadPhotoByName]
  );

  return (
    <ShareProvider getPhotoUri={getPhotoUri} loadPhoto={loadPhoto}>
      <AreaScreen />
    </ShareProvider>
  );
}

export default function AreaWithProviders() {
  return (
    <AreaProvider>
      <AreaWithShareProvider />
    </AreaProvider>
  );
}
