import { IconButton } from "@/components/common/icon-button";
import { SafeView } from "@/components/common/safe-view";
import { ButtonSize, ButtonVariant } from "@/constants/buttons";
import { Inputs } from "@/constants/inputs";
import { Timeouts } from "@/constants/timeouts";
import { useSurvey } from "@/contexts/survey-context";
import { useToast } from "@/contexts/toast-context";
import { getShadow } from "@/utils/shadows";
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

/**
 * Lazy mode screen component.
 * Allows users to input free-form text describing what they're looking for.
 * Uses AI to extract tags from the input and automatically completes the survey.
 * Navigates back to previous screen after processing.
 */
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

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleSubmit = useCallback(async () => {
    if (!isValid || isLoading) return;

    setIsLoading(true);
    try {
      setAnswers([value.trim()]);
      setIsComplete(true);
      router.back();
    } catch {
      displayToast({
        message: "Oof! Somethin' went wrong, let's start over",
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
      <SafeView edges={Platform.OS === "android" ? ["top"] : []}>
        <View></View>
      </SafeView>

      <View className='flex-row justify-between items-center p-8'>
        <IconButton onPress={handleCancel} icon='close' size={ButtonSize.md} />
        <IconButton
          onPress={handleSubmit}
          icon='checkmark-sharp'
          variant={ButtonVariant.black}
          size={ButtonSize.md}
          disabled={!isValid}
          loading={isLoading}
        />
      </View>

      <View className='flex-1 px-8 pt-8 items-center'>
        <Text className='font-groen text-5xl text-black text-center mb-8 px-4'>
          {copy.question}
        </Text>

        <View
          className='w-full rounded-[24px]'
          style={[
            {
              maxWidth: Inputs.lazyMode.style.maxWidth,
            },
            getShadow("neonPink"),
          ]}
        >
          <TextInput
            ref={inputRef}
            className='w-full py-4 px-8 rounded-[24px] bg-white text-xl font-medium text-black'
            style={{
              minHeight: Inputs.lazyMode.style.minHeight,
            }}
            value={value}
            textAlign='left'
            textAlignVertical='top'
            onChangeText={setValue}
            placeholder={copy.placeholder}
            placeholderTextColor='rgb(100, 100, 100)'
            multiline={true}
            numberOfLines={5}
            returnKeyType='default'
            autoFocus={true}
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>

        <Text className='mt-8 text-base text-black opacity-50'>
          {copy.minCharacters}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
