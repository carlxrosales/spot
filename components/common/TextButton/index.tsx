import { Colors, Shadows } from "@/constants/theme";
import { Text, TouchableOpacity } from "react-native";

interface TextButtonProps {
  onPress: () => void;
  label: string;
  variant?: "pink" | "white" | "black";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
}

export function TextButton({
  onPress,
  label,
  variant = "white",
  size = "lg",
  disabled = false,
  fullWidth = false,
  loading = false,
}: TextButtonProps) {
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

  const getTextColor = () => {
    switch (variant) {
      case "pink":
      case "black":
        return Colors.white;
      case "white":
      default:
        return Colors.black;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "md":
        return "text-md";
      case "lg":
      default:
        return "text-lg";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${
        fullWidth ? "w-full" : ""
      } px-6 py-4 rounded-[24px] items-center justify-center ${getBackgroundColor()} ${
        disabled || loading ? "opacity-50" : ""
      }`}
      style={Shadows.light}
    >
      <Text
        className={`${getTextSize()} font-semibold`}
        style={{ color: getTextColor() }}
      >
        {loading ? "Loading..." : label}
      </Text>
    </TouchableOpacity>
  );
}
