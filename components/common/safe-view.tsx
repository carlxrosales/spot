import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeViewProps {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  edges?: ("top" | "bottom" | "left" | "right")[];
}

export function SafeView({ children, className, style, edges }: SafeViewProps) {
  const insets = useSafeAreaInsets();

  const safeAreaStyle: ViewStyle = {
    paddingTop: !edges || edges.includes("top") ? insets.top : 0,
    paddingBottom: !edges || edges.includes("bottom") ? insets.bottom : 0,
    paddingLeft: !edges || edges.includes("left") ? insets.left : 0,
    paddingRight: !edges || edges.includes("right") ? insets.right : 0,
  };

  return (
    <View className={className} style={[safeAreaStyle, style]}>
      {children}
    </View>
  );
}

