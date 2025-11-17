import { Colors, Shadows } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

interface IconButtonProps {
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  variant?: "pink" | "white" | "black";
  size?: "default" | "sm" | "md";
  disabled?: boolean;
}

export function IconButton({
  onPress,
  icon,
  variant = "white",
  size = "default",
  disabled = false,
}: IconButtonProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case "pink":
        return "bg-neonPink";
      case "black":
        return "bg-black";
      case "white":
      default:
        return "bg-white";
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "pink":
      case "black":
        return Colors.white;
      case "white":
      default:
        return Colors.black;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "default":
        return 16;
      case "sm":
        return 12;
      case "md":
        return 12;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "default":
        return 32;
      case "sm":
        return 24;
      case "md":
        return 32;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`w-${getButtonSize()} h-${getButtonSize()} rounded-full items-center justify-center ${getBackgroundColor()} ${
        disabled ? "opacity-50" : ""
      }`}
      style={Shadows.light}
    >
      <Ionicons name={icon} size={getIconSize()} color={getIconColor()} />
    </TouchableOpacity>
  );
}
