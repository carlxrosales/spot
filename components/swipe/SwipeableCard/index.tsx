import { ImageCarousel } from "@/components/common/ImageCarousel";
import { Animation } from "@/constants/theme";
import { useSuggestions } from "@/contexts/SuggestionsContext";
import { Suggestion, suggestionFeedbacks } from "@/data/suggestions";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SwipeFeedback } from "../SwipeFeedback";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SwipeableCardProps {
  suggestion: Suggestion;
}

export interface SwipeableCardRef {
  swipeLeft: () => void;
  swipeRight: () => void;
}

export const SwipeableCard = forwardRef<SwipeableCardRef, SwipeableCardProps>(
  ({ suggestion }, ref) => {
    const { handleSkip, handleProceed } = useSuggestions();
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);
    const swipeProgress = useSharedValue(0);
    const [selectedFeedback, setSelectedFeedback] = useState<{
      text: string;
      emoji: string;
    } | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    useEffect(() => {
      // Choose feedback on render
      const randomIndex = Math.floor(
        Math.random() * suggestionFeedbacks.length
      );
      setSelectedFeedback(suggestionFeedbacks[randomIndex]);

      // Reset all values
      translateX.value = 0;
      translateY.value = 0;
      swipeProgress.value = 0;
      setCurrentPhotoIndex(0);

      // Set initial state for animation
      scale.value = 0.8;
      opacity.value = 0;

      // Trigger pop in animation
      scale.value = withSpring(1, Animation.spring);
      opacity.value = withTiming(1, { duration: 300 });
    }, [suggestion.id]);

    const performSwipeLeft = () => {
      // Set swipeProgress to 1 immediately for button-triggered swipes
      // This allows feedback to show immediately
      swipeProgress.value = 1;
      translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });

      // Call callback after animation completes and feedback is shown longer
      setTimeout(() => {
        handleSkip();
      }, 600);
    };

    const performSwipeRight = () => {
      translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
      swipeProgress.value = withTiming(0, { duration: 300 });

      // Call callback after animation completes and feedback is shown longer
      setTimeout(() => {
        handleProceed();
      }, 600);
    };

    const cardStyle = useAnimatedStyle(() => {
      const rotation = translateX.value / 20;
      const cardScale = scale.value;

      // Decrease card opacity as swipe progress increases
      // Fade to 30% opacity at full swipe progress
      const fadeAmount = 0.6;
      const cardOpacity = 1 - swipeProgress.value * fadeAmount;

      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { rotate: `${rotation}deg` },
          { scale: cardScale },
        ],
        opacity: cardOpacity,
        height: "100%",
        width: "100%",
        zIndex: 1000,
      };
    });

    const panGesture = Gesture.Pan()
      .activeOffsetX([-10, 10])
      .onUpdate((event) => {
        translateX.value = event.translationX;
        translateY.value = event.translationY * 0.1;

        // Calculate swipe progress for left swipe (0 to 1)
        if (event.translationX < 0) {
          swipeProgress.value = Math.min(
            Math.abs(event.translationX) / SWIPE_THRESHOLD,
            1
          );
        } else {
          swipeProgress.value = 0;
        }
      })
      .onEnd((event) => {
        const shouldSwipeLeft = event.translationX < -SWIPE_THRESHOLD;
        const shouldSwipeRight = event.translationX > SWIPE_THRESHOLD;

        if (shouldSwipeLeft) {
          performSwipeLeft();
        } else if (shouldSwipeRight) {
          performSwipeRight();
        } else {
          translateX.value = withSpring(0, Animation.spring);
          translateY.value = withSpring(0, Animation.spring);
          swipeProgress.value = withSpring(0, Animation.spring);
        }
      });

    useImperativeHandle(ref, () => ({
      swipeLeft: performSwipeLeft,
      swipeRight: performSwipeRight,
    }));

    return (
      <>
        {selectedFeedback && (
          <SwipeFeedback
            feedback={selectedFeedback}
            swipeProgress={swipeProgress}
          />
        )}
        <Animated.View style={cardStyle} pointerEvents='auto'>
          <GestureDetector gesture={panGesture}>
            <View className='flex-1 bg-white rounded-3xl overflow-hidden m-4 shadow-xl'>
              {suggestion.photos.length > 0 && (
                <>
                  <ImageCarousel
                    images={suggestion.photos}
                    currentIndex={currentPhotoIndex}
                    onIndexChange={setCurrentPhotoIndex}
                  />
                  <View
                    className='absolute bottom-0 left-0 right-0 p-6 gap-6'
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                    }}
                  >
                    <Text className='text-5xl font-bold font-groen text-white'>
                      {suggestion.name}
                    </Text>
                    <View className='flex-row items-center justify-between'>
                      <Text className='text-xl text-white font-semibold text-left'>
                        ⭐ {suggestion.rating}
                      </Text>
                      {suggestion.distanceInKm && (
                        <Text className='text-xl text-white opacity-90 text-right'>
                          {suggestion.distanceInKm.toFixed(1)} km away
                        </Text>
                      )}
                    </View>
                    {(suggestion.openingHours?.opensAt ||
                      suggestion.openingHours?.closesAt) && (
                      <View className='flex-row items-center justify-between'>
                        {suggestion.openingHours?.opensAt && (
                          <Text className='text-lg text-white opacity-90 text-left'>
                            Opens at {suggestion.openingHours.opensAt}
                          </Text>
                        )}
                        {suggestion.openingHours?.closesAt && (
                          <Text className='text-lg text-white opacity-90 text-right'>
                            Closes at {suggestion.openingHours.closesAt}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                </>
              )}
            </View>
          </GestureDetector>
        </Animated.View>
      </>
    );
  }
);
