import { AbsoluteView } from "@/components/common/absolute-view";
import { Sparkle, SparkleProps } from "@/components/common/sparkle";
import { Dimensions } from "@/constants/dimensions";
import { Animation } from "@/constants/theme";

/**
 * Animated background component with multiple sparkle effects.
 * Renders a full-screen background with randomly positioned animated sparkles.
 */
export function AnimatedBackground() {
  const sparkles: SparkleProps[] = [];

  for (let i = 0; i < Animation.sparkle.count; i++) {
    sparkles.push({
      startX: Math.random() * Dimensions.width,
      startY: Math.random() * Dimensions.height,
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
      className='h-screen w-screen bg-neonGreen overflow-hidden'
    >
      {sparkles.map((sparkle, index) => (
        <Sparkle key={index} {...sparkle} />
      ))}
    </AbsoluteView>
  );
}
