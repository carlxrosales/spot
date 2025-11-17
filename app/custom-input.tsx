import { IconButton } from "@/components/common/IconButton";
import { Shadows } from "@/constants/theme";
import { useSurvey } from "@/contexts/SurveyContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CustomInputScreen() {
  const router = useRouter();
  const { question } = useLocalSearchParams<{ question: string }>();
  const { handleChoicePress, isLoading } = useSurvey();
  const [value, setValue] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const isValid = value.trim().length >= 3 && value.trim().length <= 12;

  const handleCancel = () => {
    router.back();
  };

  const handleSubmit = () => {
    const trimmedInput = value.trim();
    if (trimmedInput.length >= 3 && trimmedInput.length <= 12 && !isLoading) {
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
          className='w-full max-w-[400px] py-4 px-8 rounded-2xl bg-white text-xl font-medium text-black text-center outline-none'
          value={value}
          onChangeText={setValue}
          placeholder='Type your answer'
          placeholderTextColor='rgb(100, 100, 100)'
          maxLength={12}
          returnKeyType='done'
          onSubmitEditing={isValid ? handleSubmit : undefined}
          autoFocus={true}
          style={Shadows.neonPink}
          editable={!isLoading}
        />

        <Text className='mt-8 text-base text-black opacity-50'>
          3-12 characters only
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
