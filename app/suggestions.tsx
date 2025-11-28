import { AbsoluteView } from "@/components/common/absolute-view";
import { AnimatedBackground } from "@/components/common/animated-background";
import { IconButton } from "@/components/common/icon-button";
import { LocationPermissionModal } from "@/components/common/location-permission-modal";
import { PlaceModal } from "@/components/common/place-modal";
import { SafeView } from "@/components/common/safe-view";
import { TextButton } from "@/components/common/text-button";
import { DistanceFilterModal } from "@/components/suggestions/distance-filter-modal";
import { OpenNowFilterModal } from "@/components/suggestions/open-now-filter-modal";
import {
  SuggestionCard,
  SuggestionCardRef,
} from "@/components/suggestions/suggestion-card";
import { ButtonSize, ButtonVariant } from "@/constants/buttons";
import { Routes } from "@/constants/routes";
import { Animation, Colors } from "@/constants/theme";
import { useLocation } from "@/contexts/location-context";
import { ShareProvider } from "@/contexts/share-context";
import {
  SuggestionsProvider,
  useSuggestions,
} from "@/contexts/suggestions-context";
import { useSurvey } from "@/contexts/survey-context";
import { useToast } from "@/contexts/toast-context";
import { useModal } from "@/hooks/use-modal";
import { useSwipeFeedback } from "@/hooks/use-swipe-feedback";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const copy = {
  findingSpots: "Finding yo' spots...",
  noSuggestions: "oof! no spots found",
};

/**
 * Suggestion screen component for browsing place suggestions.
 * Displays swipeable cards with place suggestions based on survey answers.
 * Provides actions to skip, view details, or select suggestions.
 * Includes distance filtering and location permission handling.
 */
function Suggestion() {
  const router = useRouter();
  const navigation = useNavigation();

  const { hasPermission, location } = useLocation();
  const { answers, handleStartOver } = useSurvey();
  const {
    isLoading,
    hasFetched,
    suggestions,
    selectedSuggestionIds,
    fetchSuggestions,
    currentIndex,
    error,
    getPhotoUri,
  } = useSuggestions();
  const { onSwipeSkip, onSwipeSelect } = useSwipeFeedback();
  const { displayToast } = useToast();
  const swipeModal = useModal();
  const distanceModal = useModal();
  const openNowModal = useModal();

  const [isSkipLoading, setIsSkipLoading] = useState<boolean>(false);
  const [isProceedLoading, setIsProceedLoading] = useState<boolean>(false);

  const cardRef = useRef<SuggestionCardRef>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      handleStartOver();
    });

    return unsubscribe;
  }, [navigation, handleStartOver]);

  useEffect(() => {
    if (answers.length === 0) {
      router.navigate(Routes.survey);
      return;
    }

    if (location) {
      fetchSuggestions(location);
    }
  }, [location]);

  useEffect(() => {
    if (error) {
      displayToast({ message: error });
    }
  }, [error]);

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
    handleStartOver();
    router.navigate(Routes.survey);
  }, [handleStartOver, router]);

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
                <View className='flex-row gap-2'>
                  <IconButton
                    size={ButtonSize.sm}
                    onPress={openNowModal.handleOpen}
                    icon={"time-outline"}
                    variant={ButtonVariant.white}
                  />
                  <IconButton
                    size={ButtonSize.sm}
                    onPress={distanceModal.handleOpen}
                    icon='location-outline'
                    variant={ButtonVariant.white}
                  />
                </View>
              </View>
              {currentSuggestion ? (
                <View className='flex-1'>
                  <SuggestionCard
                    ref={cardRef}
                    key={`suggestion-card-${currentIndex}`}
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
      <DistanceFilterModal
        visible={distanceModal.isVisible}
        onClose={distanceModal.handleClose}
      />
      <OpenNowFilterModal
        visible={openNowModal.isVisible}
        onClose={openNowModal.handleClose}
      />
    </AbsoluteView>
  );
}

function SuggestionWithShareProvider() {
  const { getPhotoUri, fetchSuggestions } = useSuggestions();
  const { hasPermission, location } = useLocation();
  return (
    <ShareProvider getPhotoUri={getPhotoUri}>
      <Suggestion />
      {(!hasPermission || !location) && (
        <LocationPermissionModal onPermissionGranted={fetchSuggestions} />
      )}
    </ShareProvider>
  );
}

export default function SuggestionWithProviders() {
  return (
    <SuggestionsProvider>
      <SuggestionWithShareProvider />
    </SuggestionsProvider>
  );
}
