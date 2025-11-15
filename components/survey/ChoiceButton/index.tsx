import { Button } from "@/components/common/Button";
import { Animation } from "@/constants/theme";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { styles } from "./styles";

interface Choice {
  label: string;
  emoji: string;
  value: string;
}

interface ChoiceButtonProps {
  choice: Choice;
  index: number;
  onPress: () => void;
  currentStep: number;
  isAnimatingOut: boolean;
}

export function ChoiceButton({
  choice,
  index,
  onPress,
  currentStep,
  isAnimatingOut,
}: ChoiceButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (isAnimatingOut) {
      scale.value = withDelay(
        index * Animation.delay.choiceStagger,
        withTiming(0.8, { duration: 300 })
      );
      opacity.value = withDelay(
        index * Animation.delay.choiceStagger,
        withTiming(0, { duration: 300 })
      );
      translateY.value = withDelay(
        index * Animation.delay.choiceStagger,
        withTiming(-10, { duration: 300 })
      );
    } else {
      scale.value = 0;
      opacity.value = 0;
      translateY.value = 10;
      scale.value = withDelay(
        index * Animation.delay.choiceStagger,
        withSpring(1, Animation.spring)
      );
      opacity.value = withDelay(
        index * Animation.delay.choiceStagger,
        withTiming(1, { duration: 300 })
      );
      translateY.value = withDelay(
        index * Animation.delay.choiceStagger,
        withTiming(0, { duration: 300 })
      );
    }
  }, [currentStep, index, isAnimatingOut]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Button onPress={onPress}>
        <View style={styles.choiceContent}>
          <Text style={styles.emoji}>{choice.emoji}</Text>
          <Text style={styles.choiceText}>{choice.label}</Text>
        </View>
      </Button>
    </Animated.View>
  );
}
