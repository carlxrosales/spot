import { Ionicons } from "@expo/vector-icons";

/**
 * Button configuration constants.
 * Defines available variants and sizes for button components.
 */
export const Button = {
  variants: ["pink", "white", "black", "green"] as const,
  sizes: ["sm", "md", "lg"] as const,
} as const;

/**
 * Button variant constants for easy access to variant values.
 */
export const ButtonVariant = {
  pink: Button.variants[0],
  white: Button.variants[1],
  black: Button.variants[2],
  green: Button.variants[3],
} as const;

/**
 * Button size constants for easy access to size values.
 */
export const ButtonSize = {
  sm: Button.sizes[0],
  md: Button.sizes[1],
  lg: Button.sizes[2],
} as const;

/**
 * Type for button variant values.
 */
export type ButtonVariantType = (typeof Button.variants)[number];

/**
 * Type for button size values.
 */
export type ButtonSizeType = (typeof Button.sizes)[number];

/**
 * Type for button icon names from Ionicons.
 */
export type ButtonIcon = keyof typeof Ionicons.glyphMap;
