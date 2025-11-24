import { NeonButton } from "@/components/common/neon-button";
import { Animation } from "@/constants/theme";
import { useChoiceFeedback } from "@/hooks/use-choice-feedback";
import { isValidEmoji } from "@/utils/emoji";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface Choice {
  label: string;
  emoji: string;
  value: string;
}

interface ChoiceButtonProps {
  choice: Choice;
  index: number;
  onPress: () => void;
  isAnimatingOut: boolean;
}

/**
 * Animated choice button component for survey questions.
 * Displays a choice option with emoji and label, with staggered enter/exit animations.
 * Provides haptic and audio feedback on press.
 *
 * @param choice - Choice object containing label, emoji, and value
 * @param index - Index for staggered animation timing
 * @param onPress - Callback function called when choice is selected
 * @param isAnimatingOut - Whether the button is animating out
 */
export function ChoiceButton({
  choice,
  index,
  onPress,
  isAnimatingOut,
}: ChoiceButtonProps) {
  const { onChoicePress } = useChoiceFeedback();
  const scale = useSharedValue<number>(Animation.scale.hidden);
  const opacity = useSharedValue<number>(Animation.opacity.hidden);
  const translateY = useSharedValue<number>(Animation.translate.choice.down);

  useEffect(() => {
    if (isAnimatingOut) {
      scale.value = withDelay(
        index * Animation.delay.choiceStagger,
        withTiming(Animation.scale.medium, {
          duration: Animation.duration.normal,
        })
      );
      opacity.value = withDelay(
        index * Animation.delay.choiceStagger,
        withTiming(Animation.opacity.hidden, {
          duration: Animation.duration.normal,
        })
      );
      translateY.value = withDelay(
        index * Animation.delay.choiceStagger,
        withTiming(Animation.translate.choice.up, {
          duration: Animation.duration.normal,
        })
      );
    } else {
      scale.value = Animation.scale.hidden;
      opacity.value = Animation.opacity.hidden;
      translateY.value = Animation.translate.choice.down;
      scale.value = withDelay(
        index * Animation.delay.choiceStagger,
        withSpring(Animation.scale.normal, Animation.spring)
      );
      opacity.value = withDelay(
        index * Animation.delay.choiceStagger,
        withTiming(Animation.opacity.visible, {
          duration: Animation.duration.normal,
        })
      );
      translateY.value = withDelay(
        index * Animation.delay.choiceStagger,
        withTiming(0, { duration: Animation.duration.normal })
      );
    }
  }, [index, isAnimatingOut]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const handlePress = () => {
    onChoicePress();
    onPress();
  };

  const displayEmoji = isValidEmoji(choice.emoji) ? choice.emoji : "⭐";

  return (
    <Animated.View style={animatedStyle}>
      <NeonButton onPress={handlePress}>
        <View className='flex-row items-center gap-3'>
          <Text className='text-3xl' numberOfLines={1}>
            {displayEmoji}
          </Text>
          <Text
            className='text-xl text-left font-semibold text-black'
            numberOfLines={1}
          >
            {choice.label}
          </Text>
        </View>
      </NeonButton>
    </Animated.View>
  );
}
