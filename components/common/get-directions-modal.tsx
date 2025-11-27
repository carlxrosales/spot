import { BottomModal } from "@/components/common/bottom-modal";
import { TextButton } from "@/components/common/text-button";
import { ButtonVariant } from "@/constants/buttons";
import { useToast } from "@/contexts/toast-context";
import { Suggestion } from "@/data/suggestions";
import { useState } from "react";
import { Linking } from "react-native";

interface GetDirectionsModalProps {
  visible: boolean;
  onClose: () => void;
  suggestion: Suggestion | null;
}

const copy = {
  chooseApp: "Pick your bias",
  googleMaps: "Google Maps",
  waze: "Waze",
  description: "Choose your preferred navigation app to get directions.",
};

/**
 * Modal component for selecting a navigation app to get directions.
 * Displays options to open directions in Google Maps or Waze with navigation enabled.
 *
 * @param visible - Whether the modal is visible
 * @param onClose - Callback function called when modal is closed
 * @param suggestion - The suggestion to get directions for, or null if no suggestion is available
 */
export function GetDirectionsModal({
  visible,
  onClose,
  suggestion,
}: GetDirectionsModalProps) {
  const { displayToast } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const openGoogleMaps = async () => {
    if (!suggestion || isLoading) return;
    setIsLoading(true);
    onClose();
    const { lat, lng } = suggestion;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url)
      .catch(() =>
        displayToast({ message: "yikes! we failed to open Google Maps" })
      )
      .finally(() => setIsLoading(false));
  };

  const openWaze = () => {
    if (!suggestion || isLoading) return;
    setIsLoading(true);
    onClose();
    const { lat, lng } = suggestion;
    const url = `waze://?ll=${lat},${lng}&navigate=yes`;
    Linking.openURL(url)
      .catch(() => {
        const fallbackUrl = `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`;
        Linking.openURL(fallbackUrl).catch(() =>
          displayToast({ message: "yikes! we failed to open Waze" })
        );
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <BottomModal
      visible={visible}
      onClose={onClose}
      title={copy.chooseApp}
      description={copy.description}
      showCancelButton
    >
      <TextButton
        label={copy.googleMaps}
        onPress={openGoogleMaps}
        variant={ButtonVariant.white}
        fullWidth
        loading={isLoading}
      />
      <TextButton
        label={copy.waze}
        onPress={openWaze}
        variant={ButtonVariant.black}
        fullWidth
        loading={isLoading}
      />
    </BottomModal>
  );
}
