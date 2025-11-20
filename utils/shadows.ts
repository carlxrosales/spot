import { Colors } from "@/constants/theme";
import { Platform } from "react-native";

export type ShadowType = "neonPink" | "light" | "dark";

const ShadowsWeb = {
  neonPink: {
    boxShadow:
      "rgba(240, 46, 170, 0.4) 5px 5px, rgba(240, 46, 170, 0.3) 10px 10px, rgba(240, 46, 170, 0.2) 15px 15px, rgba(240, 46, 170, 0.1) 20px 20px, rgba(240, 46, 170, 0.05) 25px 25px",
  },
  light: {
    boxShadow: "0px 4px 8px rgba(100, 100, 100, 0.3)",
  },
  dark: {
    boxShadow: "0px 4px 8px rgba(248, 248, 248, 0.3)",
  },
};

const ShadowsNative = {
  neonPink: {
    boxShadow:
      "rgba(240, 46, 170, 0.4) 5px 5px, rgba(240, 46, 170, 0.3) 10px 10px, rgba(240, 46, 170, 0.2) 15px 15px, rgba(240, 46, 170, 0.1) 20px 20px, rgba(240, 46, 170, 0.05) 25px 25px",
    shadowColor: "rgba(240, 46, 170, 0.4)",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  light: {
    shadowColor: Colors.gray,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dark: {
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const Shadows = {
  web: ShadowsWeb,
  native: ShadowsNative,
};

export function getShadow(type: ShadowType) {
  return Platform.OS === "web" ? Shadows.web[type] : Shadows.native[type];
}
