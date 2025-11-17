import { IconButton } from "@/components/common/IconButton";
import { TextButton } from "@/components/common/TextButton";
import { Shadows } from "@/constants/theme";
import { Suggestion } from "@/data/suggestions";
import { useState } from "react";
import { Linking, Modal, Platform, ScrollView, Text, View } from "react-native";

const copy = {
  viewGoogleMaps: "View on Google Maps",
  viewAppleMaps: "View on Apple Maps",
  kmAway: "km away",
  opensAt: "Opens at",
  closesAt: "Closes at",
};

interface SwipeModalProps {
  visible: boolean;
  onClose: () => void;
  suggestion: Suggestion | null;
}

export function SwipeModal({ visible, onClose, suggestion }: SwipeModalProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const openGoogleMaps = async () => {
    setIsLoading(true);
    if (!suggestion) return;
    const { lat, lng } = suggestion.location;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open Google Maps:", err)
    );
    setIsLoading(false);
  };

  const openAppleMaps = () => {
    setIsLoading(true);
    if (!suggestion) return;
    const { lat, lng } = suggestion.location;
    const url = `http://maps.apple.com/?ll=${lat},${lng}`;
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open Apple Maps:", err)
    );
    setIsLoading(false);
  };

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
          <IconButton onPress={onClose} icon='close' size='md' />
        </View>
        <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
          {suggestion && (
            <View className='px-8 pb-8 gap-6'>
              <Text className='text-5xl font-groen font-bold text-black'>
                {suggestion.name}
              </Text>

              {suggestion.description && (
                <Text className='text-2xl text-black font-medium opacity-90 leading-9'>
                  {suggestion.description}
                </Text>
              )}

              {suggestion.types.length > 0 && (
                <View className='flex-row flex-wrap gap-2'>
                  {suggestion.types
                    .filter((type) => type !== "establishment")
                    .map((type, idx) => (
                      <View
                        key={idx}
                        className='bg-black rounded-full px-4 py-2'
                        style={Shadows.light}
                      >
                        <Text className='text-md font-semibold text-white capitalize'>
                          {type.replace(/_/g, " ")}
                        </Text>
                      </View>
                    ))}
                </View>
              )}

              <View className='flex-row items-center justify-between'>
                <Text className='text-lg font-semibold text-black opacity-80'>
                  ⭐ {suggestion.rating}
                </Text>
                {suggestion.distanceInKm && (
                  <Text className='text-lg text-black font-medium opacity-80'>
                    {suggestion.distanceInKm.toFixed(1)} {copy.kmAway}
                  </Text>
                )}
              </View>

              {suggestion.openingHours &&
                (suggestion.openingHours.opensAt ||
                  suggestion.openingHours.closesAt) && (
                  <View className='flex-row items-center justify-between'>
                    {suggestion.openingHours.opensAt && (
                      <Text className='text-lg text-black font-medium opacity-80'>
                        {copy.opensAt} {suggestion.openingHours.opensAt}
                      </Text>
                    )}
                    {suggestion.openingHours.closesAt && (
                      <Text className='text-lg text-black font-medium opacity-80'>
                        {copy.closesAt} {suggestion.openingHours.closesAt}
                      </Text>
                    )}
                  </View>
                )}

              <View className='gap-4 mt-2'>
                <TextButton
                  label={copy.viewGoogleMaps}
                  onPress={openGoogleMaps}
                  variant='white'
                  fullWidth
                  loading={isLoading}
                />
                {Platform.OS === "ios" && (
                  <TextButton
                    label={copy.viewAppleMaps}
                    onPress={openAppleMaps}
                    variant='black'
                    fullWidth
                    loading={isLoading}
                  />
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
