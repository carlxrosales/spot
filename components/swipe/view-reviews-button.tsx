import { TextButton } from "@/components/common/text-button";
import { ButtonVariant } from "@/constants/buttons";
import { useToast } from "@/contexts/toast-context";
import { Suggestion } from "@/data/suggestions";
import { useState } from "react";
import { Linking } from "react-native";

interface ViewReviewsButtonProps {
  suggestion: Suggestion | null;
}

const copy = {
  viewReviews: "View Reviews",
};

/**
 * Button component that opens reviews for a suggestion.
 * Launches the reviews page using the suggestion's reviewsLink.
 *
 * @param suggestion - The suggestion to view reviews for, or null if no suggestion is available
 */
export function ViewReviewsButton({ suggestion }: ViewReviewsButtonProps) {
  const { displayToast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const openReviews = async () => {
    if (!suggestion?.reviewsLink || isLoading) return;
    setIsLoading(true);
    Linking.openURL(suggestion.reviewsLink)
      .catch(() =>
        displayToast({ message: "Yikes! We failed to open reviews." })
      )
      .finally(() => setIsLoading(false));
  };

  return (
    <TextButton
      label={copy.viewReviews}
      onPress={openReviews}
      variant={ButtonVariant.white}
      fullWidth
      loading={isLoading}
      disabled={!suggestion?.reviewsLink}
    />
  );
}
