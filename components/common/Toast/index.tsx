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

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export function Toast({ message, visible, onHide }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, Animation.spring);
      opacity.value = withTiming(1, { duration: 200 });
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 }, () => {
          onHide();
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  if (!visible) return null;

  return (
    <Animated.View
      className='absolute left-0 right-0 items-center z-[1000]'
      style={[{ top: insets.top + 16 }, animatedStyle]}
    >
      <View className='bg-black px-4 py-4 rounded-2xl'>
        <Text className='text-white text-lg text-center'>{message}</Text>
      </View>
    </Animated.View>
  );
}
