import { SCREEN_WIDTH } from "@/constants/dimensions";
import { Colors, Fonts } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  feedbackContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
    minWidth: SCREEN_WIDTH,
  },
  feedbackText: {
    fontFamily: Fonts.family.groen,
    fontSize: Fonts.size.xl,
    color: Colors.black,
    textAlign: "center",
    textTransform: "lowercase",
  },
});
