export const Colors = {
  neonGreen: "rgb(225, 255, 91)",
  white: "rgb(248, 248, 248)",
  neonPink: "rgb(255, 45, 155)",
  gray: "rgb(100, 100, 100)",
  black: "rgb(30, 30, 30)",
  shadow: "rgba(240, 46, 170, 0.4)",
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
  light: {
    shadowColor: Colors.gray,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
