import { Text, TouchableOpacity } from "react-native";
import { styles } from "./styles";

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
      <Text style={styles.feelingSpontyText}>{label}</Text>
    </TouchableOpacity>
  );
}
