import { ImageCarousel } from "@/components/common/image-carousel";
import { Overlay } from "@/constants/theme";
import { useSuggestions } from "@/contexts/suggestions-context";
import {
  getCountdown,
  getOpeningHoursForToday,
  isCurrentlyOpen,
  Suggestion,
} from "@/data/suggestions";
import { cleanAddress } from "@/utils/address";
import { getShadow } from "@/utils/shadows";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

const copy = {
  kmAway: "km away",
  closingIn: "Closing in",
  openingIn: "Opening in",
  spotted: "spotted",
};

interface ShareCardProps {
  suggestion: Suggestion;
  currentPhotoIndex: number;
}

/**
 * Shareable card component displaying suggestion information.
 * Renders a card with suggestion photo, name, rating, distance, and opening hours.
 * Includes a "spotted" badge and countdown timer for opening/closing times.
 *
 * @param suggestion - The suggestion to display in the share card
 * @param currentPhotoIndex - The initial photo index to display in the carousel
 */
export function ShareCard({
  suggestion,
  currentPhotoIndex: initialPhotoIndex,
}: ShareCardProps) {
  const { getPhotoUri } = useSuggestions();

  const imageItems = useMemo(
    () =>
      suggestion.photos.map((photo) => ({
        name: photo,
        uri: getPhotoUri(suggestion.id, photo),
      })),
    [suggestion.photos, suggestion.id, getPhotoUri]
  );

  const photoCount = suggestion.photos.length;
  const safeInitialIndex =
    photoCount > 0
      ? Math.max(0, Math.min(initialPhotoIndex, photoCount - 1))
      : 0;

  const [currentPhotoIndex, setCurrentPhotoIndex] =
    useState<number>(safeInitialIndex);
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    const safeIndex = Math.max(0, Math.min(initialPhotoIndex, photoCount - 1));
    setCurrentPhotoIndex(safeIndex);
  }, [initialPhotoIndex, photoCount]);

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
    <View
      className='flex-1 bg-white rounded-3xl overflow-hidden m-4'
      style={getShadow("dark")}
    >
      <View
        className='absolute top-8 right-[-55px] z-50'
        style={{ transform: [{ rotate: "45deg" }] }}
      >
        <View className='bg-neonPink px-20 py-3'>
          <Text className='text-white font-bold text-md'>{copy.spotted}</Text>
        </View>
      </View>
      {suggestion.photos.length > 0 && (
        <ImageCarousel
          images={imageItems}
          currentIndex={currentPhotoIndex}
          onIndexChange={setCurrentPhotoIndex}
          showIndicator={false}
        />
      )}
      <View
        className='absolute bottom-0 left-0 right-0 p-6 gap-6 flex-1 w-full h-full'
        style={{
          backgroundColor: Overlay.backgroundColor,
        }}
        pointerEvents='box-none'
      >
        <View className='flex-1 justify-center h-full' pointerEvents='box-none'>
          <View
            className='flex-1 py-4 gap-4 justify-center'
            pointerEvents='box-none'
          >
            <Text
              className='text-5xl font-bold font-groen text-white'
              pointerEvents='box-none'
            >
              {suggestion.name}
            </Text>
            <View
              className='flex-row items-center justify-between'
              pointerEvents='box-none'
            >
              <Text
                className='text-xl text-white font-semibold text-left'
                pointerEvents='box-none'
              >
                ⭐ {suggestion.rating}
              </Text>
              {suggestion.distanceInKm && (
                <Text
                  className='text-xl text-white opacity-90 text-right'
                  pointerEvents='box-none'
                >
                  {suggestion.distanceInKm.toFixed(1)} {copy.kmAway}
                </Text>
              )}
            </View>
            {(suggestion.openingHours ||
              suggestion.closesAt ||
              suggestion.opensAt) && (
              <View
                className='flex-row items-center justify-between'
                pointerEvents='box-none'
              >
                {suggestion.openingHours && (
                  <Text
                    className='text-lg text-white opacity-90 text-left'
                    pointerEvents='box-none'
                  >
                    {getOpeningHoursForToday(suggestion.openingHours)}
                  </Text>
                )}
                {countdown && (
                  <Text
                    className='text-lg text-white opacity-90 text-right'
                    pointerEvents='box-none'
                  >
                    {isCurrentlyOpen(suggestion.opensAt, suggestion.closesAt)
                      ? `${copy.closingIn} ${countdown}`
                      : `${copy.openingIn} ${countdown}`}
                  </Text>
                )}
              </View>
            )}
          </View>
          <View className='flex-row items-center gap-2'>
            <Text className='text-lg font-semibold text-white opacity-90'>
              📍
            </Text>
            <Text className='flex-1 text-md font-semibold text-white opacity-90 text-left'>
              {cleanAddress(suggestion.address)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
