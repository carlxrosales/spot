import { ReactNode, useEffect, useState } from "react";
import { Keyboard, Platform, StyleProp, View, ViewStyle } from "react-native";
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
  avoidKeyboard?: boolean;
}

/**
 * Absolutely positioned view component.
 * Positions children at specific coordinates with optional safe area inset support.
 *
 * @param children - Child components to render
 * @param className - Optional Tailwind CSS class names
 * @param top - Distance from top in pixels
 * @param bottom - Distance from bottom in pixels
 * @param left - Distance from left in pixels
 * @param right - Distance from right in pixels
 * @param style - Optional inline styles
 * @param withSafeAreaInsets - Whether to add safe area insets to positioning (default: false)
 * @param avoidKeyboard - Whether to automatically adjust position when keyboard is shown (default: false)
 */
export function AbsoluteView({
  children,
  className,
  top,
  bottom,
  left,
  right,
  style,
  withSafeAreaInsets = false,
  avoidKeyboard = false,
}: AbsoluteViewProps) {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!avoidKeyboard) return;

    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [avoidKeyboard]);

  const adjustedBottom =
    bottom !== undefined
      ? bottom + keyboardHeight
      : keyboardHeight || undefined;

  const positionStyle: ViewStyle = {
    position: "absolute",
    ...(top !== undefined && {
      top,
    }),
    ...(adjustedBottom !== undefined && {
      bottom: adjustedBottom,
    }),
    ...(left !== undefined && {
      left,
    }),
    ...(right !== undefined && {
      right,
    }),
    ...(withSafeAreaInsets && {
      paddingTop: top ? insets.top : 0,
      paddingBottom: adjustedBottom ? insets.bottom : 0,
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
