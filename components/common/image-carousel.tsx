import { useEffect, useState } from "react";
import { Image, LayoutChangeEvent, Pressable, View } from "react-native";
import { IndicatorBar } from "./indicator-bar";

interface ImageCarouselProps {
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  showIndicator?: boolean;
  indicatorClassName?: string;
  className?: string;
}

/**
 * Image carousel component with tap-to-navigate functionality.
 * Displays multiple images with an indicator bar and allows navigation by tapping left/right sides.
 *
 * @param images - Array of image URIs to display
 * @param currentIndex - Currently displayed image index
 * @param onIndexChange - Callback function called when image index changes
 * @param showIndicator - Whether to show the indicator bar (default: true)
 * @param indicatorClassName - Optional Tailwind CSS class names for the indicator
 * @param className - Optional Tailwind CSS class names for the container
 */
export function ImageCarousel({
  images,
  currentIndex,
  onIndexChange,
  showIndicator = true,
  indicatorClassName = "absolute top-4 left-4 right-4 z-10",
  className = "w-full h-full",
}: ImageCarouselProps) {
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    images.forEach((uri) => {
      Image.prefetch(uri).catch(() => {});
    });
  }, [images]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const handlePress = (event: { nativeEvent: { locationX: number } }) => {
    if (!hasMultipleImages || containerWidth === 0) return;

    const tapX = event.nativeEvent.locationX;
    const isLeftSide = tapX < containerWidth / 2;

    if (isLeftSide) {
      const prevIndex =
        currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      onIndexChange(prevIndex);
    } else {
      const nextIndex = (currentIndex + 1) % images.length;
      onIndexChange(nextIndex);
    }
  };

  if (images.length === 0) return null;

  return (
    <Pressable
      onPress={handlePress}
      onLayout={handleLayout}
      className={className}
    >
      <View className='w-full h-full'>
        {images.map((photo, index) => (
          <Image
            key={index}
            source={{ uri: photo }}
            className={`w-full h-full absolute inset-0 ${
              currentIndex === index ? "opacity-100" : "opacity-0"
            }`}
            resizeMode='cover'
          />
        ))}
      </View>
      {hasMultipleImages && showIndicator && (
        <View className={indicatorClassName}>
          <IndicatorBar totalBars={images.length} currentIndex={currentIndex} />
        </View>
      )}
    </Pressable>
  );
}
