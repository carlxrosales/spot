import { AnimatedBackground } from "@/components/common/animated-background";
import { FixedView } from "@/components/common/fixed-view";
import { IconButton } from "@/components/common/icon-button";
import { Logo } from "@/components/common/logo";
import { SafeView } from "@/components/common/safe-view";
import { DistanceFilterModal } from "@/components/swipe/distance-filter-modal";
import { LocationPermissionModal } from "@/components/swipe/location-permission-modal";
import { SwipeModal } from "@/components/swipe/swipe-modal";
import {
  SwipeableCard,
  SwipeableCardRef,
} from "@/components/swipe/swipeable-card";
import { ButtonSize, ButtonVariant } from "@/constants/buttons";
import { Routes } from "@/constants/routes";
import { Animation, Colors } from "@/constants/theme";
import { useLocation } from "@/contexts/location-context";
import { useSuggestions } from "@/contexts/suggestions-context";
import { useSurvey } from "@/contexts/survey-context";
import { useToast } from "@/contexts/toast-context";
import { useModal } from "@/hooks/use-modal";
import { useSwipeFeedback } from "@/hooks/use-swipe-feedback";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const copy = {
  findingSpots: "Finding yo' spots...",
  noSuggestions: "Oof! No spots found",
};

/**
 * Swipe screen component for browsing place suggestions.
 * Displays swipeable cards with place suggestions based on survey answers.
 * Provides actions to skip, view details, or select suggestions.
 * Includes distance filtering and location permission handling.
 */
export default function Swipe() {
  const router = useRouter();
  const { answers } = useSurvey();
  const { handleStartOver } = useSurvey();
  const { location, hasPermission } = useLocation();
  const { isLoading, suggestions, currentIndex, fetchSuggestions, error } =
    useSuggestions();
  const { displayToast } = useToast();
  const { onSwipeSkip, onSwipeSelect } = useSwipeFeedback();
  const swipeModal = useModal();
  const distanceModal = useModal();
  const [isSkipLoading, setIsSkipLoading] = useState<boolean>(false);
  const [isProceedLoading, setIsProceedLoading] = useState<boolean>(false);
  const cardRef = useRef<SwipeableCardRef>(null);

  useEffect(() => {
    if (!router) {
      return;
    }

    if (answers.length === 0) {
      router.navigate(Routes.survey);
      return;
    }

    if (hasPermission && location && suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [hasPermission, location, suggestions.length, fetchSuggestions]);

  useEffect(() => {
    if (error) {
      displayToast({ message: error });
      router.navigate(Routes.survey);
    }
  }, [error]);

  useEffect(() => {
    setIsSkipLoading(false);
    setIsProceedLoading(false);
  }, [currentIndex]);

  const currentSuggestion =
    suggestions.length > 0 ? suggestions[currentIndex] : null;

  const handleSkip = () => {
    if (isSkipLoading || isProceedLoading) return;
    onSwipeSkip();
    setIsSkipLoading(true);
    cardRef.current?.swipeLeft();
    setTimeout(() => {
      setIsSkipLoading(false);
    }, Animation.duration.slow);
  };

  const handleProceed = () => {
    if (isSkipLoading || isProceedLoading) return;
    onSwipeSelect();
    setIsProceedLoading(true);
    cardRef.current?.swipeRight();
    setTimeout(() => {
      setIsProceedLoading(false);
    }, Animation.duration.slow);
  };

  const handleBack = () => {
    handleStartOver();
    router.navigate(Routes.survey);
  };

  return (
    <FixedView className='h-screen w-screen bg-neonGreen' withSafeAreaInsets>
      <AnimatedBackground />
      <SafeView className='h-full w-full justify-center items-center'>
        {isLoading ? (
          <View className='items-center gap-6'>
            <ActivityIndicator size='large' color={Colors.black} />
            <Text className='text-4xl font-groen font-semibold text-black'>
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
                <View className='flex-1 items-center justify-center'>
                  <Logo />
                </View>
                <IconButton
                  onPress={distanceModal.handleOpen}
                  size={ButtonSize.sm}
                  icon='filter'
                />
              </View>
              {currentSuggestion ? (
                <View className='flex-1'>
                  <SwipeableCard
                    ref={cardRef}
                    key={`swipeable-card-${currentIndex}`}
                    suggestion={currentSuggestion}
                  />
                </View>
              ) : (
                <View className=' flex-1 items-center justify-center'>
                  <Text className='text-5xl text-center font-groen font-semibold text-black'>
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
                    !currentSuggestion || isSkipLoading || isProceedLoading
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
      <DistanceFilterModal
        visible={distanceModal.isVisible}
        onClose={distanceModal.handleClose}
      />
      <LocationPermissionModal />
    </FixedView>
  );
}
