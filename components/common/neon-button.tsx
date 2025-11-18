import { Colors, Shadows } from "@/constants/theme";
import { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface NeonButtonProps {
  onPress: () => void;
  children: ReactNode;
  style?: object;
}

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
