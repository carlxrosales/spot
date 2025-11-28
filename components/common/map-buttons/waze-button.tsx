import { TextButton } from "@/components/common/text-button";
import { ButtonVariant } from "@/constants/buttons";
import { useToast } from "@/contexts/toast-context";
import { Suggestion } from "@/data/suggestions";
import { useState } from "react";
import { Linking } from "react-native";

interface WazeButtonProps {
  suggestion: Suggestion | null;
}

const copy = {
  openInWaze: "Open in Waze",
};

/**
 * Button component that opens a suggestion in Waze navigation app.
 * Attempts to open Waze app, with fallback to web version if app is not available.
 *
 * @param suggestion - The suggestion to open in Waze, or null if no suggestion is available
 */
export function WazeButton({ suggestion }: WazeButtonProps) {
  const { displayToast } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const openWaze = () => {
    if (!suggestion || isLoading) return;
    setIsLoading(true);
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
    <TextButton
      label={copy.openInWaze}
      onPress={openWaze}
      variant={ButtonVariant.white}
      fullWidth
      loading={isLoading}
    />
  );
}

