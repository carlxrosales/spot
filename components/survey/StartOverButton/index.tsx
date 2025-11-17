import { Fonts } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

interface StartOverButtonProps {
  onPress: () => void;
  disabled: boolean;
}

export function StartOverButton({ onPress, disabled }: StartOverButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <MaterialCommunityIcons
        name='reload'
        size={Fonts.size.md}
        color='black'
        style={{ opacity: disabled ? 0.5 : 1 }}
      />
    </TouchableOpacity>
  );
}
