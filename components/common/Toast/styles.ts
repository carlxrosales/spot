import { Fonts, Spacing } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  toast: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    maxWidth: "90%",
  },
  text: {
    color: "#fff",
    fontSize: Fonts.size.sm,
    textAlign: "center",
  },
});
