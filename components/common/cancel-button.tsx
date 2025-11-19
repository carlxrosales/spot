import { Text, TouchableOpacity } from "react-native";

interface CancelButtonProps {
  onPress: () => void;
}

/**
 * Cancel button component with gray background styling.
 * Standardized cancel button used in modals and forms.
 *
 * @param onPress - Callback function called when button is pressed
 */
export function CancelButton({ onPress }: CancelButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className='bg-gray-200 rounded-[24px] px-6 pt-4 pb-6 items-center'
    >
      <Text className='text-lg font-semibold text-black'>Cancel</Text>
    </TouchableOpacity>
  );
}
