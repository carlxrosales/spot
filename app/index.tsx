import { AbsoluteView } from "@/components/common/AbsoluteView";
import { AnimatedBackground } from "@/components/common/AnimatedBackground";
import { Logo } from "@/components/common/Logo";
import { SafeView } from "@/components/common/SafeView";
import { Toast } from "@/components/common/Toast";
import { ChoiceButton } from "@/components/survey/ChoiceButton";
import { ChoiceFeedback } from "@/components/survey/ChoiceFeedback";
import { CustomInputModal } from "@/components/survey/CustomInputModal";
import { FeelingSpontyButton } from "@/components/survey/FeelingSpontyButton";
import { Question } from "@/components/survey/Question";
import { StartOverButton } from "@/components/survey/StartOverButton";
import { Colors, Fonts, Spacing } from "@/constants/theme";
import { useSurveyContext } from "@/contexts/SurveyContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

export default function Index() {
  const {
    currentStep,
    currentQuestion,
    isLoading,
    isAnimatingOut,
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
    if (isLoading || isAnimatingOut) return;
    await handleChoicePress(value);
  };

  const handleCustomInputSubmit = async () => {
    const trimmedInput = customInput.trim();
    if (trimmedInput.length >= 3 && trimmedInput.length <= 12) {
      if (isLoading || isAnimatingOut) return;
      setShowCustomInputModal(false);
      await handleChoice(trimmedInput);
      setCustomInput("");
    }
  };

  const handleCustomInputCancel = () => {
    setShowCustomInputModal(false);
    setCustomInput("");
  };

  const showLoading = isLoading;

  return (
    <>
      <SafeView style={styles.container}>
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
        {!showLoading && (
          <Question
            question={currentQuestion.question}
            currentStep={currentStep}
            isAnimatingOut={isAnimatingOut}
          />
        )}
        <ChoiceFeedback
          visible={showLoading}
          feedback={currentQuestion?.feedback}
        />
        {!showLoading && (
          <View style={styles.choicesContainer}>
            {currentQuestion.choices.map((choice, index) => (
              <ChoiceButton
                key={`${choice.value}-${index}`}
                choice={choice}
                index={index}
                onPress={() => handleChoice(choice.value)}
                currentStep={currentStep}
                isAnimatingOut={isAnimatingOut}
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
              isAnimatingOut={isAnimatingOut}
            />
          </View>
        )}
        <FeelingSpontyButton
          onPress={handleFeelingSponty}
          label={
            choices.length > 0 ? "Show my spots now" : "I'm feeling sponty"
          }
        />
        <StartOverButton onPress={handleStartOver} />
      </SafeView>

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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neonGreen,
  },
  logoContainer: {
    left: 0,
    right: 0,
    alignItems: "center",
  },
  choicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
    minHeight: 100,
  },
  completeContainer: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    alignItems: "center",
  },
  completeText: {
    fontSize: Fonts.size.xxl,
    color: Colors.black,
    textAlign: "center",
    fontFamily: Fonts.family.groen,
  },
});
