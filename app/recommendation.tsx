import { AbsoluteView } from "@/components/common/absolute-view";
import { AnimatedBackground } from "@/components/common/animated-background";
import { IconButton } from "@/components/common/icon-button";
import { SafeView } from "@/components/common/safe-view";
import { TextButton } from "@/components/common/text-button";
import { LocationPermissionModal } from "@/components/recommendation/location-permission-modal";
import {
  RecommendationCard,
  RecommendationCardRef,
} from "@/components/recommendation/recommendation-card";
import { SwipeModal } from "@/components/swipe/swipe-modal";
import { ButtonSize, ButtonVariant } from "@/constants/buttons";
import { Routes } from "@/constants/routes";
import { Animation, Colors } from "@/constants/theme";
import { useLocation } from "@/contexts/location-context";
import {
  RecommendationsProvider,
  useRecommendations,
} from "@/contexts/recommendations-context";
import { ShareProvider } from "@/contexts/share-context";
import { useToast } from "@/contexts/toast-context";
import { useModal } from "@/hooks/use-modal";
import { useSwipeFeedback } from "@/hooks/use-swipe-feedback";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
const copy = {
  findingSpots: "Finding yo' spots...",
  noSuggestions: "oof! no spots found",
};

/**
 * Recommendation screen component for browsing specific places by IDs.
 * Displays swipeable cards with places based on place IDs passed in the URL.
 * Provides actions to skip, view details, or select places.
 */
function Recommendation() {
  const router = useRouter();
  const { location, hasPermission } = useLocation();
  const {
    isLoading,
    hasFetched,
    recommendations,
    selectedSuggestionIds,
    currentIndex,
    error,
    fetchRecommendations,
    handleSelect,
  } = useRecommendations();
  const { onSwipeSkip, onSwipeSelect } = useSwipeFeedback();
  const { displayToast } = useToast();
  const swipeModal = useModal();

  const [isSkipLoading, setIsSkipLoading] = useState<boolean>(false);
  const [isProceedLoading, setIsProceedLoading] = useState<boolean>(false);

  const cardRef = useRef<RecommendationCardRef>(null);

  useEffect(() => {
    if (location) {
      fetchRecommendations(location);
    }
  }, [location]);

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
    recommendations.length > 0 ? recommendations[currentIndex] : null;

  const handleSkipPress = useCallback(() => {
    if (isSkipLoading || isProceedLoading) return;
    onSwipeSkip();
    setIsSkipLoading(true);
    cardRef.current?.swipeLeft();
    setTimeout(() => {
      setIsSkipLoading(false);
    }, Animation.duration.slow);
  }, [isSkipLoading, isProceedLoading, onSwipeSkip]);

  const handleProceedPress = useCallback(() => {
    if (isSkipLoading || isProceedLoading) return;
    if (currentSuggestion) {
      handleSelect(currentSuggestion.id);
    }
    onSwipeSelect();
    setIsProceedLoading(true);
    cardRef.current?.swipeRight();
    setTimeout(() => {
      setIsProceedLoading(false);
    }, Animation.duration.slow);
  }, [
    isSkipLoading,
    isProceedLoading,
    onSwipeSelect,
    currentSuggestion,
    handleSelect,
  ]);

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
                        recommendations.length > 0 ? currentIndex + 1 : 0
                      } / ${recommendations.length}`}
                    />
                  </View>
                </AbsoluteView>
                <View className='w-20' />
              </View>
              {currentSuggestion ? (
                <View className='flex-1'>
                  <RecommendationCard
                    ref={cardRef}
                    key={`recommendation-card-${currentIndex}`}
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
                  onPress={handleSkipPress}
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
                  onPress={handleProceedPress}
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
      <SwipeModal
        visible={swipeModal.isVisible}
        onClose={swipeModal.handleClose}
        suggestion={currentSuggestion}
      />
      {(!hasPermission || !location) && <LocationPermissionModal />}
    </AbsoluteView>
  );
}

export default function RecommendationWithProviders() {
  return (
    <RecommendationsProvider>
      <ShareProvider>
        <Recommendation />
      </ShareProvider>
    </RecommendationsProvider>
  );
}
