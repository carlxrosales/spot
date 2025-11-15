import { Colors, Fonts, Spacing } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  choiceContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  choiceText: {
    fontSize: Fonts.size.sm,
    textAlign: "left",
    fontWeight: Fonts.weight.medium,
    color: Colors.black,
  },
  emoji: {
    fontSize: Fonts.size.lg,
  },
});
