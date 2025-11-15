import { Colors, Fonts, Spacing } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  questionContainer: {
    alignItems: "center",
  },
  questionText: {
    fontFamily: Fonts.family.groen,
    fontSize: Fonts.size.xxl,
    textAlign: "left",
    padding: Spacing.lg,
    color: Colors.black,
  },
});
