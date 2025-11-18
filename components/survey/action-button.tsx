import { IconButton } from "@/components/common/icon-button";
import { TextButton } from "@/components/common/text-button";
import {
  ButtonIcon,
  ButtonSize,
  ButtonSizeType,
  ButtonVariant,
  ButtonVariantType,
} from "@/constants/buttons";
import { Animation } from "@/constants/theme";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface ActionButtonProps {
  label?: string;
  icon?: ButtonIcon;
  variant?: ButtonVariantType;
  size?: ButtonSizeType;
  onPress: () => void;
  index: number;
  isAnimatingOut: boolean;
}

export function ActionButton({
  label,
  icon,
  variant = ButtonVariant.white,
  size = ButtonSize.md,
  onPress,
  index,
  isAnimatingOut,
}: ActionButtonProps) {
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
      {icon ? (
        <IconButton
          onPress={onPress}
          icon={icon}
          variant={variant}
          size={size}
        />
      ) : (
        <TextButton
          onPress={onPress}
          label={label || ""}
          variant={variant}
          size={size}
        />
      )}
    </Animated.View>
  );
}
