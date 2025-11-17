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

interface QuestionProps {
  question: string;
  currentStep: number;
  isAnimatingOut: boolean;
}

export function Question({
  question,
  currentStep,
  isAnimatingOut,
}: QuestionProps) {
  const questionScale = useSharedValue(0);
  const questionOpacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (isAnimatingOut) {
      questionScale.value = withTiming(0.8, { duration: 300 });
      questionOpacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(-20, { duration: 300 });
    } else {
      questionScale.value = withSpring(1, Animation.spring);
      questionOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });
    }
  }, [currentStep, isAnimatingOut]);

  const questionAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: questionScale.value },
        { translateY: translateY.value },
      ],
      opacity: questionOpacity.value,
    };
  });

  return (
    <View style={styles.questionContainer}>
      <Animated.View style={questionAnimatedStyle}>
        <Text style={styles.questionText}>{question}</Text>
      </Animated.View>
    </View>
  );
}
