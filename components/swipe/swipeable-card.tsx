import { ImageCarousel } from "@/components/common/image-carousel";
import { SCREEN_WIDTH } from "@/constants/dimensions";
import { Animation, Overlay } from "@/constants/theme";
import { useSuggestions } from "@/contexts/suggestions-context";
import {
  getCountdown,
  getOpeningHoursForToday,
  isCurrentlyOpen,
  Suggestion,
  suggestionFeedbacks,
} from "@/data/suggestions";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SwipeFeedback } from "./swipe-feedback";

const copy = {
  kmAway: "km away",
  closingIn: "Closing in",
  openingIn: "Opening in",
};

const SWIPE_THRESHOLD = SCREEN_WIDTH * Animation.threshold.swipeCard;

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
    const translateX = useSharedValue<number>(0);
    const translateY = useSharedValue<number>(0);
    const scale = useSharedValue<number>(Animation.scale.hidden);
    const opacity = useSharedValue<number>(Animation.opacity.hidden);
    const swipeProgress = useSharedValue<number>(0);
    const [selectedFeedback, setSelectedFeedback] = useState<{
      text: string;
      emoji: string;
    } | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
    const [countdown, setCountdown] = useState<string>("");

    useEffect(() => {
      const randomIndex = Math.floor(
        Math.random() * suggestionFeedbacks.length
      );
      setSelectedFeedback(suggestionFeedbacks[randomIndex]);

      translateX.value = 0;
      translateY.value = 0;
      swipeProgress.value = 0;
      setCurrentPhotoIndex(0);

      scale.value = Animation.scale.hidden;
      opacity.value = Animation.opacity.hidden;

      scale.value = withSpring(Animation.scale.normal, Animation.dampSpring);
      opacity.value = withTiming(Animation.opacity.visible, {
        duration: Animation.duration.normal,
      });
    }, [suggestion.id]);

    useEffect(() => {
      if (
        suggestion.openingHours?.opensAt ||
        suggestion.openingHours?.closesAt
      ) {
        const updateCountdown = () => {
          const isOpen = isCurrentlyOpen(
            suggestion.openingHours?.opensAt,
            suggestion.openingHours?.closesAt
          );

          if (!isOpen && suggestion.openingHours?.opensAt) {
            setCountdown(getCountdown(suggestion.openingHours.opensAt));
          } else if (suggestion.openingHours?.closesAt) {
            setCountdown(getCountdown(suggestion.openingHours.closesAt));
          }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000);

        return () => clearInterval(interval);
      }
    }, [suggestion.openingHours?.opensAt, suggestion.openingHours?.closesAt]);

    const performSwipeLeft = () => {
      swipeProgress.value = Animation.opacity.visible;
      translateX.value = withTiming(
        -SCREEN_WIDTH * Animation.swipe.distanceMultiplier,
        { duration: Animation.duration.normal }
      );
      opacity.value = withTiming(Animation.opacity.hidden, {
        duration: Animation.duration.normal,
      });

      setTimeout(() => {
        handleSkip();
      }, Animation.duration.slow);
    };

    const performSwipeRight = () => {
      translateX.value = withTiming(
        SCREEN_WIDTH * Animation.swipe.distanceMultiplier,
        { duration: Animation.duration.normal }
      );
      opacity.value = withTiming(Animation.opacity.hidden, {
        duration: Animation.duration.normal,
      });
      swipeProgress.value = withTiming(0, {
        duration: Animation.duration.normal,
      });

      setTimeout(() => {
        handleProceed();
      }, Animation.duration.slow);
    };

    const cardStyle = useAnimatedStyle(() => {
      const rotation = translateX.value / Animation.swipe.rotationDivisor;
      const cardScale = scale.value;

      const cardOpacity =
        Animation.opacity.visible -
        swipeProgress.value * Animation.swipe.fadeAmount;

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
        zIndex: Animation.zIndex.card,
      };
    });

    const panGesture = Gesture.Pan()
      .activeOffsetX([
        -Animation.swipe.activeOffset,
        Animation.swipe.activeOffset,
      ])
      .onUpdate((event) => {
        translateX.value = event.translationX;
        translateY.value =
          event.translationY * Animation.swipe.translateYMultiplier;

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
                      backgroundColor: Overlay.backgroundColor,
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
                          {suggestion.distanceInKm.toFixed(1)} {copy.kmAway}
                        </Text>
                      )}
                    </View>
                    {(suggestion.openingHours?.weekdayText ||
                      suggestion.openingHours?.closesAt ||
                      suggestion.openingHours?.opensAt) && (
                      <View className='flex-row items-center justify-between'>
                        {suggestion.openingHours?.weekdayText && (
                          <Text className='text-lg text-white opacity-90 text-left'>
                            {getOpeningHoursForToday(
                              suggestion.openingHours.weekdayText
                            )}
                          </Text>
                        )}
                        {countdown && (
                          <Text className='text-lg text-white opacity-90 text-right'>
                            {isCurrentlyOpen(
                              suggestion.openingHours?.opensAt,
                              suggestion.openingHours?.closesAt
                            )
                              ? `${copy.closingIn} ${countdown}`
                              : `${copy.openingIn} ${countdown}`}
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
