import { Animation } from "@/constants/theme";
import { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface LogoProps {
  isAnimated?: boolean;
  isAnimatingOut?: boolean;
}

/**
 * Application logo component with optional animations.
 * Displays "spot" text with custom font and supports enter/exit animations.
 *
 * @param isAnimated - Whether to enable animations (default: false)
 * @param isAnimatingOut - Whether the logo is animating out (default: false)
 */
export function Logo({
  isAnimated = false,
  isAnimatingOut = false,
}: LogoProps) {
  const scale = useSharedValue<number>(Animation.scale.hidden);
  const opacity = useSharedValue<number>(Animation.opacity.hidden);
  const translateY = useSharedValue<number>(Animation.translate.question.down);

  useEffect(() => {
    if (isAnimated && isAnimatingOut) {
      scale.value = withTiming(Animation.scale.medium, {
        duration: Animation.duration.normal,
      });
      opacity.value = withTiming(Animation.opacity.hidden, {
        duration: Animation.duration.normal,
      });
      translateY.value = withTiming(Animation.translate.question.up, {
        duration: Animation.duration.normal,
      });
    } else {
      scale.value = isAnimated
        ? withSpring(Animation.scale.normal, Animation.spring)
        : 1;
      opacity.value = isAnimated
        ? withTiming(Animation.opacity.visible, {
            duration: Animation.duration.normal,
          })
        : 1;
      translateY.value = isAnimated
        ? withTiming(0, { duration: Animation.duration.normal })
        : 0;
    }
  }, [isAnimatingOut, isAnimated]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: isAnimated
        ? [{ scale: scale.value }, { translateY: translateY.value }]
        : [{ scale: 1 }, { translateY: 0 }],
      opacity: isAnimated ? opacity.value : 1,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Text className='font-groen text-4xl text-black'>spot</Text>
    </Animated.View>
  );
}
