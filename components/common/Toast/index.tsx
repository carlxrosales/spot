import { Animation } from "@/constants/theme";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastPosition = "top" | "bottom";

interface ToastProps {
  message: string;
  visible: boolean;
  duration?: number;
  position?: ToastPosition;
}

export function Toast({
  message,
  visible,
  duration = 3000,
  position = "top",
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(position === "top" ? -100 : 100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, Animation.spring);
      opacity.value = withTiming(1, { duration: 200 });
      const timer = setTimeout(() => {
        translateY.value = withTiming(position === "top" ? -100 : 100, {
          duration: 200,
        });
        opacity.value = withTiming(0, { duration: 200 });
      }, duration);
      return () => clearTimeout(timer);
    } else {
      translateY.value = position === "top" ? -100 : 100;
      opacity.value = 0;
    }
  }, [visible, duration, position]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  if (!visible) return null;

  const positionStyle =
    position === "top"
      ? { top: insets.top + 16 }
      : { bottom: insets.bottom + 16 };

  return (
    <Animated.View
      className='absolute left-0 right-0 items-center z-[1000]'
      style={[positionStyle, animatedStyle]}
    >
      <View className='bg-black px-4 py-4 rounded-2xl'>
        <Text className='text-white text-lg text-center'>{message}</Text>
      </View>
    </Animated.View>
  );
}
