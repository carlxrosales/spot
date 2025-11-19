import { TextButton } from "@/components/common/text-button";
import { ButtonVariant } from "@/constants/buttons";
import { useShare } from "@/contexts/share-context";
import { Suggestion } from "@/data/suggestions";

interface ShareButtonProps {
  suggestion: Suggestion | null;
}

const copy = {
  share: "Share",
};

/**
 * Share button component for suggestions.
 * Triggers sharing functionality for a suggestion with loading state support.
 *
 * @param suggestion - The suggestion to share, or null if no suggestion is available
 */
export function ShareButton({ suggestion }: ShareButtonProps) {
  const { shareSuggestion, isSharing } = useShare();

  const handleShare = () => {
    if (!suggestion || isSharing) return;
    shareSuggestion(suggestion);
  };

  return (
    <TextButton
      label={copy.share}
      onPress={handleShare}
      variant={ButtonVariant.black}
      fullWidth
      loading={isSharing}
    />
  );
}
