import { ImageCarousel } from "@/components/common/ImageCarousel";
import { Animation } from "@/constants/theme";
import { useSuggestions } from "@/contexts/SuggestionsContext";
import { Suggestion, suggestionFeedbacks } from "@/data/suggestions";
import { useEffect, useRef, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedScrollHandler,
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

export function SwipeableCard({ suggestion }: SwipeableCardProps) {
  const { handleSwipeLeft, handleSwipeRight } = useSuggestions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const [selectedFeedback, setSelectedFeedback] = useState<{
    text: string;
    emoji: string;
  } | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  useEffect(() => {
    // Reset all values
    translateX.value = 0;
    translateY.value = 0;
    scrollY.value = 0;
    setSelectedFeedback(null);
    setCurrentPhotoIndex(0);

    // Set initial state for animation
    scale.value = 0.8;
    opacity.value = 0;

    // Trigger pop in animation
    scale.value = withSpring(1, Animation.spring);
    opacity.value = withTiming(1, { duration: 300 });

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
  }, [suggestion.id]);

  const cardStyle = useAnimatedStyle(() => {
    const rotation = translateX.value / 20;
    const cardScale = scale.value;

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
        { scale: cardScale },
      ],
      opacity: opacity.value,
      height: "100%",
      width: "100%",
      zIndex: 1000,
    };
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      if (
        scrollY.value <= 0 ||
        Math.abs(event.translationX) > Math.abs(event.translationY) * 2
      ) {
        translateX.value = event.translationX;
        translateY.value = event.translationY * 0.1;
      }
    })
    .onEnd((event) => {
      const shouldSwipeLeft = event.translationX < -SWIPE_THRESHOLD;
      const shouldSwipeRight = event.translationX > SWIPE_THRESHOLD;

      if (shouldSwipeLeft) {
        // Generate and set feedback
        const randomIndex = Math.floor(
          Math.random() * suggestionFeedbacks.length
        );
        setSelectedFeedback(suggestionFeedbacks[randomIndex]);

        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });

        // Call callback after animation completes and feedback is shown longer
        setTimeout(() => {
          handleSwipeLeft();
        }, 800);
      } else if (shouldSwipeRight) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });

        // Call callback after animation completes and feedback is shown longer
        setTimeout(() => {
          handleSwipeRight();
        }, 800);
      } else {
        translateX.value = withSpring(0, Animation.spring);
        translateY.value = withSpring(0, Animation.spring);
      }
    });

  return (
    <>
      <SwipeFeedback feedback={selectedFeedback} />
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
            <Animated.ScrollView
              ref={scrollViewRef}
              className='flex-1'
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={scrollHandler}
            >
              <View className='bg-white p-6'>
                <Text className='text-base text-black opacity-70 mb-4'>
                  {suggestion.address}
                </Text>
                {suggestion.description && (
                  <Text className='text-base text-black opacity-80 mb-4'>
                    {suggestion.description}
                  </Text>
                )}
                {suggestion.priceLevel && (
                  <Text className='text-base text-black opacity-70 mb-4'>
                    {"$".repeat(suggestion.priceLevel)}
                  </Text>
                )}
                {suggestion.types.length > 0 && (
                  <View className='flex-row flex-wrap mt-2'>
                    {suggestion.types
                      .filter((type) => type !== "establishment")
                      .slice(0, 3)
                      .map((type, idx) => (
                        <View
                          key={idx}
                          className='bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2'
                        >
                          <Text className='text-xs text-black capitalize'>
                            {type.replace(/_/g, " ")}
                          </Text>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            </Animated.ScrollView>
          </View>
        </GestureDetector>
      </Animated.View>
    </>
  );
}
