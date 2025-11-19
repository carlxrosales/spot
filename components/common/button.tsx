import {
  ButtonIcon,
  ButtonSize,
  ButtonSizeType,
  ButtonVariant,
  ButtonVariantType,
} from "@/constants/buttons";
import { Colors, Shadows } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface ButtonProps {
  onPress?: () => void | Promise<void> | null | undefined;
  icon: ButtonIcon;
  label: string;
  variant?: ButtonVariantType;
  size?: ButtonSizeType;
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
}

/**
 * Button component with icon and text label.
 * Displays an icon on the left and text label on the right in a rounded button.
 *
 * @param onPress - Callback function called when button is pressed
 * @param icon - Icon name from Ionicons
 * @param label - Button text label
 * @param variant - Button color variant (default: "white")
 * @param size - Button size (default: "lg")
 * @param disabled - Whether the button is disabled (default: false)
 * @param fullWidth - Whether the button should take full width (default: false)
 * @param loading - Whether the button is in loading state (default: false)
 */
export function Button({
  onPress,
  icon,
  label,
  variant = ButtonVariant.white,
  size = ButtonSize.lg,
  disabled = false,
  fullWidth = false,
  loading = false,
}: ButtonProps) {
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

  const getIconSize = () => {
    switch (size) {
      case ButtonSize.sm:
        return 20;
      case ButtonSize.md:
        return 22;
      case ButtonSize.lg:
      default:
        return 24;
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

  const getIconSpacing = () => {
    switch (size) {
      case ButtonSize.sm:
        return "mr-2";
      case ButtonSize.md:
      case ButtonSize.lg:
      default:
        return "mr-3";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${
        fullWidth ? "w-full" : ""
      } ${getButtonPadding()} rounded-[28px] flex-row items-center justify-center ${getBackgroundColor()} ${
        disabled || loading ? "opacity-50" : ""
      }`}
      style={Shadows.light}
    >
      {loading ? (
        <ActivityIndicator size='small' color={getTextColor()} />
      ) : (
        <>
          <View className={getIconSpacing()}>
            <Ionicons name={icon} size={getIconSize()} color={getTextColor()} />
          </View>
          <Text
            className={`${getTextSize()} font-semibold`}
            style={{ color: getTextColor() }}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
