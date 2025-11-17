import { SafeView } from "@/components/common/SafeView";
import { useEffect, useRef } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CustomInputModalProps {
  visible: boolean;
  question: string;
  value: string;
  onChangeText: (text: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function CustomInputModal({
  visible,
  question,
  value,
  onChangeText,
  onCancel,
  onSubmit,
}: CustomInputModalProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  const isValid = value.trim().length >= 3 && value.trim().length <= 12;

  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent={true}
      onRequestClose={onCancel}
    >
      <SafeView className='flex-1 bg-neonGreen'>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className='flex-1'
        >
          <View className='flex-1 pt-8'>
            <View className='flex-row justify-between items-center px-8 py-4'>
              <TouchableOpacity onPress={onCancel} className='py-1 px-1'>
                <Text className='text-xl font-medium text-black'>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onSubmit}
                className='py-1 px-1'
                disabled={!isValid}
              >
                <Text
                  className={`text-xl font-bold text-black ${
                    !isValid ? "opacity-50" : ""
                  }`}
                >
                  Submit
                </Text>
              </TouchableOpacity>
            </View>

            <View className='flex-1 px-8 pt-16 items-center'>
              <Text className='text-4xl font-bold text-black text-center font-groen mb-8 px-4'>
                {question}
              </Text>

              <TextInput
                ref={inputRef}
                className='w-full max-w-[400px] py-4 px-8 rounded-2xl bg-white text-xl font-medium text-black text-center'
                value={value}
                onChangeText={onChangeText}
                placeholder='Type your answer'
                placeholderTextColor='rgb(100, 100, 100)'
                maxLength={12}
                returnKeyType='done'
                onSubmitEditing={isValid ? onSubmit : undefined}
                autoFocus={true}
                style={{
                  shadowColor: "rgba(240, 46, 170, 0.4)",
                  shadowOffset: { width: 5, height: 5 },
                  shadowOpacity: 0.4,
                  shadowRadius: 5,
                  elevation: 5,
                }}
              />

              <Text className='mt-8 text-lg text-neonPink'>
                3-12 characters only
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeView>
    </Modal>
  );
}
