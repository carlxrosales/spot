import { BottomModal } from "@/components/common/bottom-modal";
import { TextButton } from "@/components/common/text-button";
import { useArea } from "@/contexts/area-context";
import { useLocation } from "@/contexts/location-context";
import { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const copy = {
  title: "Who's up now",
  description: "Choose if you want to see all spots or just those open atm",
  allPlaces: "All spots",
  openNow: "Open now",
  infoOpenNow: "Only showing spots that are currently open",
  infoAllPlaces: "Showing all spots regardless of opening hours",
  save: "Save",
};

interface OpenNowFilterModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Modal component for filtering area suggestions by open now status.
 * Allows users to toggle filtering to only show places that are currently open.
 *
 * @param visible - Whether the modal is visible
 * @param onClose - Callback function called when modal is closed
 */
export function OpenNowFilterModal({
  visible,
  onClose,
}: OpenNowFilterModalProps) {
  const { filterOpenNow, setFilterOpenNow, fetchSuggestionsByArea, area } =
    useArea();
  const { location } = useLocation();

  const [selectedFilter, setSelectedFilter] = useState<boolean>(filterOpenNow);

  useEffect(() => {
    if (visible) {
      setSelectedFilter(filterOpenNow);
    }
  }, [visible, filterOpenNow]);

  const handleSave = useCallback(async () => {
    setFilterOpenNow(selectedFilter);
    if (location && area) {
      await fetchSuggestionsByArea(location, area, selectedFilter);
    }
    onClose();
  }, [
    selectedFilter,
    setFilterOpenNow,
    location,
    area,
    fetchSuggestionsByArea,
    onClose,
  ]);

  return (
    <BottomModal
      visible={visible}
      onClose={onClose}
      title={copy.title}
      description={copy.description}
      showCancelButton
    >
      <View className='gap-3'>
        {/* Toggle Options */}
        <View className='flex-row gap-2'>
          <TouchableOpacity
            onPress={() => setSelectedFilter(false)}
            className={`flex-1 py-3 rounded-[16px] ${
              !selectedFilter ? "bg-black" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-semibold text-base ${
                !selectedFilter ? "text-white" : "text-black"
              }`}
            >
              {copy.allPlaces}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedFilter(true)}
            className={`flex-1 py-3 rounded-[16px] ${
              selectedFilter ? "bg-black" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-semibold text-base ${
                selectedFilter ? "text-white" : "text-black"
              }`}
            >
              {copy.openNow}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Text */}
        <View className='px-2'>
          <Text className='text-black opacity-80 text-sm text-center'>
            {selectedFilter ? copy.infoOpenNow : copy.infoAllPlaces}
          </Text>
        </View>

        <TextButton
          onPress={handleSave}
          label={copy.save}
          variant='black'
          fullWidth
        />
      </View>
    </BottomModal>
  );
}
