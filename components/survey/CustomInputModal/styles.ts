import {
  BorderRadius,
  Colors,
  Fonts,
  Shadows,
  Spacing,
} from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.neonGreen,
  },
  keyboardView: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    paddingTop: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  cancelText: {
    fontSize: Fonts.size.base,
    fontWeight: Fonts.weight.medium,
    color: Colors.black,
  },
  submitText: {
    fontSize: Fonts.size.base,
    fontWeight: Fonts.weight.bold,
    color: Colors.black,
  },
  submitTextDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    alignItems: "center",
  },
  questionText: {
    fontSize: Fonts.size.xl,
    fontWeight: Fonts.weight.bold,
    color: Colors.black,
    textAlign: "center",
    fontFamily: Fonts.family.groen,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  input: {
    width: "100%",
    maxWidth: 400,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.button,
    backgroundColor: Colors.white,
    fontSize: Fonts.size.base,
    fontWeight: Fonts.weight.medium,
    color: Colors.black,
    ...Shadows.neonPink,
    textAlign: "center",
  },
  inputLimitText: {
    marginTop: Spacing.lg,
    fontSize: Fonts.size.sm,
    color: Colors.neonPink,
  },
});
