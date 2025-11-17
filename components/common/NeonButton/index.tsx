import { Colors, Shadows } from "@/constants/theme";
import { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface NeonButtonProps {
  onPress: () => void;
  children: ReactNode;
  variant?: "pink" | "green";
  style?: object;
}

export function NeonButton({
  onPress,
  children,
  variant = "pink",
  style,
}: NeonButtonProps) {
  const getTextColor = () => {
    return variant === "pink" ? Colors.neonPink : Colors.neonGreen;
  };

  const getShadow = () => {
    return variant === "pink" ? Shadows.neonPink : Shadows.neonGreen;
  };

  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <View
        className={`flex-row items-center justify-center py-2 px-5 gap-3 rounded-[24px] bg-white`}
        style={getShadow()}
      >
        {typeof children === "string" ? (
          <Text
            className='text-lg font-medium'
            style={{ color: getTextColor() }}
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
