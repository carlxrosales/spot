import { IconButton } from "@/components/common/icon-button";
import { SafeView } from "@/components/common/safe-view";
import { ButtonSize, ButtonVariant } from "@/constants/buttons";
import { Inputs } from "@/constants/inputs";
import { Timeouts } from "@/constants/timeouts";
import { useSurvey } from "@/contexts/survey-context";
import { getShadow } from "@/utils/shadows";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";

const copy = {
  charactersOnly: "characters only",
};

/**
 * Custom input screen component.
 * Modal screen that allows users to type a custom answer to a survey question.
 * Validates input length and submits the answer when valid.
 * Displays the current question and character limit requirements.
 */
export default function CustomInputScreen() {
  const router = useRouter();

  const { question } = useLocalSearchParams<{ question: string }>();
  const { handleChoicePress, isLoading } = useSurvey();

  const [value, setValue] = useState<string>("");

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, Timeouts.inputFocus);
  }, []);

  const isValid =
    value.trim().length >= Inputs.answer.validation.minLength &&
    value.trim().length <= Inputs.answer.validation.maxLength;

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleTextChange = useCallback((text: string) => {
    const textWithoutNewlines = text.replace(/\n/g, "");
    if (textWithoutNewlines !== text) {
      Keyboard.dismiss();
    }
    setValue(textWithoutNewlines);
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmedInput = value.trim();
    if (
      trimmedInput.length >= Inputs.answer.validation.minLength &&
      trimmedInput.length <= Inputs.answer.validation.maxLength &&
      !isLoading
    ) {
      handleChoicePress(trimmedInput);
      router.back();
    }
  }, [value, isLoading, handleChoicePress, router]);

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
          disabled={!isValid || isLoading}
        />
      </View>

      <View className='flex-1 px-8 pt-8 items-center'>
        <Text className='font-groen text-5xl text-black text-center mb-8 px-4'>
          {question || ""}
        </Text>

        <View
          className='w-full rounded-[24px]'
          style={[
            {
              maxWidth: Inputs.answer.style.maxWidth,
            },
            getShadow("neonPink"),
          ]}
        >
          <TextInput
            ref={inputRef}
            className='w-full py-4 px-8 rounded-[24px] bg-white text-xl font-medium text-black text-center'
            value={value}
            onChangeText={handleTextChange}
            textAlign='center'
            textAlignVertical='top'
            placeholder={Inputs.answer.placeholder}
            placeholderTextColor={Inputs.answer.style.placeholderColor}
            maxLength={Inputs.answer.validation.maxLength}
            returnKeyType='done'
            onSubmitEditing={isValid ? handleSubmit : undefined}
            autoFocus={true}
            autoCorrect={false}
            editable={!isLoading}
            numberOfLines={1}
            multiline
          />
        </View>

        <Text className='mt-8 text-base text-black opacity-50'>
          {Inputs.answer.validation.minLength}-
          {Inputs.answer.validation.maxLength} {copy.charactersOnly}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
