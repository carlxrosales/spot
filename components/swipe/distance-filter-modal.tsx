import { BottomModal } from "@/components/common/bottom-modal";
import { TextButton } from "@/components/common/text-button";
import { Colors } from "@/constants/theme";
import { useSuggestions } from "@/contexts/suggestions-context";
import { DISTANCE_OPTIONS } from "@/data/suggestions/constants";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { View } from "react-native";

interface DistanceFilterModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Modal component for filtering suggestions by maximum distance.
 * Allows users to select a maximum distance in kilometers for filtering place suggestions.
 *
 * @param visible - Whether the modal is visible
 * @param onClose - Callback function called when modal is closed
 */
export function DistanceFilterModal({
  visible,
  onClose,
}: DistanceFilterModalProps) {
  const { maxDistanceInKm, handleFilterByDistance } = useSuggestions();
  const [selectedDistance, setSelectedDistance] =
    useState<number>(maxDistanceInKm);

  useEffect(() => {
    if (visible) {
      setSelectedDistance(maxDistanceInKm);
    }
  }, [visible, maxDistanceInKm]);

  const handleSave = () => {
    handleFilterByDistance(selectedDistance);
    onClose();
  };

  const formatDistanceLabel = (distance: number) => {
    if (distance === 250) {
      return "250+ km";
    }
    return `${distance} km`;
  };

  return (
    <BottomModal
      visible={visible}
      onClose={onClose}
      title='Max Distance'
      description="Choose how far you're willing to travel"
      showCancelButton
    >
      <View className='gap-3'>
        <View className='bg-gray-200 rounded-[24px] overflow-hidden'>
          <Picker
            selectedValue={selectedDistance}
            onValueChange={(itemValue) => setSelectedDistance(itemValue)}
            style={{
              backgroundColor: "transparent",
            }}
            itemStyle={{
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            {DISTANCE_OPTIONS.map((distance) => (
              <Picker.Item
                key={distance}
                label={formatDistanceLabel(distance)}
                value={distance}
                color={Colors.black}
              />
            ))}
          </Picker>
        </View>
        <TextButton
          onPress={handleSave}
          label='Save'
          variant='black'
          fullWidth
        />
      </View>
    </BottomModal>
  );
}
