import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/constants/dimensions";
import { Animation } from "@/constants/theme";
import { AbsoluteView } from "./absolute-view";
import { Sparkle, SparkleProps } from "./sparkle";

export function AnimatedBackground() {
  const sparkles: SparkleProps[] = [];

  for (let i = 0; i < Animation.sparkle.count; i++) {
    sparkles.push({
      startX: Math.random() * SCREEN_WIDTH,
      startY: Math.random() * SCREEN_HEIGHT,
      duration:
        Animation.sparkle.durationBase +
        Math.random() * Animation.sparkle.durationRange,
    });
  }

  return (
    <AbsoluteView
      top={0}
      left={0}
      right={0}
      bottom={0}
      className='h-screen w-screen'
    >
      {sparkles.map((sparkle, index) => (
        <Sparkle key={index} {...sparkle} />
      ))}
    </AbsoluteView>
  );
}

