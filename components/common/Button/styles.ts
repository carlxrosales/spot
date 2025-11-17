import {
  BorderRadius,
  Colors,
  Fonts,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    ...Shadows.neonPink,
    backgroundColor: Colors.white,
  },
  buttonPrimary: {
    backgroundColor: Colors.neonPink,
  },
  buttonText: {
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.medium,
    color: Colors.neonPink,
  },
  buttonTextPrimary: {
    color: Colors.white,
  },
});
