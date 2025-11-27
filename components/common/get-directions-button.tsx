import { GetDirectionsModal } from "@/components/common/get-directions-modal";
import { TextButton } from "@/components/common/text-button";
import { ButtonVariant } from "@/constants/buttons";
import { Suggestion } from "@/data/suggestions";
import { useModal } from "@/hooks/use-modal";

interface GetDirectionsButtonProps {
  suggestion: Suggestion | null;
}

const copy = {
  getDirections: "Get Directions",
};

/**
 * Button component that opens the get directions modal.
 * Triggers a modal to select a navigation app (Google Maps or Waze) for directions.
 *
 * @param suggestion - The suggestion to get directions for, or null if no suggestion is available
 */
export function GetDirectionsButton({ suggestion }: GetDirectionsButtonProps) {
  const getDirectionsModal = useModal();

  const handlePress = () => {
    if (!suggestion) return;
    getDirectionsModal.handleOpen();
  };

  return (
    <>
      <TextButton
        label={copy.getDirections}
        onPress={handlePress}
        variant={ButtonVariant.white}
        fullWidth
      />
      <GetDirectionsModal
        visible={getDirectionsModal.isVisible}
        onClose={getDirectionsModal.handleClose}
        suggestion={suggestion}
      />
    </>
  );
}
