import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/constants/dimensions";
import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { styles } from "./styles";

export interface SparkleProps {
  startX: number;
  startY: number;
  duration: number;
}

export function Sparkle({ startX, startY, duration }: SparkleProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    const movementRangeX = SCREEN_WIDTH * 0.8;
    const movementRangeY = SCREEN_HEIGHT * 0.8;
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
        duration: duration + 500,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );

    rotate.value = withRepeat(
      withTiming(360, {
        duration: duration * 2,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    opacity.value = withRepeat(
      withTiming(0.7, {
        duration: duration / 2,
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
        styles.sparkle,
        {
          left: startX,
          top: startY,
        },
        animatedStyle,
      ]}
    >
      ✨
    </Animated.Text>
  );
}
