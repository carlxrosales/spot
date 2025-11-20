import { Platform } from "react-native";

/**
 * Color palette for the application theme.
 * Defines all color values used throughout the app.
 */
export const Colors = {
  neonGreen: "rgb(225, 255, 91)",
  white: "rgb(248, 248, 248)",
  neonPink: "rgb(255, 45, 155)",
  gray: "rgb(100, 100, 100)",
  black: "rgb(30, 30, 30)",
  shadow: "rgba(240, 46, 170, 0.4)",
  skeletonBase: "rgb(66, 66, 66)",
  skeletonHighlight: "rgb(38, 38, 38)",
};

/**
 * Shadow configurations for different visual effects.
 * Uses boxShadow for web, React Native shadow properties for native platforms.
 */
export const Shadows =
  Platform.OS === "web"
    ? {
        neonPink: {
          boxShadow:
            "rgba(240, 46, 170, 0.4) 5px 5px, rgba(240, 46, 170, 0.3) 10px 10px, rgba(240, 46, 170, 0.2) 15px 15px, rgba(240, 46, 170, 0.1) 20px 20px, rgba(240, 46, 170, 0.05) 25px 25px",
        },
        light: {
          boxShadow: "0px 4px 8px rgba(100, 100, 100, 0.3)",
        },
        dark: {
          boxShadow: "0px 4px 8px rgba(248, 248, 248, 0.3)",
        },
      }
    : {
        neonPink: {
          shadowColor: "rgba(240, 46, 170, 0.4)",
          shadowOffset: { width: 5, height: 5 },
          shadowOpacity: 0.4,
          shadowRadius: 5,
          elevation: 5,
        },
        light: {
          shadowColor: Colors.gray,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        },
        dark: {
          shadowColor: Colors.white,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        },
      };

/**
 * Spacing values for consistent layout spacing throughout the app.
 */
export const Spacing = {
  small: 16,
  medium: 32,
};

/**
 * Overlay configuration for modal and overlay components.
 */
export const Overlay = {
  opacity: 0.6,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
};

/**
 * Animation configuration constants.
 * Includes spring physics, durations, scales, opacities, translations, thresholds, and other animation parameters.
 */
export const Animation = {
  spring: {
    damping: 24,
    stiffness: 142,
  },
  dampSpring: {
    damping: 42,
    stiffness: 142,
  },
  delay: {
    choiceStagger: 30,
  },
  duration: {
    fast: 200,
    normal: 300,
    medium: 400,
    slow: 600,
    toast: 5000,
  },
  scale: {
    hidden: 0,
    small: 0.6,
    medium: 0.8,
    normal: 1,
  },
  opacity: {
    hidden: 0,
    low: 0.3,
    medium: 0.7,
    visible: 1,
  },
  translate: {
    toast: {
      top: -100,
      bottom: 100,
    },
    question: {
      up: -20,
      down: 20,
    },
    choice: {
      up: -10,
      down: 10,
    },
  },
  threshold: {
    swipeFeedback: 0.6,
    swipeCard: 0.25,
  },
  swipe: {
    distanceMultiplier: 1.5,
    translateYMultiplier: 0.1,
    rotationDivisor: 20,
    fadeAmount: 0.6,
    activeOffset: 10,
  },
  zIndex: {
    card: 1000,
    feedback: 2000,
  },
  rotation: {
    full: 360,
  },
  sparkle: {
    count: 8,
    durationBase: 4000,
    durationRange: 3000,
    movementRange: 0.8,
    opacityMin: 0.3,
    opacityMax: 0.7,
    fontSize: 72,
    durationOffset: 500,
    rotationMultiplier: 2,
    opacityDurationDivisor: 0.5,
  },
  feedback: {
    scaleMin: 0.6,
    scaleRange: 0.4,
  },
  shimmer: {
    duration: 1500,
  },
};
