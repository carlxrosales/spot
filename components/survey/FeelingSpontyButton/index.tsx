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
      <Text className='text-xl font-semibold text-black'>{label}</Text>
    </TouchableOpacity>
  );
}
