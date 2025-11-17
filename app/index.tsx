import { AbsoluteView } from "@/components/common/AbsoluteView";
import { AnimatedBackground } from "@/components/common/AnimatedBackground";
import { FixedView } from "@/components/common/FixedView";
import { Logo } from "@/components/common/Logo";
import { Toast } from "@/components/common/Toast";
import { ChoiceButton } from "@/components/survey/ChoiceButton";
import { ChoiceFeedback } from "@/components/survey/ChoiceFeedback";
import { CustomInputModal } from "@/components/survey/CustomInputModal";
import { FeelingSpontyButton } from "@/components/survey/FeelingSpontyButton";
import { Question } from "@/components/survey/Question";
import { StartOverButton } from "@/components/survey/StartOverButton";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/constants/dimensions";
import { useSurveyContext } from "@/contexts/SurveyContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function Index() {
  const {
    currentStep,
    currentQuestion,
    isLoading,
    error,
    isComplete,
    choices,
    handleChoicePress,
    handleStartOver,
  } = useSurveyContext();
  const [showError, setShowError] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [showCustomInputModal, setShowCustomInputModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  useEffect(() => {
    if (isComplete) {
      router.push("/swipe");
    }
  }, [isComplete, router]);

  useEffect(() => {
    setCustomInput("");
    setShowCustomInputModal(false);
  }, [currentStep]);

  if (!currentQuestion) {
    return null;
  }

  const handleFeelingSponty = () => {
    if (choices.length > 0) {
      router.push("/swipe");
    } else {
      router.push("/swipe");
    }
  };

  const handleChoice = async (value: string) => {
    if (isLoading) return;
    await handleChoicePress(value);
  };

  const handleCustomInputSubmit = async () => {
    const trimmedInput = customInput.trim();
    if (trimmedInput.length >= 3 && trimmedInput.length <= 12) {
      if (isLoading) return;
      setShowCustomInputModal(false);
      await handleChoice(trimmedInput);
      setCustomInput("");
    }
  };

  const handleCustomInputCancel = () => {
    setShowCustomInputModal(false);
    setCustomInput("");
  };

  return (
    <>
      <FixedView
        top={0}
        left={0}
        right={0}
        bottom={0}
        className='bg-neonGreen'
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
      >
        <AnimatedBackground />
        <AbsoluteView top={32} className='left-0 right-0 items-center'>
          <Logo />
        </AbsoluteView>
        <Toast
          message={error || ""}
          visible={showError}
          onHide={() => {
            setShowError(false);
          }}
        />
        <View className='flex-1 justify-center items-start gap-8'>
          {!isLoading && (
            <Question
              key={`question-${currentStep}`}
              question={currentQuestion.question}
              currentStep={currentStep}
              isAnimatingOut={isLoading}
            />
          )}
          <ChoiceFeedback
            visible={isLoading}
            feedback={currentQuestion?.feedback}
          />
          {!isLoading && (
            <View className='flex-row flex-wrap justify-start px-8 gap-8 min-h-[100px]'>
              {currentQuestion.choices.map((choice, index) => (
                <ChoiceButton
                  key={`${choice.value}-${index}`}
                  choice={choice}
                  index={index}
                  onPress={() => handleChoice(choice.value)}
                  currentStep={currentStep}
                  isAnimatingOut={isLoading}
                />
              ))}
              <ChoiceButton
                key='custom-input'
                choice={{
                  emoji: "💬",
                  label: "Type...",
                  value: "custom-input",
                }}
                index={currentQuestion.choices.length}
                onPress={() => setShowCustomInputModal(true)}
                currentStep={currentStep}
                isAnimatingOut={isLoading}
              />
            </View>
          )}
        </View>
        <AbsoluteView
          bottom={32}
          left={32}
          className='flex-row items-center gap-8'
        >
          <StartOverButton
            onPress={handleStartOver}
            disabled={currentStep === 0}
          />
          <FeelingSpontyButton
            onPress={handleFeelingSponty}
            label={
              choices.length > 0 ? "Show my spots rn" : "I'm feeling sponty"
            }
          />
        </AbsoluteView>
      </FixedView>

      <CustomInputModal
        visible={showCustomInputModal}
        question={currentQuestion?.question || ""}
        value={customInput}
        onChangeText={setCustomInput}
        onCancel={handleCustomInputCancel}
        onSubmit={handleCustomInputSubmit}
      />
    </>
  );
}
