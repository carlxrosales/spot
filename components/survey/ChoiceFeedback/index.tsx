import { Animation } from "@/constants/theme";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface ChoiceFeedbackProps {
  visible: boolean;
  feedback: { emoji: string; label: string };
}

export function ChoiceFeedback({ visible, feedback }: ChoiceFeedbackProps) {
  const feedbackOpacity = useSharedValue(0);
  const feedbackScale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      feedbackOpacity.value = withTiming(1, { duration: 300 });
      feedbackScale.value = withSpring(1, Animation.spring);
    } else {
      feedbackOpacity.value = withTiming(0, { duration: 200 });
      feedbackScale.value = withTiming(0.8, { duration: 200 });
    }
  }, [visible]);

  const feedbackAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: feedbackOpacity.value,
      transform: [{ scale: feedbackScale.value }],
    };
  });

  if (!visible || !feedback || !feedback.emoji || !feedback.label) return null;

  return (
    <View className='items-center justify-center h-screen w-screen overflow-visible'>
      <Animated.View style={feedbackAnimatedStyle}>
        <View className='items-center justify-center flex-row gap-3'>
          <Text className='text-5xl'>{feedback.emoji}</Text>
          <Text className='font-groen text-5xl text-black text-center lowercase'>
            {feedback.label}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
