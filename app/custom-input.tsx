import { IconButton } from "@/components/common/icon-button";
import { Inputs } from "@/constants/inputs";
import { Shadows } from "@/constants/theme";
import { Timeouts } from "@/constants/timeouts";
import { useSurvey } from "@/contexts/survey-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";

const copy = {
  charactersOnly: "characters only",
};

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

  const handleCancel = () => {
    router.back();
  };

  const handleSubmit = () => {
    const trimmedInput = value.trim();
    if (
      trimmedInput.length >= Inputs.answer.validation.minLength &&
      trimmedInput.length <= Inputs.answer.validation.maxLength &&
      !isLoading
    ) {
      handleChoicePress(trimmedInput);
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className='flex-1 bg-neonGreen'
    >
      <View className='flex-row justify-between items-center p-8'>
        <IconButton onPress={handleCancel} icon='close' size='md' />
        <IconButton
          onPress={handleSubmit}
          icon='checkmark'
          variant='black'
          size='md'
          disabled={!isValid || isLoading}
        />
      </View>

      <View className='flex-1 px-8 pt-12 items-center'>
        <Text className='text-4xl font-bold text-black text-center font-groen mb-8 px-4'>
          {question || ""}
        </Text>

        <TextInput
          ref={inputRef}
          className='w-full py-4 px-8 rounded-[24px] bg-white text-xl font-medium text-black text-center outline-none'
          style={[{ maxWidth: Inputs.answer.style.maxWidth }, Shadows.neonPink]}
          value={value}
          onChangeText={setValue}
          placeholder={Inputs.answer.placeholder}
          placeholderTextColor={Inputs.answer.style.placeholderColor}
          maxLength={Inputs.answer.validation.maxLength}
          returnKeyType='done'
          onSubmitEditing={isValid ? handleSubmit : undefined}
          autoFocus={true}
          editable={!isLoading}
        />

        <Text className='mt-8 text-base text-black opacity-50'>
          {Inputs.answer.validation.minLength}-
          {Inputs.answer.validation.maxLength} {copy.charactersOnly}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
