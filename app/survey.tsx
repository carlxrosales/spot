import { AbsoluteView } from "@/components/common/AbsoluteView";
import { AnimatedBackground } from "@/components/common/AnimatedBackground";
import { FixedView } from "@/components/common/FixedView";
import { Logo } from "@/components/common/Logo";
import { ChoiceButton } from "@/components/survey/ChoiceButton";
import { ChoiceFeedback } from "@/components/survey/ChoiceFeedback";
import { FeelingSpontyButton } from "@/components/survey/FeelingSpontyButton";
import { Question } from "@/components/survey/Question";
import { StartOverButton } from "@/components/survey/StartOverButton";
import { Routes } from "@/constants/routes";
import { useSurvey } from "@/contexts/SurveyContext";
import { useToast } from "@/contexts/ToastContext";
import { ImFeelingSpontyChoice } from "@/data/survey";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { View } from "react-native";

const copy = {
  typeInput: "Type...",
  showSpots: "Show my spots rn",
  feelingSponty: "I'm feeling sponty",
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

  return (
    <>
      <FixedView className='bg-neonGreen h-screen w-screen'>
        <AnimatedBackground />
        <AbsoluteView top={32} className='left-0 right-0 items-center'>
          <Logo />
        </AbsoluteView>
        <View className='flex-1 justify-center items-start gap-8'>
          {!isLoading && !isComplete && currentQuestion && (
            <Question
              key={`question-${currentQuestion.question}`}
              question={currentQuestion.question}
              isAnimatingOut={isLoading}
            />
          )}
          <ChoiceFeedback
            visible={isLoading && !isComplete}
            feedback={currentQuestion?.feedback}
          />
          {!isLoading && !isComplete && currentQuestion && (
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
          )}
        </View>
        {!isComplete && (
          <AbsoluteView
            bottom={32}
            right={32}
            className='flex-row items-center justify-end gap-4'
          >
            <FeelingSpontyButton
              onPress={handleFeelingSponty}
              label={answers.length > 0 ? copy.showSpots : copy.feelingSponty}
            />
            <StartOverButton
              onPress={handleStartOver}
              disabled={answers.length === 0}
            />
          </AbsoluteView>
        )}
      </FixedView>
    </>
  );
}
