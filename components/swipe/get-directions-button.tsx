import { TextButton } from "@/components/common/text-button";
import { ButtonVariant } from "@/constants/buttons";
import { useToast } from "@/contexts/toast-context";
import { Suggestion } from "@/data/suggestions";
import { useState } from "react";
import { Linking, Modal, Text, TouchableOpacity, View } from "react-native";

interface GetDirectionsButtonProps {
  suggestion: Suggestion | null;
}

const copy = {
  getDirections: "Get Directions",
  chooseApp: "Choose navigation app",
  googleMaps: "Google Maps",
  waze: "Waze",
  cancel: "Cancel",
};

export function GetDirectionsButton({ suggestion }: GetDirectionsButtonProps) {
  const { displayToast } = useToast();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const openGoogleMaps = async () => {
    if (!suggestion || isLoading) return;
    setIsLoading(true);
    setIsModalVisible(false);
    const url = `https://www.google.com/maps/dir/?api=1&destination=place_id:${suggestion.id}`;
    Linking.openURL(url)
      .catch(() =>
        displayToast({ message: "Yo! We failed to open Google Maps." })
      )
      .finally(() => setIsLoading(false));
  };

  const openWaze = () => {
    if (!suggestion || isLoading) return;
    setIsLoading(true);
    setIsModalVisible(false);
    const { lat, lng } = suggestion.location;
    const url = `waze://?ll=${lat},${lng}&navigate=yes`;
    Linking.openURL(url)
      .catch(() => {
        const fallbackUrl = `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`;
        Linking.openURL(fallbackUrl).catch(() =>
          displayToast({ message: "Yo! We failed to open Waze." })
        );
      })
      .finally(() => setIsLoading(false));
  };

  const handlePress = () => {
    if (!suggestion || isLoading) return;
    setIsModalVisible(true);
  };

  return (
    <>
      <TextButton
        label={copy.getDirections}
        onPress={handlePress}
        variant={ButtonVariant.white}
        fullWidth
        loading={isLoading}
      />
      <Modal
        visible={isModalVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          className='flex-1 bg-black/50 justify-end'
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            className='bg-neonGreen rounded-t-3xl p-6'
          >
            <Text className='text-2xl font-bold text-black mb-6 text-center'>
              {copy.chooseApp}
            </Text>
            <View className='gap-3'>
              <TextButton
                label={copy.googleMaps}
                onPress={openGoogleMaps}
                variant={ButtonVariant.white}
                fullWidth
              />
              <TextButton
                label={copy.waze}
                onPress={openWaze}
                variant={ButtonVariant.black}
                fullWidth
              />
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className='bg-gray-200 rounded-[24px] px-6 pt-4 pb-6 items-center'
              >
                <Text className='text-lg font-semibold text-black'>
                  {copy.cancel}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
