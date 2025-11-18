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

export function WazeButton({ suggestion }: WazeButtonProps) {
  const { displayToast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const openWaze = () => {
    if (!suggestion || isLoading) return;
    setIsLoading(true);
    const { lat, lng } = suggestion.location;
    const url = `waze://?ll=${lat},${lng}&navigate=yes`;
    Linking.openURL(url)
      .catch(() => {
        const fallbackUrl = `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`;
        Linking.openURL(fallbackUrl).catch(() =>
          displayToast({ message: "Yikes! We failed to open Waze" })
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
