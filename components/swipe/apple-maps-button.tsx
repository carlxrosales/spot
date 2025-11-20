import { TextButton } from "@/components/common/text-button";
import { ButtonVariant } from "@/constants/buttons";
import { useToast } from "@/contexts/toast-context";
import { Suggestion } from "@/data/suggestions";
import { useState } from "react";
import { Linking } from "react-native";

interface AppleMapsButtonProps {
  suggestion: Suggestion | null;
}

const copy = {
  viewOnAppleMaps: "Open in Apple Maps",
};

/**
 * Button component that opens a suggestion in Apple Maps.
 * Launches Apple Maps with the suggestion's coordinates.
 *
 * @param suggestion - The suggestion to open in Apple Maps, or null if no suggestion is available
 */
export function AppleMapsButton({ suggestion }: AppleMapsButtonProps) {
  const { displayToast } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const openAppleMaps = () => {
    if (!suggestion || isLoading) return;
    setIsLoading(true);
    const { lat, lng } = suggestion;
    const url = `http://maps.apple.com/?ll=${lat},${lng}`;
    Linking.openURL(url)
      .catch(() =>
        displayToast({ message: "Yikes! We failed to open Apple Maps." })
      )
      .finally(() => setIsLoading(false));
  };

  return (
    <TextButton
      label={copy.viewOnAppleMaps}
      onPress={openAppleMaps}
      variant={ButtonVariant.black}
      fullWidth
      loading={isLoading}
    />
  );
}
