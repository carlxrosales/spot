import { Dimensions as RNDimensions } from "react-native";

const { width, height } = RNDimensions.get("window");

/**
 * Screen dimension constants.
 * Contains width and height values retrieved from device window dimensions.
 */
export const Dimensions = {
  /**
   * Screen width in pixels.
   */
  width,

  /**
   * Screen height in pixels.
   */
  height,
};
