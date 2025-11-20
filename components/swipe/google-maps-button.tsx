import { TextButton } from "@/components/common/text-button";
import { ButtonVariant } from "@/constants/buttons";
import { useToast } from "@/contexts/toast-context";
import { Suggestion } from "@/data/suggestions";
import { useState } from "react";
import { Linking } from "react-native";

interface GoogleMapsButtonProps {
  suggestion: Suggestion | null;
}

const copy = {
  viewOnGoogleMaps: "Open in Google Maps",
};

/**
 * Button component that opens a suggestion in Google Maps.
 * Launches Google Maps with the suggestion's place ID.
 *
 * @param suggestion - The suggestion to open in Google Maps, or null if no suggestion is available
 */
export function GoogleMapsButton({ suggestion }: GoogleMapsButtonProps) {
  const { displayToast } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const openGoogleMaps = async () => {
    if (!suggestion || !suggestion.shareLink || isLoading) return;
    setIsLoading(true);
    const url = suggestion.shareLink;
    Linking.openURL(url)
      .catch(() =>
        displayToast({ message: "Yikes! We failed to open Google Maps." })
      )
      .finally(() => setIsLoading(false));
  };

  return (
    <TextButton
      label={copy.viewOnGoogleMaps}
      onPress={openGoogleMaps}
      variant={ButtonVariant.black}
      fullWidth
      loading={isLoading}
    />
  );
}
