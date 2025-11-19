import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeViewProps {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  edges?: ("top" | "bottom" | "left" | "right")[];
}

/**
 * Safe area view component that respects device safe area insets.
 * Automatically applies padding to avoid notches, status bars, and home indicators.
 *
 * @param children - Child components to render
 * @param className - Optional Tailwind CSS class names
 * @param style - Optional inline styles
 * @param edges - Array of edges to apply safe area insets to (default: all edges)
 */
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
