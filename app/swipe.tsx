import { AnimatedBackground } from "@/components/common/AnimatedBackground";
import { FixedView } from "@/components/common/FixedView";
import { SafeView } from "@/components/common/SafeView";
import { SwipeableCard } from "@/components/swipe/SwipeableCard";
import { Colors } from "@/constants/theme";
import { useSuggestions } from "@/contexts/SuggestionsContext";
import { useSurvey } from "@/contexts/SurveyContext";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Swipe() {
  const router = useRouter();
  const { choices } = useSurvey();
  const { isLoading, suggestions, currentIndex, fetchSuggestions, error } =
    useSuggestions();
  const { displayToast } = useToast();

  useEffect(() => {
    if (choices.length === 0) {
      displayToast({ message: "Yo! Why you skippin' the quiz?" });
      router.replace("/");
      return;
    }

    if (suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [suggestions.length]);

  useEffect(() => {
    if (error) {
      displayToast({ message: error });
      router.replace("/");
    }
  }, [error]);

  return (
    <FixedView className='h-screen w-screen bg-neonGreen'>
      <AnimatedBackground />
      <SafeView className='h-full w-full justify-center items-center'>
        {isLoading ? (
          <View className='items-center gap-4'>
            <ActivityIndicator color={Colors.black} />
            <Text className='text-3xl font-groen font-semibold text-black'>
              Finding yo' spots...
            </Text>
          </View>
        ) : (
          <View className='h-full w-full flex-1'>
            {suggestions.length > 0 && (
              <SwipeableCard
                key={`swipeable-card-${currentIndex}`}
                suggestion={suggestions[currentIndex]}
              />
            )}
          </View>
        )}
      </SafeView>
    </FixedView>
  );
}
