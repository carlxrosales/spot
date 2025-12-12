import { AbsoluteView } from "@/components/common/absolute-view";
import { AnimatedBackground } from "@/components/common/animated-background";
import { AnimatedButton } from "@/components/common/animated-button";
import { Logo } from "@/components/common/logo";
import { ChoiceButton } from "@/components/survey/choice-button";
import { ChoiceFeedback } from "@/components/survey/choice-feedback";
import { Question } from "@/components/survey/question";
import { ButtonSize, ButtonVariant } from "@/constants/buttons";
import { Routes } from "@/constants/routes";
import { Survey as SurveyConstants } from "@/constants/survey";
import { useSurvey } from "@/contexts/survey-context";
import { useToast } from "@/contexts/toast-context";
import { SpontyChoice } from "@/data/survey";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { View } from "react-native";

const copy = {
  typeInput: "Type...",
  showSpots: "Show my spots rn",
  feelingSponty: "I'm feeling sponty",
  lazyMode: "Lazy af mode",
};

/**
 * Survey screen component.
 * Displays interactive survey questions with animated choices and feedback.
 * Supports custom input, lazy mode, and sponty quick selection.
 * Automatically navigates to swipe screen when survey is complete.
 */
export default function Survey() {
  const router = useRouter();

  const {
    questions,
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

  useEffect(() => {
    if (error) {
      displayToast({ message: error });
    }
  }, [error, displayToast]);

  useEffect(() => {
    if (isComplete) {
      router.navigate(Routes.suggestions);
    }
  }, [isComplete, router]);

  if (!currentQuestion) {
    return null;
  }

  const handleFeelingSponty = useCallback(() => {
    setAnswers([SpontyChoice.value]);
    setIsComplete(true);
  }, [setAnswers, setIsComplete]);

  const handleShowSpots = useCallback(() => {
    setIsComplete(true);
  }, [setIsComplete]);

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

  const handleAreaSearchPress = useCallback(() => {
    router.navigate(Routes.areaSearch);
  }, [router]);

  const handleMySpotsPress = useCallback(() => {
    router.navigate(Routes.mySpots);
  }, [router]);

  return (
    <>
      <AbsoluteView
        top={0}
        left={0}
        right={0}
        bottom={0}
        className='w-full h-full bg-neonGreen'
        withSafeAreaInsets
      >
        <AnimatedBackground />
        {answers.length === 0 && (
          <AbsoluteView
            top={32}
            left={32}
            right={32}
            className='flex-row items-center justify-between'
            withSafeAreaInsets
            style={{ zIndex: 1 }}
          >
            <Logo isAnimated />
            <View className='flex-row items-center gap-3'>
              <AnimatedButton
                label='My spots'
                variant={ButtonVariant.black}
                size={ButtonSize.sm}
                onPress={handleMySpotsPress}
                index={0}
                isAnimatingOut={isLoading}
              />
              <AnimatedButton
                icon='search'
                variant={ButtonVariant.white}
                size={ButtonSize.sm}
                onPress={handleAreaSearchPress}
                index={1}
                isAnimatingOut={isLoading}
              />
            </View>
          </AbsoluteView>
        )}
        <View className='flex-1 justify-center items-start gap-8'>
          <ChoiceFeedback
            visible={isLoading}
            feedback={currentQuestion?.feedback}
          />
          {!isLoading && currentQuestion && (
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
                    isAnimatingOut={isLoading}
                  />
                ))}
                {questions.length > 1 && (
                  <ChoiceButton
                    key={`custom-input-${currentQuestion.question}`}
                    choice={{
                      emoji: "💬",
                      label: copy.typeInput,
                      value: "custom-input",
                    }}
                    index={currentQuestion.choices.length}
                    onPress={handleCustomInputPress}
                    isAnimatingOut={isLoading}
                  />
                )}
              </View>
            </>
          )}
        </View>
        {!isLoading && (
          <AbsoluteView bottom={32} left={32} right={32} withSafeAreaInsets>
            {answers.length > 0 ? (
              <View className='w-full flex-1 flex-row items-center justify-end gap-4'>
                {answers.length >= SurveyConstants.minimumAnswers && (
                  <AnimatedButton
                    label={copy.showSpots}
                    variant={ButtonVariant.black}
                    onPress={handleShowSpots}
                    index={0}
                    isAnimatingOut={isLoading}
                  />
                )}
                <AnimatedButton
                  icon='reload'
                  variant={ButtonVariant.white}
                  onPress={handleStartOver}
                  index={1}
                  isAnimatingOut={isLoading}
                />
              </View>
            ) : (
              <View className='w-full flex-1 flex-col items-end justify-end gap-4'>
                <AnimatedButton
                  label={copy.feelingSponty}
                  size={ButtonSize.md}
                  variant={ButtonVariant.black}
                  onPress={handleFeelingSponty}
                  index={0}
                  isAnimatingOut={isLoading}
                />
                <AnimatedButton
                  label={copy.lazyMode}
                  size={ButtonSize.md}
                  variant={ButtonVariant.white}
                  onPress={handleLazyModePress}
                  index={1}
                  isAnimatingOut={isLoading}
                />
              </View>
            )}
          </AbsoluteView>
        )}
      </AbsoluteView>
    </>
  );
}
