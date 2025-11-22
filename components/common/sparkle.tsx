import { Dimensions } from "@/constants/dimensions";
import { Animation } from "@/constants/theme";
import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export interface SparkleProps {
  startX: number;
  startY: number;
  duration: number;
}

/**
 * Animated sparkle effect component.
 * Displays a sparkle emoji with continuous movement, rotation, and opacity animations.
 *
 * @param startX - Initial X position in pixels
 * @param startY - Initial Y position in pixels
 * @param duration - Animation duration in milliseconds
 */
export function Sparkle({ startX, startY, duration }: SparkleProps) {
  const translateX = useSharedValue<number>(0);
  const translateY = useSharedValue<number>(0);
  const rotate = useSharedValue<number>(0);
  const opacity = useSharedValue<number>(Animation.sparkle.opacityMin);

  useEffect(() => {
    const movementRangeX = Dimensions.width * Animation.sparkle.movementRange;
    const movementRangeY = Dimensions.height * Animation.sparkle.movementRange;
    const randomX = (Math.random() - 0.5) * movementRangeX;
    const randomY = (Math.random() - 0.5) * movementRangeY;

    translateX.value = withRepeat(
      withTiming(randomX, {
        duration: duration,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );

    translateY.value = withRepeat(
      withTiming(randomY, {
        duration: duration + Animation.sparkle.durationOffset,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );

    rotate.value = withRepeat(
      withTiming(Animation.rotation.full, {
        duration: duration * Animation.sparkle.rotationMultiplier,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    opacity.value = withRepeat(
      withTiming(Animation.sparkle.opacityMax, {
        duration: duration * Animation.sparkle.opacityDurationDivisor,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.Text
      style={[
        {
          left: startX,
          top: startY,
        },
        {
          position: "absolute",
          fontSize: Animation.sparkle.fontSize,
        },
        animatedStyle,
      ]}
    >
      ✨
    </Animated.Text>
  );
}
