import { IconButton } from "@/components/common/icon-button";
import { ButtonSize } from "@/constants/buttons";
import { Suggestion } from "@/data/suggestions";
import { cleanAddress } from "@/utils/address";
import { getShadow } from "@/utils/shadows";
import { Modal, ScrollView, Text, View } from "react-native";
import { GetDirectionsButton } from "./get-directions-button";
import { GoogleMapsButton } from "./google-maps-button";
import { ViewReviewsButton } from "./view-reviews-button";

const copy = {
  kmAway: "km away",
  opensAt: "Opens at",
  closesAt: "Closes at",
};

interface SwipeModalProps {
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
export function SwipeModal({ visible, onClose, suggestion }: SwipeModalProps) {
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
              <Text className='text-5xl font-groen font-bold text-black'>
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

              {(suggestion.opensAt || suggestion.closesAt) && (
                <View className='flex-row items-center justify-between'>
                  {suggestion.opensAt && (
                    <Text className='text-lg text-black font-medium opacity-90'>
                      {copy.opensAt} {suggestion.opensAt}
                    </Text>
                  )}
                  {suggestion.closesAt && (
                    <Text className='text-lg text-black font-medium opacity-90'>
                      {copy.closesAt} {suggestion.closesAt}
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
