import { GetDirectionsButton } from "@/components/common/get-directions-button";
import { IconButton } from "@/components/common/icon-button";
import { GoogleMapsButton } from "@/components/common/map-buttons/google-maps-button";
import { ButtonSize } from "@/constants/buttons";
import {
  getCountdown,
  getOpeningHoursForToday,
  isCurrentlyOpen,
  Suggestion,
} from "@/data/suggestions";
import { cleanAddress } from "@/utils/address";
import { getShadow } from "@/utils/shadows";
import { useEffect, useState } from "react";
import { Modal, ScrollView, Text, View } from "react-native";

const copy = {
  kmAway: "km away",
  openingIn: "Opening in",
  closingIn: "Closing in",
};

interface PlaceModalProps {
  visible: boolean;
  onClose: () => void;
  place: Suggestion | null;
}

/**
 * Full-screen modal component for displaying place details.
 * Shows place information including name, description, tags, rating, distance, and opening hours.
 * Includes buttons for getting directions and opening in Google Maps.
 *
 * @param visible - Whether the modal is visible
 * @param onClose - Callback function called when modal is closed
 * @param place - The place to display, or null if no place is available
 */
export function PlaceModal({ visible, onClose, place }: PlaceModalProps) {
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    if (place?.opensAt || place?.closesAt) {
      const updateCountdown = () => {
        const isOpen = isCurrentlyOpen(place.opensAt, place.closesAt);

        if (!isOpen && place.opensAt) {
          setCountdown(getCountdown(place.opensAt));
        } else if (place.closesAt) {
          setCountdown(getCountdown(place.closesAt));
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 60000);

      return () => clearInterval(interval);
    }
  }, [place?.opensAt, place?.closesAt]);

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={onClose}
    >
      <View className='flex-1 bg-neonGreen'>
        <View className='flex-row justify-between items-center p-8'>
          <View className='flex-1' />
          <IconButton onPress={onClose} icon='close' size={ButtonSize.md} />
        </View>
        <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
          {place && (
            <View className='px-8 pb-8 gap-6'>
              <Text className='text-5xl font-groen text-black'>
                {place.name}
              </Text>

              <Text className='text-xl text-black font-semibold opacity-90'>
                📍 {cleanAddress(place.address)}
              </Text>

              {place.tags.length > 0 && (
                <View className='flex-row flex-wrap gap-2'>
                  {place.tags
                    .filter((tag: string) => tag !== "establishment")
                    .map((tag: string, idx: number) => (
                      <View
                        key={idx}
                        className='bg-black rounded-full px-4 py-2'
                        style={getShadow("light")}
                      >
                        <Text className='text-md font-semibold text-white capitalize'>
                          {tag.replace(/_/g, " ")}
                        </Text>
                      </View>
                    ))}
                </View>
              )}

              {place.description && (
                <Text className='text-xl text-black font-medium opacity-80 leading-9'>
                  {place.description}
                </Text>
              )}

              <View className='flex-row items-center justify-between'>
                <Text className='text-lg font-semibold text-black opacity-90'>
                  ⭐ {place.rating}
                </Text>
                {place.distanceInKm && (
                  <Text className='text-lg text-black font-medium opacity-90'>
                    {place.distanceInKm.toFixed(1)} {copy.kmAway}
                  </Text>
                )}
              </View>

              {(place.openingHours || place.opensAt || place.closesAt) && (
                <View className='flex-row items-center justify-between'>
                  {place.openingHours && (
                    <Text className='text-lg text-black font-medium opacity-90'>
                      {getOpeningHoursForToday(place.openingHours)}
                    </Text>
                  )}
                  {countdown && (
                    <Text className='text-lg text-black font-medium opacity-90'>
                      {isCurrentlyOpen(place.opensAt, place.closesAt)
                        ? `${copy.closingIn} ${countdown}`
                        : `${copy.openingIn} ${countdown}`}
                    </Text>
                  )}
                </View>
              )}

              <View className='gap-4 mt-2'>
                <GetDirectionsButton suggestion={place} />
                <GoogleMapsButton suggestion={place} />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
