import { IndicatorBar } from "@/components/common/indicator-bar";
import { Animation, Colors } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  LayoutChangeEvent,
  Platform,
  Pressable,
  View,
} from "react-native";

interface ImageItem {
  name: string;
  uri?: string;
}

interface ImageCarouselProps {
  images: ImageItem[];
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
 * @param images - Array of image items with name and optional uri
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
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const hasMultipleImages = images.length > 1;
  const currentImage = images[currentIndex];
  const currentUri = currentImage?.uri;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: Animation.shimmer.duration,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: Animation.shimmer.duration,
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    );
    animation.start();
    return () => {
      animation.stop();
      animation.reset();
    };
  }, []);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerWidth(width);
    setContainerHeight(height);
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
      <View className='w-full h-full bg-white'>
        <View
          className='w-full h-full absolute inset-0'
          style={{ backgroundColor: Colors.skeletonBase }}
        />
        {containerWidth > 0 && (
          <View className='w-full h-full absolute inset-0 overflow-hidden'>
            <Animated.View
              style={{
                width: containerWidth * 2,
                height: containerHeight || "100%",
                transform: [
                  {
                    translateX: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-containerWidth, containerWidth],
                    }),
                  },
                ],
              }}
            >
              <LinearGradient
                colors={[
                  Colors.skeletonBase,
                  Colors.skeletonHighlight,
                  Colors.skeletonBase,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: "100%", height: "100%" }}
              />
            </Animated.View>
          </View>
        )}
        {currentUri && (
          <Image
            key={`${currentIndex}-${currentUri}`}
            source={{ uri: currentUri }}
            className='w-full h-full absolute inset-0'
            resizeMode='cover'
            style={{ backgroundColor: "transparent" }}
          />
        )}
      </View>
      {hasMultipleImages && showIndicator && (
        <View className={indicatorClassName}>
          <IndicatorBar totalBars={images.length} currentIndex={currentIndex} />
        </View>
      )}
    </Pressable>
  );
}
