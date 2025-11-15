import { AbsoluteView } from "@/components/common/AbsoluteView";
import { Spacing } from "@/constants/theme";
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
    <AbsoluteView bottom={Spacing.lg * 2 + 16} left={Spacing.lg}>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.feelingSpontyText}>{label}</Text>
      </TouchableOpacity>
    </AbsoluteView>
  );
}
