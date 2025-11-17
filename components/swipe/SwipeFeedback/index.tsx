import { Animation } from "@/constants/theme";
import { SuggestionFeedback } from "@/data/suggestions";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface SwipeFeedbackProps {
  feedback: SuggestionFeedback | null;
}

export function SwipeFeedback({ feedback }: SwipeFeedbackProps) {
  const feedbackOpacity = useSharedValue(0);
  const feedbackScale = useSharedValue(0.8);
  const shouldShow = useSharedValue(false);

  useEffect(() => {
    shouldShow.value = feedback !== null;
  }, [feedback]);

  useAnimatedReaction(
    () => shouldShow.value,
    (show) => {
      if (show) {
        feedbackOpacity.value = withTiming(1, { duration: 300 });
        feedbackScale.value = withSpring(1, Animation.spring);
      } else {
        feedbackOpacity.value = withTiming(0, { duration: 200 });
        feedbackScale.value = withTiming(0.8, { duration: 200 });
      }
    }
  );

  const feedbackAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: feedbackOpacity.value,
      transform: [{ scale: feedbackScale.value }],
    };
  });

  if (!feedback) return null;

  return (
    <View className='absolute top-0 left-0 right-0 bottom-0 pointer-events-none z-50 items-center justify-center'>
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
