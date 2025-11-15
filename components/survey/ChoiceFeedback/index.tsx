import { Animation } from "@/constants/theme";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { styles } from "./styles";

interface ChoiceFeedbackProps {
  visible: boolean;
  feedback: string;
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

  if (!visible || !feedback) return null;

  return (
    <View style={styles.feedbackContainer}>
      <Animated.View style={feedbackAnimatedStyle}>
        <Text style={styles.feedbackText}>{feedback}</Text>
      </Animated.View>
    </View>
  );
}
