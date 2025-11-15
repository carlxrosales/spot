import { SafeView } from "@/components/common/SafeView";
import { Colors } from "@/constants/theme";
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
import { styles } from "./styles";

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
      <SafeView style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onSubmit}
                style={styles.headerButton}
                disabled={!isValid}
              >
                <Text
                  style={[
                    styles.submitText,
                    !isValid && styles.submitTextDisabled,
                  ]}
                >
                  Submit
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.questionText}>{question}</Text>

              <TextInput
                ref={inputRef}
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder='Type your answer'
                placeholderTextColor={Colors.gray}
                maxLength={12}
                returnKeyType='done'
                onSubmitEditing={isValid ? onSubmit : undefined}
                autoFocus={true}
              />

              <Text style={styles.inputLimitText}>3-12 characters only</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeView>
    </Modal>
  );
}
