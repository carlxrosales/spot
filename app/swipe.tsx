import { AbsoluteView } from "@/components/common/absolute-view";
import { AnimatedBackground } from "@/components/common/animated-background";
import { FixedView } from "@/components/common/fixed-view";
import { IconButton } from "@/components/common/icon-button";
import { SafeView } from "@/components/common/safe-view";
import { SwipeModal } from "@/components/swipe/swipe-modal";
import {
  SwipeableCard,
  SwipeableCardRef,
} from "@/components/swipe/swipeable-card";
import { ButtonSize, ButtonVariant } from "@/constants/button";
import { Routes } from "@/constants/routes";
import { Animation, Colors } from "@/constants/theme";
import { useSuggestions } from "@/contexts/suggestions-context";
import { useSurvey } from "@/contexts/survey-context";
import { useToast } from "@/contexts/toast-context";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const copy = {
  findingSpots: "Finding yo' spots...",
};

export default function Swipe() {
  const router = useRouter();
  const { answers } = useSurvey();
  const { handleStartOver } = useSurvey();
  const { isLoading, suggestions, currentIndex, fetchSuggestions, error } =
    useSuggestions();
  const { displayToast } = useToast();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
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

    if (suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [suggestions.length]);

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
    setIsSkipLoading(true);
    cardRef.current?.swipeLeft();
    setTimeout(() => {
      setIsSkipLoading(false);
    }, Animation.duration.slow);
  };

  const handleProceed = () => {
    if (isSkipLoading || isProceedLoading) return;
    setIsProceedLoading(true);
    cardRef.current?.swipeRight();
    setTimeout(() => {
      setIsProceedLoading(false);
    }, Animation.duration.slow);
  };

  const handleViewMore = () => {
    setIsModalVisible(true);
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
          <>
            <AbsoluteView top={16} left={16} withSafeAreaInsets>
              <IconButton
                onPress={handleBack}
                icon='arrow-back'
                variant={ButtonVariant.white}
                size={ButtonSize.sm}
              />
            </AbsoluteView>
            <View className='items-center gap-6'>
              <ActivityIndicator size='large' color={Colors.black} />
              <Text className='text-4xl font-groen font-semibold text-black'>
                {copy.findingSpots}
              </Text>
            </View>
          </>
        ) : (
          <View className='h-full w-full flex-1 flex-col'>
            {currentSuggestion && (
              <>
                <View className='flex-row justify-start items-center gap-6 px-4 pt-4'>
                  <IconButton
                    onPress={handleBack}
                    size={ButtonSize.sm}
                    icon='arrow-back'
                  />
                </View>
                <View className='flex-1'>
                  <SwipeableCard
                    ref={cardRef}
                    key={`swipeable-card-${currentIndex}`}
                    suggestion={currentSuggestion}
                  />
                </View>
                <View className='flex-row justify-center items-center gap-6 px-8 pt-4 pb-8'>
                  <IconButton
                    onPress={handleSkip}
                    icon='close'
                    variant={ButtonVariant.pink}
                    loading={isSkipLoading}
                    disabled={isSkipLoading || isProceedLoading}
                  />
                  <IconButton
                    onPress={handleViewMore}
                    icon='eye'
                    variant={ButtonVariant.white}
                    disabled={isSkipLoading || isProceedLoading}
                  />
                  <IconButton
                    onPress={handleProceed}
                    icon='checkmark'
                    variant={ButtonVariant.black}
                    loading={isProceedLoading}
                    disabled={isSkipLoading || isProceedLoading}
                  />
                </View>
              </>
            )}
          </View>
        )}
      </SafeView>
      <SwipeModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        suggestion={currentSuggestion}
      />
    </FixedView>
  );
}
