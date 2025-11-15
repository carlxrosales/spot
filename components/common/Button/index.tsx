import { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

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
        style={[styles.button, variant === "primary" && styles.buttonPrimary]}
      >
        {typeof children === "string" ? (
          <Text
            style={[
              styles.buttonText,
              variant === "primary" && styles.buttonTextPrimary,
            ]}
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
