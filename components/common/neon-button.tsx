import { Colors, Shadows } from "@/constants/theme";
import { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface NeonButtonProps {
  onPress: () => void;
  children: ReactNode;
  style?: object;
}

/**
 * Neon-styled button component with pink shadow effect.
 * Displays children content in a white button with neon pink shadow styling.
 *
 * @param onPress - Callback function called when button is pressed
 * @param children - Child components or text to display in the button
 * @param style - Optional inline styles
 */
export function NeonButton({ onPress, children, style }: NeonButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <View
        className={`flex-row items-center justify-center py-2 px-5 gap-3 rounded-[24px] bg-white`}
        style={Shadows.neonPink}
      >
        {typeof children === "string" ? (
          <Text className='text-lg font-medium' style={{ color: Colors.black }}>
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </TouchableOpacity>
  );
}
