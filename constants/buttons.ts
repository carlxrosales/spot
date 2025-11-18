import { Ionicons } from "@expo/vector-icons";

export const Button = {
  variants: ["pink", "white", "black"] as const,
  sizes: ["sm", "md", "lg"] as const,
} as const;

export const ButtonVariant = {
  pink: Button.variants[0],
  white: Button.variants[1],
  black: Button.variants[2],
} as const;

export const ButtonSize = {
  sm: Button.sizes[0],
  md: Button.sizes[1],
  lg: Button.sizes[2],
} as const;

export type ButtonVariantType = (typeof Button.variants)[number];
export type ButtonSizeType = (typeof Button.sizes)[number];
export type ButtonIcon = keyof typeof Ionicons.glyphMap;
