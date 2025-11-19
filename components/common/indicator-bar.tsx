import { View } from "react-native";

interface IndicatorBarProps {
  totalBars: number;
  currentIndex: number;
  className?: string;
}

/**
 * Progress indicator bar component.
 * Displays a series of bars where filled bars represent completed/past items and the active bar represents the current item.
 *
 * @param totalBars - Total number of indicator bars to display
 * @param currentIndex - Current active index (0-based)
 * @param className - Optional Tailwind CSS class names (default: "flex-row gap-1")
 */
export function IndicatorBar({
  totalBars,
  currentIndex,
  className = "flex-row gap-1",
}: IndicatorBarProps) {
  return (
    <View className={className}>
      {Array.from({ length: totalBars }).map((_, index) => {
        const isActive = currentIndex === index;
        const isPast = currentIndex > index;
        const isFilled = isActive || isPast;

        return (
          <View
            key={index}
            className='flex-1 h-1 bg-white/30 rounded-full overflow-hidden'
          >
            {isFilled && (
              <View className='h-full w-full bg-white rounded-full' />
            )}
          </View>
        );
      })}
    </View>
  );
}
