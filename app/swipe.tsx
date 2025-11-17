import { AbsoluteView } from "@/components/common/AbsoluteView";
import { AnimatedBackground } from "@/components/common/AnimatedBackground";
import { Logo } from "@/components/common/Logo";
import { SafeView } from "@/components/common/SafeView";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Swipe() {
  const router = useRouter();

  return (
    <SafeView className='flex-1 justify-center items-center bg-neonGreen'>
      <AnimatedBackground />
      <AbsoluteView top={32} className='left-0 right-0 items-center'>
        <Logo />
      </AbsoluteView>
      <AbsoluteView top={104} left={32}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className='text-lg font-bold text-black'>Back</Text>
        </TouchableOpacity>
      </AbsoluteView>
      <View className='flex-1 justify-center items-center p-8'>
        <Text className='text-3xl text-black font-groen mb-4'>Swipe Page</Text>
        <Text className='text-lg text-black font-groen opacity-70'>
          Your spots will appear here
        </Text>
      </View>
    </SafeView>
  );
}
