import { Shadows } from "@/constants/theme";
import { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ButtonProps {
  onPress: () => void;
  children: ReactNode;
  variant?: "default" | "primary";
  style?: object;
}

export function Button({
  onPress,
  children,
  variant = "default",
  style,
}: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <View
        className={`flex-row items-center justify-center py-1 px-4 gap-3 rounded-2xl bg-white ${
          variant === "primary" ? "bg-neonPink" : ""
        }`}
        style={variant === "default" ? Shadows.neonPink : undefined}
      >
        {typeof children === "string" ? (
          <Text
            className={`text-lg font-medium ${
              variant === "primary" ? "text-white" : "text-neonPink"
            }`}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </TouchableOpacity>
  );
}
