import { Animation } from "@/constants/theme";
import { SuggestionFeedback } from "@/data/suggestions";
import { Text, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface SuggestionFeedbackProps {
  feedback: SuggestionFeedback;
  swipeProgress: SharedValue<number>;
}

/**
 * Animated feedback component displayed during swipe gestures.
 * Shows emoji and text feedback that appears when swipe progress exceeds the threshold.
 * Opacity and scale animations are tied to swipe progress.
 *
 * @param feedback - Feedback object containing emoji and text
 * @param swipeProgress - Shared value representing the current swipe progress (0-1)
 */
export function SuggestionFeedback({
  feedback,
  swipeProgress,
}: SuggestionFeedbackProps) {
  const feedbackProgress = useSharedValue<number>(0);

  useAnimatedReaction(
    () => swipeProgress.value,
    (progress) => {
      if (progress >= Animation.threshold.swipeFeedback) {
        const normalizedProgress =
          (progress - Animation.threshold.swipeFeedback) /
          (1 - Animation.threshold.swipeFeedback);
        const targetProgress = Math.min(
          Animation.opacity.visible,
          normalizedProgress
        );

        feedbackProgress.value = withTiming(targetProgress, {
          duration: Math.max(
            Animation.duration.medium,
            (1 - normalizedProgress) * Animation.duration.medium
          ),
        });
      } else {
        feedbackProgress.value = withTiming(Animation.opacity.hidden, {
          duration: Animation.duration.fast,
        });
      }
    }
  );

  const feedbackAnimatedStyle = useAnimatedStyle(() => {
    const progress = feedbackProgress.value;

    const opacity = progress;
    const scale =
      Animation.feedback.scaleMin + progress * Animation.feedback.scaleRange;

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <View
      className='absolute top-0 left-0 right-0 bottom-0 pointer-events-none items-center justify-center'
      style={{ zIndex: Animation.zIndex.feedback }}
    >
      <Animated.View style={feedbackAnimatedStyle}>
        <View className='items-center justify-center flex-row gap-4'>
          <Text
            className='text-4xl'
            style={{ lineHeight: 48, includeFontPadding: false }}
          >
            {feedback.emoji}
          </Text>
          <Text className='font-groen text-4xl text-black text-center lowercase'>
            {feedback.text}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
