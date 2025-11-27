import { TextButton } from "@/components/common/text-button";
import { ButtonVariant } from "@/constants/buttons";
import { useShare } from "@/contexts/share-context";
import { Suggestion } from "@/data/suggestions";

interface ShareButtonProps {
  suggestion: Suggestion | null;
  currentPhotoIndex: number;
}

const copy = {
  share: "Share",
};

/**
 * Share button component for suggestions.
 * Triggers sharing functionality for a suggestion with loading state support.
 *
 * @param suggestion - The suggestion to share, or null if no suggestion is available
 * @param currentPhotoIndex - The current photo index to use when sharing
 */
export function ShareButton({
  suggestion,
  currentPhotoIndex,
}: ShareButtonProps) {
  const { shareSuggestion, isSharing } = useShare();

  const handleShare = () => {
    if (!suggestion || isSharing) return;
    shareSuggestion(suggestion, currentPhotoIndex);
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
