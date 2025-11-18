import { TextButton } from "@/components/common/text-button";
import { GetDirectionsModal } from "@/components/swipe/get-directions-modal";
import { ButtonVariant } from "@/constants/buttons";
import { Suggestion } from "@/data/suggestions";
import { useState } from "react";

interface GetDirectionsButtonProps {
  suggestion: Suggestion | null;
}

const copy = {
  getDirections: "Get Directions",
};

export function GetDirectionsButton({ suggestion }: GetDirectionsButtonProps) {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const handlePress = () => {
    if (!suggestion) return;
    setIsModalVisible(true);
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
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        suggestion={suggestion}
      />
    </>
  );
}
