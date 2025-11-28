import { AbsoluteView } from "@/components/common/absolute-view";
import { AnimatedBackground } from "@/components/common/animated-background";
import { SafeView } from "@/components/common/safe-view";
import { Routes } from "@/constants/routes";
import { Colors } from "@/constants/theme";
import { Timeouts } from "@/constants/timeouts";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const copy = {
  redirecting: "Taking you there...",
};

/**
 * Redirect page for short /recos/[code] URLs.
 * Redirects to /recommendations/[code] while showing a loading screen.
 */
export default function RecosRedirect() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const code = params.code;

  useEffect(() => {
    if (code) {
      const timeoutId = setTimeout(() => {
        router.replace({
          pathname: Routes.recommendations,
          params: { code },
        });
      }, Timeouts.redirect);
      return () => clearTimeout(timeoutId);
    }
  }, [code, router]);

  return (
    <AbsoluteView
      top={0}
      left={0}
      right={0}
      bottom={0}
      className='w-full h-full bg-neonGreen'
    >
      <AnimatedBackground />
      <SafeView className='h-full w-full justify-center items-center'>
        <View className='items-center gap-6'>
          <ActivityIndicator size='large' color={Colors.black} />
          <Text className='text-4xl font-groen text-black'>
            {copy.redirecting}
          </Text>
        </View>
      </SafeView>
    </AbsoluteView>
  );
}
