import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AbsoluteViewProps {
  children: ReactNode;
  className?: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  style?: StyleProp<ViewStyle>;
  withSafeAreaInsets?: boolean;
}

export function AbsoluteView({
  children,
  className,
  top,
  bottom,
  left,
  right,
  style,
  withSafeAreaInsets = true,
}: AbsoluteViewProps) {
  const insets = useSafeAreaInsets();

  const positionStyle: ViewStyle = {
    position: "absolute",
    ...(top !== undefined && {
      top: top + (withSafeAreaInsets ? insets.top : 0),
    }),
    ...(bottom !== undefined && {
      bottom: bottom + (withSafeAreaInsets ? insets.bottom : 0),
    }),
    ...(left !== undefined && {
      left: left + (withSafeAreaInsets ? insets.left : 0),
    }),
    ...(right !== undefined && {
      right: right + (withSafeAreaInsets ? insets.right : 0),
    }),
  };

  return (
    <View className={className} style={[positionStyle, style]}>
      {children}
    </View>
  );
}
