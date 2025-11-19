import { Animation } from "@/constants/theme";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface QuestionProps {
  question: string;
  isAnimatingOut: boolean;
}

/**
 * Animated question text component for survey.
 * Displays question text with enter/exit animations using scale, opacity, and translate effects.
 *
 * @param question - The question text to display
 * @param isAnimatingOut - Whether the question is animating out
 */
export function Question({ question, isAnimatingOut }: QuestionProps) {
  const questionScale = useSharedValue<number>(Animation.scale.hidden);
  const questionOpacity = useSharedValue<number>(Animation.opacity.hidden);
  const translateY = useSharedValue<number>(Animation.translate.question.down);

  useEffect(() => {
    if (isAnimatingOut) {
      questionScale.value = withTiming(Animation.scale.medium, {
        duration: Animation.duration.normal,
      });
      questionOpacity.value = withTiming(Animation.opacity.hidden, {
        duration: Animation.duration.normal,
      });
      translateY.value = withTiming(Animation.translate.question.up, {
        duration: Animation.duration.normal,
      });
    } else {
      questionScale.value = withSpring(
        Animation.scale.normal,
        Animation.spring
      );
      questionOpacity.value = withTiming(Animation.opacity.visible, {
        duration: Animation.duration.normal,
      });
      translateY.value = withTiming(0, { duration: Animation.duration.normal });
    }
  }, [isAnimatingOut]);

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
    <View className='items-center'>
      <Animated.View style={questionAnimatedStyle}>
        <Text className='font-groen text-6xl text-left px-8 text-black'>
          {question}
        </Text>
      </Animated.View>
    </View>
  );
}
