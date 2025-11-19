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

/**
 * Animated feedback component displayed when a survey choice is selected.
 * Shows emoji and text feedback with scale and opacity animations.
 *
 * @param visible - Whether the feedback is visible
 * @param feedback - Feedback object containing emoji and label text
 */
export function ChoiceFeedback({ visible, feedback }: ChoiceFeedbackProps) {
  const feedbackOpacity = useSharedValue<number>(Animation.opacity.hidden);
  const feedbackScale = useSharedValue<number>(Animation.scale.medium);

  useEffect(() => {
    if (visible) {
      feedbackOpacity.value = withTiming(Animation.opacity.visible, {
        duration: Animation.duration.normal,
      });
      feedbackScale.value = withSpring(
        Animation.scale.normal,
        Animation.spring
      );
    } else {
      feedbackOpacity.value = withTiming(Animation.opacity.hidden, {
        duration: Animation.duration.fast,
      });
      feedbackScale.value = withTiming(Animation.scale.medium, {
        duration: Animation.duration.fast,
      });
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
          <Text
            className='text-5xl'
            style={{ lineHeight: 60, includeFontPadding: false }}
          >
            {feedback.emoji}
          </Text>
          <Text className='font-groen text-5xl text-black text-center lowercase'>
            {feedback.label}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
