import { NeonButton } from "@/components/common/NeonButton";
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

export function ChoiceButton({
  choice,
  index,
  onPress,
  isAnimatingOut,
}: ChoiceButtonProps) {
  const scale = useSharedValue<number>(1);
  const opacity = useSharedValue<number>(1);
  const translateY = useSharedValue<number>(0);

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

  return (
    <Animated.View style={animatedStyle}>
      <NeonButton onPress={onPress}>
        <View className='flex-row items-center gap-3'>
          <Text className='text-3xl'>{choice.emoji}</Text>
          <Text className='text-xl text-left font-semibold text-black'>
            {choice.label}
          </Text>
        </View>
      </NeonButton>
    </Animated.View>
  );
}
