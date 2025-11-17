import { Colors, Shadows } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, TouchableOpacity } from "react-native";

interface IconButtonProps {
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  variant?: "pink" | "white" | "black";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
}

export function IconButton({
  onPress,
  icon,
  variant = "white",
  size = "lg",
  disabled = false,
  loading = false,
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
      case "lg":
        return 16;
      case "sm":
        return 12;
      case "md":
        return "[32px]";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "lg":
        return 32;
      case "sm":
        return 24;
      case "md":
        return 28;
    }
  };

  const getButtonPadding = () => {
    switch (size) {
      case "md":
        return "px-3 py-3";
      case "sm":
      case "lg":
      default:
        return "p-0";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`w-${getButtonSize()} h-${getButtonSize()} ${getButtonPadding()} rounded-full items-center justify-center ${getBackgroundColor()} ${
        disabled || loading ? "opacity-50" : ""
      }`}
      style={Shadows.light}
    >
      {loading ? (
        <ActivityIndicator size='small' color={getIconColor()} />
      ) : (
        <Ionicons name={icon} size={getIconSize()} color={getIconColor()} />
      )}
    </TouchableOpacity>
  );
}
