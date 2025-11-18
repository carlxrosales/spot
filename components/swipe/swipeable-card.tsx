import { ImageCarousel } from "@/components/common/image-carousel";
import { SCREEN_WIDTH } from "@/constants/dimensions";
import { Animation, Overlay } from "@/constants/theme";
import { useSuggestions } from "@/contexts/suggestions-context";
import {
  getCountdown,
  getOpeningHoursForToday,
  getRandomUnusedSelectFeedback,
  getRandomUnusedSkipFeedback,
  isCurrentlyOpen,
  Suggestion,
} from "@/data/suggestions";
import { useSwipeFeedback } from "@/hooks/use-swipe-feedback";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { GetDirectionsButton } from "./get-directions-button";
import { ShareButton } from "./share-button";
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
    const { selectedSuggestionIds, handleSkip, handleSelect } =
      useSuggestions();
    const { onSwipeStart, onSwipeThreshold, onSwipeSkip, onSwipeSelect } =
      useSwipeFeedback();
    const translateX = useSharedValue<number>(0);
    const translateY = useSharedValue<number>(0);
    const scale = useSharedValue<number>(Animation.scale.hidden);
    const opacity = useSharedValue<number>(Animation.opacity.hidden);
    const swipeProgress = useSharedValue<number>(0);
    const hasTriggeredThreshold = useSharedValue<boolean>(false);
    const [selectedFeedback, setSelectedFeedback] = useState<{
      text: string;
      emoji: string;
    } | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
    const [countdown, setCountdown] = useState<string>("");
    const [skipFeedback] = useState(() => getRandomUnusedSkipFeedback());
    const [selectFeedback] = useState(() => getRandomUnusedSelectFeedback());

    const isSelected = selectedSuggestionIds.includes(suggestion.id);

    const resetCard = () => {
      translateX.value = 0;
      translateY.value = 0;
      swipeProgress.value = 0;
      hasTriggeredThreshold.value = false;

      scale.value = Animation.scale.hidden;
      opacity.value = Animation.opacity.hidden;

      scale.value = withSpring(Animation.scale.normal, Animation.dampSpring);
      opacity.value = withTiming(Animation.opacity.visible, {
        duration: Animation.duration.normal,
      });
    };

    useEffect(() => {
      resetCard();
      setSelectedFeedback(null);
      setCurrentPhotoIndex(0);
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
      scheduleOnRN(onSwipeSkip);
      setSelectedFeedback(skipFeedback);
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
      scheduleOnRN(onSwipeSelect);
      setSelectedFeedback(selectFeedback);
      swipeProgress.value = Animation.opacity.visible;
      translateX.value = withTiming(
        SCREEN_WIDTH * Animation.swipe.distanceMultiplier,
        { duration: Animation.duration.normal }
      );
      opacity.value = withTiming(Animation.opacity.hidden, {
        duration: Animation.duration.normal,
      });

      setTimeout(() => {
        handleSelect(suggestion.id);
        resetCard();
        setSelectedFeedback(null);
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
      .onBegin(() => {
        scheduleOnRN(onSwipeStart);
        hasTriggeredThreshold.value = false;
      })
      .onUpdate((event) => {
        translateX.value = event.translationX;
        translateY.value =
          event.translationY * Animation.swipe.translateYMultiplier;

        const absTranslationX = Math.abs(event.translationX);
        const progress = Math.min(absTranslationX / SWIPE_THRESHOLD, 1);

        if (event.translationX < 0) {
          scheduleOnRN(setSelectedFeedback, skipFeedback);
          swipeProgress.value = progress;

          if (progress >= 1 && !hasTriggeredThreshold.value) {
            hasTriggeredThreshold.value = true;
            scheduleOnRN(onSwipeThreshold);
          }
        } else if (event.translationX > 0) {
          scheduleOnRN(setSelectedFeedback, selectFeedback);
          swipeProgress.value = progress;

          if (progress >= 1 && !hasTriggeredThreshold.value) {
            hasTriggeredThreshold.value = true;
            scheduleOnRN(onSwipeThreshold);
          }
        } else {
          swipeProgress.value = 0;
          hasTriggeredThreshold.value = false;
        }
      })
      .onEnd((event) => {
        const shouldSwipeLeft = event.translationX < -SWIPE_THRESHOLD;
        const shouldSwipeRight = event.translationX > SWIPE_THRESHOLD;

        if (shouldSwipeLeft) {
          scheduleOnRN(performSwipeLeft);
        } else if (shouldSwipeRight) {
          scheduleOnRN(performSwipeRight);
        } else {
          translateX.value = withSpring(0, Animation.spring);
          translateY.value = withSpring(0, Animation.spring);
          swipeProgress.value = withSpring(0, Animation.spring);
          hasTriggeredThreshold.value = false;
          scheduleOnRN(setSelectedFeedback, null);
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
              {isSelected && (
                <View
                  className='absolute top-6 right-[-52px] z-50'
                  style={{ transform: [{ rotate: "45deg" }] }}
                >
                  <View className='bg-neonPink px-20 py-3'>
                    <Text className='text-white font-bold text-md'>SAVED</Text>
                  </View>
                </View>
              )}
              <>
                {suggestion.photos.length > 0 && (
                  <ImageCarousel
                    images={
                      isSelected ? [suggestion.photos[0]] : suggestion.photos
                    }
                    currentIndex={currentPhotoIndex}
                    onIndexChange={setCurrentPhotoIndex}
                  />
                )}
                <View
                  className={`absolute bottom-0 left-0 right-0 p-6 gap-6 ${
                    isSelected ? "flex-1 w-full h-full" : ""
                  }`}
                  style={{
                    backgroundColor: Overlay.backgroundColor,
                  }}
                >
                  {isSelected ? (
                    <View className='flex-1 justify-center h-full'>
                      <View className='py-4 gap-4'>
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
                        <View className='py-4 gap-3'>
                          <GetDirectionsButton suggestion={suggestion} />
                          <ShareButton suggestion={suggestion} />
                        </View>
                      </View>
                    </View>
                  ) : (
                    <>
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
                    </>
                  )}
                </View>
              </>
            </View>
          </GestureDetector>
        </Animated.View>
      </>
    );
  }
);
