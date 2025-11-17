import { SuggestionFeedback } from "@/data/suggestions";
import { Text, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface SwipeFeedbackProps {
  feedback: SuggestionFeedback;
  swipeProgress: SharedValue<number>;
}

export function SwipeFeedback({ feedback, swipeProgress }: SwipeFeedbackProps) {
  const feedbackProgress = useSharedValue(0);

  // Only start showing feedback when swipe is almost finished (last 20%)
  const THRESHOLD = 0.6;

  useAnimatedReaction(
    () => swipeProgress.value,
    (progress) => {
      if (progress >= THRESHOLD) {
        // When threshold is reached, animate feedback with a minimum duration
        // This ensures smooth animation even on fast swipes
        const normalizedProgress = (progress - THRESHOLD) / (1 - THRESHOLD);
        const targetProgress = Math.min(1, normalizedProgress);

        // Animate to target with minimum duration of 400ms for smooth appearance
        feedbackProgress.value = withTiming(targetProgress, {
          duration: Math.max(400, (1 - normalizedProgress) * 400),
        });
      } else {
        // Reset when below threshold
        feedbackProgress.value = withTiming(0, { duration: 200 });
      }
    }
  );

  const feedbackAnimatedStyle = useAnimatedStyle(() => {
    const progress = feedbackProgress.value;

    // Opacity increases from 0 to 1
    const opacity = progress;

    // Scale increases from 0.6 to 1.0
    const scale = 0.6 + progress * 0.4;

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <View
      className='absolute top-0 left-0 right-0 bottom-0 pointer-events-none items-center justify-center'
      style={{ zIndex: 2000 }}
    >
      <Animated.View style={feedbackAnimatedStyle}>
        <View className='items-center justify-center flex-row gap-4'>
          <Text className='text-4xl'>{feedback.emoji}</Text>
          <Text className='font-groen text-4xl text-black text-center lowercase'>
            {feedback.text}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
