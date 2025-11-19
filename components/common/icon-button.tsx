import {
  ButtonIcon,
  ButtonSize,
  ButtonSizeType,
  ButtonVariant,
  ButtonVariantType,
} from "@/constants/buttons";
import { Colors, Shadows } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, TouchableOpacity } from "react-native";

interface IconButtonProps {
  onPress: () => void;
  icon: ButtonIcon;
  variant?: ButtonVariantType;
  size?: ButtonSizeType;
  disabled?: boolean;
  loading?: boolean;
  reversed?: boolean;
}

/**
 * Icon button component with variant and size options.
 * Displays an icon from Ionicons in a circular button with loading state support.
 *
 * @param onPress - Callback function called when button is pressed
 * @param icon - Icon name from Ionicons
 * @param variant - Button color variant (default: "white")
 * @param size - Button size (default: "lg")
 * @param disabled - Whether the button is disabled (default: false)
 * @param loading - Whether the button is in loading state (default: false)
 */
export function IconButton({
  onPress,
  icon,
  variant = ButtonVariant.white,
  size = ButtonSize.lg,
  disabled = false,
  loading = false,
  reversed = false,
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
        return loading ? "p-[14px]" : "p-3";
      case "sm":
        return loading ? "p-[9px]" : "p-2";
      case "lg":
        return loading ? "p-[20px]" : "p-4";
      default:
        return "p-4";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`aspect-square ${getButtonPadding()} rounded-full items-center justify-center ${getBackgroundColor()} ${
        disabled || loading ? "opacity-50" : ""
      } `}
      style={{
        ...Shadows.light,
        ...(reversed ? { transform: [{ scaleX: -1 }] } : {}),
      }}
    >
      {loading ? (
        <ActivityIndicator size='small' color={getIconColor()} />
      ) : (
        <Ionicons name={icon} size={getIconSize()} color={getIconColor()} />
      )}
    </TouchableOpacity>
  );
}
