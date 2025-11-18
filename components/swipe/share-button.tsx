import { TextButton } from "@/components/common/text-button";
import { ButtonVariant } from "@/constants/buttons";
import { useToast } from "@/contexts/toast-context";
import { Suggestion } from "@/data/suggestions";
import { useState } from "react";
import { Share } from "react-native";

interface ShareButtonProps {
  suggestion: Suggestion | null;
}

const copy = {
  share: "Share",
};

export function ShareButton({ suggestion }: ShareButtonProps) {
  const { displayToast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleShare = async () => {
    if (!suggestion || isLoading) return;
    setIsLoading(true);
    try {
      const googleMapsUrl = `https://www.google.com/maps/place/?q=place_id:${suggestion.id}`;
      const message = `Found our spot: ${suggestion.name}\n👉 ${googleMapsUrl}`;

      const result = await Share.share({
        message,
        title: suggestion.name,
      });

      if (result.action === Share.sharedAction) {
        displayToast({ message: "Shared" });
      } else {
        displayToast({ message: "Cancelled" });
      }
    } catch {
      displayToast({ message: "Yo! We failed to share." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TextButton
      label={copy.share}
      onPress={handleShare}
      variant={ButtonVariant.black}
      fullWidth
      loading={isLoading}
    />
  );
}
