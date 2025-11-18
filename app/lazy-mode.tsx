import { IconButton } from "@/components/common/icon-button";
import { ButtonSize, ButtonVariant } from "@/constants/button";
import { Inputs } from "@/constants/inputs";
import { Shadows } from "@/constants/theme";
import { Timeouts } from "@/constants/timeouts";
import { useSurvey } from "@/contexts/survey-context";
import { useToast } from "@/contexts/toast-context";
import { generateTags } from "@/services/gemini";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";

const copy = {
  question: "What you lookin' for?",
  placeholder: "Just dump your thoughts and we'll find you the best spots",
  minCharacters: "Minimum 5 characters",
};

const MIN_LENGTH = 5;

export default function LazyModeScreen() {
  const router = useRouter();
  const { setAnswers, setIsComplete } = useSurvey();
  const { displayToast } = useToast();
  const [value, setValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, Timeouts.inputFocus);
  }, []);

  const isValid = value.trim().length >= MIN_LENGTH;

  const handleCancel = () => {
    router.back();
  };

  const handleSubmit = useCallback(async () => {
    if (!isValid || isLoading) return;

    setIsLoading(true);
    try {
      const tags = await generateTags(value.trim());
      setAnswers(tags);
      setIsComplete(true);
      router.back();
    } catch {
      displayToast({
        message: "Yo! Failed to extract tags. Try again.",
      });
    } finally {
      setValue("");
      setIsLoading(false);
    }
  }, [
    isValid,
    isLoading,
    value,
    setAnswers,
    setIsComplete,
    router,
    displayToast,
  ]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className='flex-1 bg-neonGreen'
    >
      <View className='flex-row justify-between items-center p-8'>
        <IconButton onPress={handleCancel} icon='close' size={ButtonSize.md} />
        <IconButton
          onPress={handleSubmit}
          icon='checkmark'
          variant={ButtonVariant.black}
          size={ButtonSize.md}
          disabled={!isValid}
          loading={isLoading}
        />
      </View>

      <View className='flex-1 px-8 pt-8 items-center'>
        <Text className='text-5xl font-bold text-black text-center font-groen mb-8 px-4'>
          {copy.question}
        </Text>

        <TextInput
          ref={inputRef}
          className='w-full py-4 px-8 rounded-[24px] bg-white text-xl font-medium text-black outline-none'
          style={[
            {
              maxWidth: Inputs.lazyMode.style.maxWidth,
              minHeight: Inputs.lazyMode.style.minHeight,
            },
            Shadows.neonPink,
          ]}
          value={value}
          onChangeText={setValue}
          placeholder={copy.placeholder}
          placeholderTextColor='rgb(100, 100, 100)'
          multiline={true}
          returnKeyType='default'
          autoFocus={true}
          editable={!isLoading}
        />

        <Text className='mt-8 text-base text-black opacity-50'>
          {copy.minCharacters}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
