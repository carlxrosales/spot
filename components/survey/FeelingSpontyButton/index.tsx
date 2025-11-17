import { Text, TouchableOpacity } from "react-native";

interface FeelingSpontyButtonProps {
  onPress: () => void;
  label?: string;
}

export function FeelingSpontyButton({
  onPress,
  label = "I'm feeling sponty",
}: FeelingSpontyButtonProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text className='text-lg font-bold text-black'>{label}</Text>
    </TouchableOpacity>
  );
}
