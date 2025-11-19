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

interface AnimatedButtonProps {
  label?: string;
  icon?: ButtonIcon;
  variant?: ButtonVariantType;
  size?: ButtonSizeType;
  onPress: () => void;
  index?: number;
  isAnimatingOut?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Animated button component with enter/exit animations.
 * Wraps either IconButton or TextButton with scale, opacity, and translate animations.
 * Supports staggered animations based on index.
 *
 * @param label - Text label for text button variant
 * @param icon - Icon name for icon button variant
 * @param variant - Button color variant (default: "white")
 * @param size - Button size (default: "md")
 * @param onPress - Callback function called when button is pressed
 * @param index - Animation index for staggered effects (default: 0)
 * @param isAnimatingOut - Whether the button is animating out (optional)
 * @param disabled - Whether the button is disabled (default: false)
 * @param loading - Whether the button is in loading state (default: false)
 */
export function AnimatedButton({
  label,
  icon,
  variant = ButtonVariant.white,
  size = ButtonSize.md,
  onPress,
  index = 0,
  isAnimatingOut,
  disabled = false,
  loading = false,
}: AnimatedButtonProps) {
  const scale = useSharedValue<number>(1);
  const opacity = useSharedValue<number>(1);
  const translateY = useSharedValue<number>(0);

  useEffect(() => {
    if (isAnimatingOut === undefined) {
      scale.value = 1;
      opacity.value = 1;
      translateY.value = 0;
      return;
    }

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
          disabled={disabled}
          loading={loading}
        />
      ) : (
        <TextButton
          onPress={onPress}
          label={label || ""}
          variant={variant}
          size={size}
          disabled={disabled}
          loading={loading}
        />
      )}
    </Animated.View>
  );
}
