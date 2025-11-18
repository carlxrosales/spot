import { AbsoluteView } from "@/components/common/absolute-view";
import { AnimatedBackground } from "@/components/common/animated-background";
import { FixedView } from "@/components/common/fixed-view";
import { Logo } from "@/components/common/logo";
import { TextButton } from "@/components/common/text-button";
import { ChoiceButton } from "@/components/survey/choice-button";
import { ChoiceFeedback } from "@/components/survey/choice-feedback";
import { FeelingSpontyButton } from "@/components/survey/feeling-sponty-button";
import { Question } from "@/components/survey/question";
import { StartOverButton } from "@/components/survey/start-over-button";
import { Routes } from "@/constants/routes";
import { useSurvey } from "@/contexts/survey-context";
import { useToast } from "@/contexts/toast-context";
import { ImFeelingSpontyChoice } from "@/data/survey";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { View } from "react-native";

const copy = {
  typeInput: "Type...",
  showSpots: "Show my spots rn",
  feelingSponty: "I'm feeling sponty",
  lazyMode: "Lazy af mode",
};

export default function Survey() {
  const {
    currentQuestion,
    isLoading,
    error,
    isComplete,
    setIsComplete,
    answers,
    setAnswers,
    handleChoicePress,
    handleStartOver,
  } = useSurvey();
  const { displayToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      displayToast({ message: error });
    }
  }, [error, displayToast]);

  useEffect(() => {
    if (isComplete) {
      router.navigate(Routes.swipe);
    }
  }, [isComplete]);

  if (!currentQuestion) {
    return null;
  }

  const handleFeelingSponty = useCallback(() => {
    setAnswers([ImFeelingSpontyChoice.value]);
    setIsComplete(true);
  }, []);

  const handleChoice = useCallback(
    async (value: string) => {
      if (isLoading) return;
      await handleChoicePress(value);
    },
    [isLoading, handleChoicePress]
  );

  const handleCustomInputPress = useCallback(() => {
    router.navigate({
      pathname: Routes.customInput,
      params: { question: currentQuestion?.question || "" },
    });
  }, [currentQuestion]);

  const handleLazyModePress = useCallback(() => {
    router.navigate(Routes.lazyMode);
  }, [router]);

  return (
    <>
      <FixedView className='bg-neonGreen h-screen w-screen' withSafeAreaInsets>
        <AnimatedBackground />
        <AbsoluteView
          top={32}
          left={0}
          right={0}
          className='items-center'
          withSafeAreaInsets
        >
          <Logo />
        </AbsoluteView>
        <View className='flex-1 justify-center items-start gap-8'>
          <ChoiceFeedback
            visible={isLoading && !isComplete}
            feedback={currentQuestion?.feedback}
          />
          {!isLoading && !isComplete && currentQuestion && (
            <>
              <Question
                key={`question-${currentQuestion.question}`}
                question={currentQuestion.question}
                isAnimatingOut={isLoading}
              />
              <View className='flex-row flex-wrap justify-start px-8 gap-8 min-h-[100px]'>
                {currentQuestion.choices.map((choice, index) => (
                  <ChoiceButton
                    key={`${choice.value}-${index}-${currentQuestion.question}`}
                    choice={choice}
                    index={index}
                    onPress={() => handleChoice(choice.value)}
                    isAnimatingOut={isLoading && !isComplete}
                  />
                ))}
                <ChoiceButton
                  key={`custom-input-${currentQuestion.question}`}
                  choice={{
                    emoji: "💬",
                    label: copy.typeInput,
                    value: "custom-input",
                  }}
                  index={currentQuestion.choices.length}
                  onPress={handleCustomInputPress}
                  isAnimatingOut={isLoading && !isComplete}
                />
              </View>
            </>
          )}
        </View>
        {!isLoading && !isComplete && (
          <AbsoluteView
            bottom={32}
            right={32}
            className='flex-row items-center justify-end gap-4'
            withSafeAreaInsets
          >
            <FeelingSpontyButton
              onPress={handleFeelingSponty}
              label={answers.length > 0 ? copy.showSpots : copy.feelingSponty}
            />
            {answers.length === 0 ? (
              <TextButton
                onPress={handleLazyModePress}
                label={copy.lazyMode}
                variant='white'
                size='md'
              />
            ) : (
              <StartOverButton onPress={handleStartOver} disabled={false} />
            )}
          </AbsoluteView>
        )}
      </FixedView>
    </>
  );
}
