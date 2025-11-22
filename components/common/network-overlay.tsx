import { AnimatedBackground } from "@/components/common/animated-background";
import { FixedView } from "@/components/common/fixed-view";
import { SafeView } from "@/components/common/safe-view";
import { Animation } from "@/constants/theme";
import { useToast } from "@/contexts/toast-context";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface NetworkOverlayProps {
  visible: boolean;
}

/**
 * Network connectivity overlay component displayed when device is offline.
 * Matches the styling of swipe and survey feedback components.
 * Shows a Gen Z slang message with emoji when internet connection is lost.
 *
 * @param visible - Whether the overlay should be visible (when offline)
 */
export function NetworkOverlay({ visible }: NetworkOverlayProps) {
  const { displayToast } = useToast();

  const overlayOpacity = useSharedValue<number>(Animation.opacity.hidden);
  const overlayScale = useSharedValue<number>(Animation.scale.medium);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(Animation.opacity.visible, {
        duration: Animation.duration.normal,
      });
      overlayScale.value = withSpring(Animation.scale.normal, Animation.spring);
    } else {
      overlayOpacity.value = withTiming(Animation.opacity.hidden, {
        duration: Animation.duration.fast,
      });
      overlayScale.value = withTiming(Animation.scale.medium, {
        duration: Animation.duration.fast,
      });
    }
  }, [visible]);

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
      transform: [{ scale: overlayScale.value }],
    };
  });

  useEffect(() => {
    if (visible) {
      displayToast({
        message: "yo! connect to the internet to continue",
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <FixedView
      top={0}
      left={0}
      right={0}
      bottom={0}
      className='w-full h-full bg-neonGreen'
      style={{ zIndex: Animation.zIndex.feedback + 1 }}
    >
      <AnimatedBackground />
      <SafeView className='h-full w-full justify-center items-center'>
        <Animated.View style={overlayAnimatedStyle}>
          <View className='items-center justify-center flex-row gap-3'>
            <Text
              className='text-5xl'
              style={{ lineHeight: 60, includeFontPadding: false }}
            >
              💀
            </Text>
            <Text className='font-groen text-5xl text-black text-center lowercase'>
              no wifi
            </Text>
          </View>
        </Animated.View>
      </SafeView>
    </FixedView>
  );
}
