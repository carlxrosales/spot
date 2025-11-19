import {
  ButtonSize,
  ButtonSizeType,
  ButtonVariant,
  ButtonVariantType,
} from "@/constants/buttons";
import { Colors, Shadows } from "@/constants/theme";
import { Text, TouchableOpacity } from "react-native";

interface TextButtonProps {
  onPress: () => void;
  label: string;
  variant?: ButtonVariantType;
  size?: ButtonSizeType;
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
}

/**
 * Text button component with variant and size options.
 * Displays a text label in a rounded button with loading state support.
 *
 * @param onPress - Callback function called when button is pressed
 * @param label - Button text label
 * @param variant - Button color variant (default: "white")
 * @param size - Button text size (default: "lg")
 * @param disabled - Whether the button is disabled (default: false)
 * @param fullWidth - Whether the button should take full width (default: false)
 * @param loading - Whether the button is in loading state (default: false)
 */
export function TextButton({
  onPress,
  label,
  variant = ButtonVariant.white,
  size = ButtonSize.lg,
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
      case "green":
        return "bg-neonGreen";
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
      case "green":
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
      } px-6 py-4 rounded-[28px] items-center justify-center ${getBackgroundColor()} ${
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
