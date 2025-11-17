/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        neonGreen: "rgb(225, 255, 91)",
        white: "rgb(248, 248, 248)",
        neonPink: "rgb(255, 45, 155)",
        gray: "rgb(100, 100, 100)",
        black: "rgb(30, 30, 30)",
        shadow: "rgba(240, 46, 170, 0.4)",
      },
      fontFamily: {
        groen: ["Groen", "sans-serif"],
      },
    },
  },
  plugins: [],
};
