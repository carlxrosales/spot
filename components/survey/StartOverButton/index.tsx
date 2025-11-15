import { AbsoluteView } from "@/components/common/AbsoluteView";
import { Spacing } from "@/constants/theme";
import { Text, TouchableOpacity } from "react-native";
import { styles } from "./styles";

interface StartOverButtonProps {
  onPress: () => void;
}

export function StartOverButton({ onPress }: StartOverButtonProps) {
  return (
    <AbsoluteView bottom={Spacing.lg} left={Spacing.lg}>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.startOverText}>Start over</Text>
      </TouchableOpacity>
    </AbsoluteView>
  );
}
