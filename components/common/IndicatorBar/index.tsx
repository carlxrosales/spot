import { View } from "react-native";

interface IndicatorBarProps {
  totalBars: number;
  currentIndex: number;
  className?: string;
}

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
