import { AbsoluteView } from "@/components/common/AbsoluteView";
import { AnimatedBackground } from "@/components/common/AnimatedBackground";
import { FixedView } from "@/components/common/FixedView";
import { IconButton } from "@/components/common/IconButton";
import { SafeView } from "@/components/common/SafeView";
import {
  SwipeableCard,
  SwipeableCardRef,
} from "@/components/swipe/SwipeableCard";
import { SwipeModal } from "@/components/swipe/SwipeModal";
import { Routes } from "@/constants/routes";
import { Colors } from "@/constants/theme";
import { useSuggestions } from "@/contexts/SuggestionsContext";
import { useSurvey } from "@/contexts/SurveyContext";
import { useToast } from "@/contexts/ToastContext";
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
  const cardRef = useRef<SwipeableCardRef>(null);

  useEffect(() => {
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

  const currentSuggestion =
    suggestions.length > 0 ? suggestions[currentIndex] : null;

  const handleSkip = () => {
    cardRef.current?.swipeLeft();
  };

  const handleProceed = () => {
    cardRef.current?.swipeRight();
  };

  const handleViewMore = () => {
    setIsModalVisible(true);
  };

  const handleBack = () => {
    handleStartOver();
    router.navigate("/survey");
  };

  return (
    <FixedView className='h-screen w-screen bg-neonGreen'>
      <AnimatedBackground />
      <SafeView className='h-full w-full justify-center items-center'>
        {isLoading ? (
          <>
            <AbsoluteView top={16} left={16}>
              <IconButton
                onPress={handleBack}
                icon='arrow-back'
                variant='white'
                size='sm'
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
                    size='sm'
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
                    variant='pink'
                  />
                  <IconButton
                    onPress={handleViewMore}
                    icon='eye'
                    variant='white'
                  />
                  <IconButton
                    onPress={handleProceed}
                    icon='checkmark'
                    variant='black'
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
