import { GetDirectionsButton } from "@/components/common/get-directions-button";
import { ImageCarousel } from "@/components/common/image-carousel";
import { ShareButton } from "@/components/common/share-button";
import { SwipeFeedback } from "@/components/common/swipe-feedback";
import { Dimensions } from "@/constants/dimensions";
import { Animation, Overlay } from "@/constants/theme";
import { useArea } from "@/contexts/area-context";
import {
  getRandomSavedForLaterFeedback,
  getRandomUnusedSelectFeedback,
  getRandomUnusedSkipFeedback,
  Suggestion,
} from "@/data/suggestions";
import { useSwipeFeedback } from "@/hooks/use-swipe-feedback";
import {
  getCountdown,
  getOpeningHoursForToday,
  isCurrentlyOpen,
} from "@/utils/places";
import { getShadow } from "@/utils/shadows";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const copy = {
  kmAway: "km away",
  closingIn: "Closing in",
  openingIn: "Opening in",
  spotted: "spotted",
};

const SWIPE_THRESHOLD = Dimensions.width * Animation.threshold.swipeCard;

interface AreaCardProps {
  suggestion: Suggestion;
}

export interface AreaCardRef {
  swipeLeft: () => void;
  swipeRight: () => void;
}

/**
 * Swipeable card component for displaying and interacting with area place suggestions.
 * Supports swipe gestures to select or skip suggestions with haptic and audio feedback.
 * Displays suggestion photos, name, rating, distance, and opening hours.
 * Provides programmatic swipe methods via ref.
 *
 * @param suggestion - The suggestion to display in the card
 * @param ref - Ref object with `swipeLeft` and `swipeRight` methods for programmatic swiping
 */
export const AreaCard = forwardRef<AreaCardRef, AreaCardProps>(
  ({ suggestion }, ref) => {
    const {
      selectedSuggestionIds,
      handleSkip,
      handleSelect,
      loadPhotoByName,
      getPhotoUri,
    } = useArea();
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

    const imageItems = useMemo(
      () =>
        suggestion.photos.map((photo) => ({
          name: photo,
          uri: getPhotoUri(suggestion.id, photo),
        })),
      [suggestion.photos, suggestion.id, getPhotoUri]
    );

    const handlePhotoIndexChange = (index: number) => {
      setCurrentPhotoIndex(index);
      const photoName = imageItems[index].name;
      if (!imageItems[index].uri && photoName) {
        loadPhotoByName(suggestion.id, photoName);
      }
    };

    const [countdown, setCountdown] = useState<string>("");
    const [skipFeedback] = useState(() => getRandomUnusedSkipFeedback());
    const [selectFeedback] = useState(() => getRandomUnusedSelectFeedback());

    const isSelected = selectedSuggestionIds.includes(suggestion.id);

    useEffect(() => {
      scale.value = withSpring(Animation.scale.normal, Animation.dampSpring);
      opacity.value = withTiming(Animation.opacity.visible, {
        duration: Animation.duration.normal,
      });
    }, []);

    useEffect(() => {
      if (suggestion.opensAt || suggestion.closesAt) {
        const updateCountdown = () => {
          const isOpen = isCurrentlyOpen(
            suggestion.opensAt,
            suggestion.closesAt
          );

          if (!isOpen && suggestion.opensAt) {
            setCountdown(getCountdown(suggestion.opensAt));
          } else if (suggestion.closesAt) {
            setCountdown(getCountdown(suggestion.closesAt));
          }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000);

        return () => clearInterval(interval);
      }
    }, [suggestion.opensAt, suggestion.closesAt]);

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

    const performSwipeLeft = () => {
      scheduleOnRN(onSwipeSkip);
      setSelectedFeedback(
        selectedSuggestionIds.includes(suggestion.id)
          ? getRandomSavedForLaterFeedback()
          : skipFeedback
      );
      swipeProgress.value = Animation.opacity.visible;
      translateX.value = withTiming(
        -Dimensions.width * Animation.swipe.distanceMultiplier,
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
        Dimensions.width * Animation.swipe.distanceMultiplier,
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
            <View
              className='flex-1 bg-white rounded-3xl overflow-hidden m-4'
              style={getShadow("dark")}
            >
              {isSelected && (
                <View
                  className='absolute top-8 right-[-55px] z-50'
                  style={{ transform: [{ rotate: "45deg" }] }}
                >
                  <View className='bg-neonPink px-20 py-3'>
                    <Text className='text-white font-bold text-md'>
                      {copy.spotted}
                    </Text>
                  </View>
                </View>
              )}
              <>
                {suggestion.photos.length > 0 && (
                  <ImageCarousel
                    images={imageItems}
                    currentIndex={currentPhotoIndex}
                    onIndexChange={handlePhotoIndexChange}
                    showIndicator={!isSelected}
                  />
                )}
                <View
                  className={`absolute bottom-0 left-0 right-0 p-6 gap-6 ${
                    isSelected ? "flex-1 w-full h-full" : ""
                  }`}
                  style={{
                    backgroundColor: Overlay.backgroundColor,
                  }}
                  pointerEvents='box-none'
                >
                  {isSelected ? (
                    <View
                      className='flex-1 justify-center h-full'
                      pointerEvents='box-none'
                    >
                      <View className='py-4 gap-4' pointerEvents='box-none'>
                        <Text
                          className='text-5xl font-groen text-white'
                          pointerEvents='none'
                        >
                          {suggestion.name}
                        </Text>
                        <View
                          className='flex-row items-center justify-between'
                          pointerEvents='box-none'
                        >
                          <Text
                            className='text-xl text-white font-semibold text-left'
                            pointerEvents='none'
                          >
                            ⭐ {suggestion.rating}
                          </Text>
                          {suggestion.distanceInKm && (
                            <Text
                              className='text-xl text-white opacity-90 text-right'
                              pointerEvents='none'
                            >
                              {suggestion.distanceInKm.toFixed(1)} {copy.kmAway}
                            </Text>
                          )}
                        </View>
                        {(suggestion.openingHours ||
                          suggestion.closesAt ||
                          suggestion.opensAt) && (
                          <View
                            className='flex-row items-center justify-between'
                            pointerEvents='box-none'
                          >
                            {suggestion.openingHours && (
                              <Text
                                className='text-lg text-white opacity-90 text-left'
                                pointerEvents='none'
                              >
                                {getOpeningHoursForToday(
                                  suggestion.openingHours
                                )}
                              </Text>
                            )}
                            {countdown && (
                              <Text
                                className='text-lg text-white opacity-90 text-right'
                                pointerEvents='none'
                              >
                                {isCurrentlyOpen(
                                  suggestion.opensAt,
                                  suggestion.closesAt
                                )
                                  ? `${copy.closingIn} ${countdown}`
                                  : `${copy.openingIn} ${countdown}`}
                              </Text>
                            )}
                          </View>
                        )}
                        <View className='py-4 gap-3'>
                          <GetDirectionsButton suggestion={suggestion} />
                          <ShareButton
                            suggestion={suggestion}
                            currentPhotoIndex={currentPhotoIndex}
                          />
                        </View>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text
                        className='text-5xl font-groen text-white'
                        pointerEvents='none'
                      >
                        {suggestion.name}
                      </Text>
                      <View
                        className='flex-row items-center justify-between'
                        pointerEvents='box-none'
                      >
                        <Text
                          className='text-xl text-white font-semibold text-left'
                          pointerEvents='none'
                        >
                          ⭐ {suggestion.rating}
                        </Text>
                        {suggestion.distanceInKm && (
                          <Text
                            className='text-xl text-white opacity-90 text-right'
                            pointerEvents='none'
                          >
                            {suggestion.distanceInKm.toFixed(1)} {copy.kmAway}
                          </Text>
                        )}
                      </View>
                      {(suggestion.openingHours ||
                        suggestion.closesAt ||
                        suggestion.opensAt) && (
                        <View
                          className='flex-row items-center justify-between'
                          pointerEvents='box-none'
                        >
                          {suggestion.openingHours && (
                            <Text
                              className='text-lg text-white opacity-90 text-left'
                              pointerEvents='none'
                            >
                              {getOpeningHoursForToday(suggestion.openingHours)}
                            </Text>
                          )}
                          {countdown && (
                            <Text
                              className='text-lg text-white opacity-90 text-right'
                              pointerEvents='none'
                            >
                              {isCurrentlyOpen(
                                suggestion.opensAt,
                                suggestion.closesAt
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
