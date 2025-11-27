import { IconButton } from "@/components/common/icon-button";
import { GetDirectionsButton } from "@/components/common/get-directions-button";
import { GoogleMapsButton } from "@/components/suggestion/google-maps-button";
import { ViewReviewsButton } from "@/components/suggestion/view-reviews-button";
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

interface SuggestionModalProps {
  visible: boolean;
  onClose: () => void;
  suggestion: Suggestion | null;
}

/**
 * Full-screen modal component for displaying suggestion details.
 * Shows suggestion information including name, description, tags, rating, distance, and opening hours.
 * Includes buttons for getting directions and opening in Google Maps.
 *
 * @param visible - Whether the modal is visible
 * @param onClose - Callback function called when modal is closed
 * @param suggestion - The suggestion to display, or null if no suggestion is available
 */
export function SuggestionModal({ visible, onClose, suggestion }: SuggestionModalProps) {
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    if (suggestion?.opensAt || suggestion?.closesAt) {
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
  }, [suggestion?.opensAt, suggestion?.closesAt]);

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
          {suggestion && (
            <View className='px-8 pb-8 gap-6'>
              <Text className='text-5xl font-groen text-black'>
                {suggestion.name}
              </Text>

              <Text className='text-xl text-black font-semibold opacity-90'>
                📍 {cleanAddress(suggestion.address)}
              </Text>

              {suggestion.tags.length > 0 && (
                <View className='flex-row flex-wrap gap-2'>
                  {suggestion.tags
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

              {suggestion.description && (
                <Text className='text-xl text-black font-medium opacity-80 leading-9'>
                  {suggestion.description}
                </Text>
              )}

              <View className='flex-row items-center justify-between'>
                <Text className='text-lg font-semibold text-black opacity-90'>
                  ⭐ {suggestion.rating}
                </Text>
                {suggestion.distanceInKm && (
                  <Text className='text-lg text-black font-medium opacity-90'>
                    {suggestion.distanceInKm.toFixed(1)} {copy.kmAway}
                  </Text>
                )}
              </View>

              {(suggestion.openingHours ||
                suggestion.opensAt ||
                suggestion.closesAt) && (
                <View className='flex-row items-center justify-between'>
                  {suggestion.openingHours && (
                    <Text className='text-lg text-black font-medium opacity-90'>
                      {getOpeningHoursForToday(suggestion.openingHours)}
                    </Text>
                  )}
                  {countdown && (
                    <Text className='text-lg text-black font-medium opacity-90'>
                      {isCurrentlyOpen(suggestion.opensAt, suggestion.closesAt)
                        ? `${copy.closingIn} ${countdown}`
                        : `${copy.openingIn} ${countdown}`}
                    </Text>
                  )}
                </View>
              )}

              <View className='gap-4 mt-2'>
                <GetDirectionsButton suggestion={suggestion} />
                {suggestion.reviewsLink && (
                  <ViewReviewsButton suggestion={suggestion} />
                )}
                <GoogleMapsButton suggestion={suggestion} />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
