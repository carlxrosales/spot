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

/**
 * Toast notification component with slide animations.
 * Displays a temporary message at the top or bottom of the screen with auto-dismiss functionality.
 *
 * @param message - Toast message text to display
 * @param visible - Whether the toast is visible
 * @param duration - Display duration in milliseconds before auto-dismissing (default: Animation.duration.toast)
 * @param position - Toast position on screen (default: "top")
 */
export function Toast({
  message,
  visible,
  duration = Animation.duration.toast,
  position = "top",
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue<number>(
    position === "top"
      ? Animation.translate.toast.top
      : Animation.translate.toast.bottom
  );
  const opacity = useSharedValue<number>(Animation.opacity.hidden);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, Animation.spring);
      opacity.value = withTiming(Animation.opacity.visible, {
        duration: Animation.duration.fast,
      });
      const timer = setTimeout(() => {
        translateY.value = withTiming(
          position === "top"
            ? Animation.translate.toast.top
            : Animation.translate.toast.bottom,
          { duration: Animation.duration.fast }
        );
        opacity.value = withTiming(Animation.opacity.hidden, {
          duration: Animation.duration.fast,
        });
      }, duration);
      return () => clearTimeout(timer);
    } else {
      translateY.value =
        position === "top"
          ? Animation.translate.toast.top
          : Animation.translate.toast.bottom;
      opacity.value = Animation.opacity.hidden;
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
        <Text className='text-white text-lg text-center font-semibold'>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
