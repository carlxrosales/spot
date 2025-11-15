import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/constants/dimensions";
import { Sparkle, SparkleProps } from "./Sparkle";

export function AnimatedBackground() {
  const sparkles: SparkleProps[] = [];

  for (let i = 0; i < 8; i++) {
    sparkles.push({
      startX: Math.random() * SCREEN_WIDTH,
      startY: Math.random() * SCREEN_HEIGHT,
      duration: 4000 + Math.random() * 3000,
    });
  }

  return (
    <>
      {sparkles.map((sparkle, index) => (
        <Sparkle key={index} {...sparkle} />
      ))}
    </>
  );
}
