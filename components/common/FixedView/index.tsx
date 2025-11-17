import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FixedViewProps {
  children: ReactNode;
  className?: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  style?: StyleProp<ViewStyle>;
}

export function FixedView({
  children,
  className,
  top,
  bottom,
  left,
  right,
  style,
}: FixedViewProps) {
  const insets = useSafeAreaInsets();

  const positionStyle: ViewStyle = {
    position: "fixed",
    ...(top !== undefined && { top: top + insets.top }),
    ...(bottom !== undefined && { bottom: bottom + insets.bottom }),
    ...(left !== undefined && { left: left + insets.left }),
    ...(right !== undefined && { right: right + insets.right }),
  };

  return (
    <View className={className} style={[positionStyle, style]}>
      {children}
    </View>
  );
}
