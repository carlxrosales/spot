import {
  ButtonSize,
  ButtonSizeType,
  ButtonVariant,
  ButtonVariantType,
} from "@/constants/buttons";
import { Colors } from "@/constants/theme";
import { getShadow } from "@/utils/shadows";
import { Text, TouchableOpacity } from "react-native";

interface TextButtonProps {
  onPress?: () => void | Promise<void> | null | undefined;
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
      case ButtonVariant.pink:
        return "bg-neonPink";
      case ButtonVariant.black:
        return "bg-black";
      case ButtonVariant.green:
        return "bg-neonGreen";
      case ButtonVariant.white:
      default:
        return "bg-white";
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case ButtonVariant.pink:
      case ButtonVariant.black:
        return Colors.white;
      case ButtonVariant.white:
      case ButtonVariant.green:
      default:
        return Colors.black;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case ButtonSize.sm:
        return "text-md";
      case ButtonSize.md:
        return "text-md";
      case ButtonSize.lg:
      default:
        return "text-lg";
    }
  };

  const getButtonPadding = () => {
    switch (size) {
      case ButtonSize.sm:
        return "px-5 py-3";
      case ButtonSize.md:
      case ButtonSize.lg:
      default:
        return "px-6 py-4";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${
        fullWidth ? "w-full" : ""
      } ${getButtonPadding()} rounded-[28px] items-center justify-center ${getBackgroundColor()} ${
        disabled || loading ? "opacity-50" : ""
      }`}
      style={getShadow("light")}
      {...(!onPress ? { activeOpacity: 1 } : {})}
    >
      <Text
        className={`${getTextSize()} font-semibold w-full text-center`}
        numberOfLines={1}
        style={{ color: getTextColor() }}
      >
        {loading ? "Loading..." : label}
      </Text>
    </TouchableOpacity>
  );
}
