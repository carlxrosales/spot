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
import { Colors, Spacing } from "@/constants/theme";
import { useSurveyContext } from "@/contexts/SurveyContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

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
      <FixedView top={0} left={0} right={0} bottom={0} style={styles.container}>
        <AnimatedBackground />
        <AbsoluteView top={Spacing.lg} style={styles.logoContainer}>
          <Logo />
        </AbsoluteView>
        <Toast
          message={error || ""}
          visible={showError}
          onHide={() => {
            setShowError(false);
          }}
        />
        <View style={styles.contentContainer}>
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
            <View style={styles.choicesContainer}>
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
          bottom={Spacing.lg}
          left={Spacing.lg}
          style={styles.buttonsContainer}
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

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: Colors.neonGreen,
  },
  logoContainer: {
    left: 0,
    right: 0,
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    gap: Spacing.lg,
  },
  choicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
    minHeight: 100,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
});
