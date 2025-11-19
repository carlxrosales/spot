import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

/**
 * Screen width in pixels.
 * Retrieved from device window dimensions.
 */
export const SCREEN_WIDTH = width;

/**
 * Screen height in pixels.
 * Retrieved from device window dimensions.
 */
export const SCREEN_HEIGHT = height;
