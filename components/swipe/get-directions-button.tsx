import { TextButton } from "@/components/common/text-button";
import { GetDirectionsModal } from "@/components/swipe/get-directions-modal";
import { ButtonVariant } from "@/constants/buttons";
import { Suggestion } from "@/data/suggestions";
import { useModal } from "@/hooks/use-modal";

interface GetDirectionsButtonProps {
  suggestion: Suggestion | null;
}

const copy = {
  getDirections: "Get Directions",
};

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
