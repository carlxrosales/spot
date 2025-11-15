export const Colors = {
  neonGreen: "rgb(225, 255, 91)",
  white: "rgb(248, 248, 248)",
  neonPink: "rgb(255, 45, 155)",
  gray: "rgb(100, 100, 100)",
  black: "rgb(30, 30, 30)",
  shadow: "rgba(240, 46, 170, 0.4)",
};

export const Fonts = {
  family: {
    groen: "Groen",
  },
  size: {
    xs: 12,
    default: 16,
    sm: 18,
    base: 20,
    md: 24,
    lg: 32,
    xl: 42,
    xxl: 60,
  },
  weight: {
    medium: 500 as const,
    bold: 700 as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 12,
  md: 16,
  lg: 32,
  xl: 64,
};

export const BorderRadius = {
  button: 24,
};

export const Shadows = {
  neonPink: {
    boxShadow:
      "rgba(240, 46, 170, 0.4) 5px 5px, rgba(240, 46, 170, 0.3) 10px 10px, rgba(240, 46, 170, 0.2) 15px 15px, rgba(240, 46, 170, 0.1) 20px 20px, rgba(240, 46, 170, 0.05) 25px 25px",
    shadowColor: "rgba(240, 46, 170, 0.4)",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
};

export const Animation = {
  spring: {
    damping: 24,
    stiffness: 142,
  },
  delay: {
    choiceStagger: 30,
  },
};
