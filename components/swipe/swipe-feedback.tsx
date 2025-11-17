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

interface SwipeFeedbackProps {
  feedback: SuggestionFeedback;
  swipeProgress: SharedValue<number>;
}

export function SwipeFeedback({ feedback, swipeProgress }: SwipeFeedbackProps) {
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
          <Text className='text-4xl'>{feedback.emoji}</Text>
          <Text className='font-groen text-4xl text-black text-center lowercase'>
            {feedback.text}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

