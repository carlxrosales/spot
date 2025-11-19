import { ImageCarousel } from "@/components/common/image-carousel";
import { Overlay } from "@/constants/theme";
import {
  getCountdown,
  getOpeningHoursForToday,
  isCurrentlyOpen,
  Suggestion,
} from "@/data/suggestions";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

const copy = {
  kmAway: "km away",
  closingIn: "Closing in",
  openingIn: "Opening in",
  spotted: "spotted",
};

interface ShareCardProps {
  suggestion: Suggestion;
}

/**
 * Shareable card component displaying suggestion information.
 * Renders a card with suggestion photo, name, rating, distance, and opening hours.
 * Includes a "spotted" badge and countdown timer for opening/closing times.
 *
 * @param suggestion - The suggestion to display in the share card
 */
export function ShareCard({ suggestion }: ShareCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    if (suggestion.opensAt || suggestion.closesAt) {
      const updateCountdown = () => {
        const isOpen = isCurrentlyOpen(suggestion.opensAt, suggestion.closesAt);

        if (!isOpen && suggestion.opensAt) {
          setCountdown(getCountdown(suggestion.opensAt));
        } else if (suggestion.closesAt) {
          setCountdown(getCountdown(suggestion.closesAt));
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 60000);

      return () => clearInterval(interval);
    }
  }, [suggestion.opensAt, suggestion.closesAt]);

  return (
    <View className='flex-1 bg-white rounded-3xl overflow-hidden m-4 shadow-xl'>
      <View
        className='absolute top-8 right-[-55px] z-50'
        style={{ transform: [{ rotate: "45deg" }] }}
      >
        <View className='bg-neonPink px-20 py-3'>
          <Text className='text-white font-bold text-md'>{copy.spotted}</Text>
        </View>
      </View>
      {suggestion.photoUris && suggestion.photoUris.length > 0 && (
        <ImageCarousel
          images={[suggestion.photoUris[0]]}
          currentIndex={currentPhotoIndex}
          onIndexChange={setCurrentPhotoIndex}
        />
      )}
      <View
        className='absolute bottom-0 left-0 right-0 p-6 gap-6 flex-1 w-full h-full'
        style={{
          backgroundColor: Overlay.backgroundColor,
        }}
      >
        <View className='flex-1 justify-center h-full'>
          <View className='py-4 gap-4'>
            <Text className='text-5xl font-bold font-groen text-white'>
              {suggestion.name}
            </Text>
            <View className='flex-row items-center justify-between'>
              <Text className='text-xl text-white font-semibold text-left'>
                ⭐ {suggestion.rating}
              </Text>
              {suggestion.distanceInKm && (
                <Text className='text-xl text-white opacity-90 text-right'>
                  {suggestion.distanceInKm.toFixed(1)} {copy.kmAway}
                </Text>
              )}
            </View>
            {(suggestion.openingHours ||
              suggestion.closesAt ||
              suggestion.opensAt) && (
              <View className='flex-row items-center justify-between'>
                {suggestion.openingHours && (
                  <Text className='text-lg text-white opacity-90 text-left'>
                    {getOpeningHoursForToday(suggestion.openingHours)}
                  </Text>
                )}
                {countdown && (
                  <Text className='text-lg text-white opacity-90 text-right'>
                    {isCurrentlyOpen(suggestion.opensAt, suggestion.closesAt)
                      ? `${copy.closingIn} ${countdown}`
                      : `${copy.openingIn} ${countdown}`}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
