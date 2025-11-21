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
  withSafeAreaInsets?: boolean;
}

/**
 * Fixed position view component.
 * Positions children at specific coordinates with fixed positioning and optional safe area inset support.
 *
 * @param children - Child components to render
 * @param className - Optional Tailwind CSS class names
 * @param top - Distance from top in pixels
 * @param bottom - Distance from bottom in pixels
 * @param left - Distance from left in pixels
 * @param right - Distance from right in pixels
 * @param style - Optional inline styles
 * @param withSafeAreaInsets - Whether to add safe area insets to positioning (default: false)
 */
export function FixedView({
  children,
  className,
  top,
  bottom,
  left,
  right,
  style,
  withSafeAreaInsets = false,
}: FixedViewProps) {
  const insets = useSafeAreaInsets();

  const positionStyle: ViewStyle = {
    position: "fixed",
    ...(top !== undefined && {
      top,
    }),
    ...(bottom !== undefined && {
      bottom,
    }),
    ...(left !== undefined && {
      left,
    }),
    ...(right !== undefined && {
      right,
    }),
    ...(withSafeAreaInsets && {
      paddingTop: top ? insets.top : 0,
      paddingBottom: bottom ? insets.bottom : 0,
      paddingLeft: left ? insets.left : 0,
      paddingRight: right ? insets.right : 0,
    }),
  };

  return (
    <View className={className} style={[positionStyle, style]}>
      {children}
    </View>
  );
}
