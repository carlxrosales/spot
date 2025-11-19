import { BottomModal } from "@/components/common/bottom-modal";
import { TextButton } from "@/components/common/text-button";
import { Colors } from "@/constants/theme";
import { useSuggestions } from "@/contexts/suggestions-context";
import { DISTANCE_OPTIONS } from "@/data/suggestions/constants";
import { Picker } from "@react-native-picker/picker";
import { useCallback, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface DistanceFilterModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = "min" | "max";

/**
 * Modal component for filtering suggestions by minimum and maximum distance.
 * Allows users to select both minimum and maximum distance in kilometers for filtering place suggestions.
 *
 * @param visible - Whether the modal is visible
 * @param onClose - Callback function called when modal is closed
 */
export function DistanceFilterModal({
  visible,
  onClose,
}: DistanceFilterModalProps) {
  const { maxDistanceInKm, minDistanceInKm, handleFilterByDistance } =
    useSuggestions();
  const [activeTab, setActiveTab] = useState<TabType>("min");
  const [selectedMinDistance, setSelectedMinDistance] =
    useState<number>(minDistanceInKm);
  const [selectedMaxDistance, setSelectedMaxDistance] =
    useState<number>(maxDistanceInKm);

  const handleSave = useCallback(() => {
    handleFilterByDistance(selectedMinDistance, selectedMaxDistance);
    onClose();
  }, [
    selectedMinDistance,
    selectedMaxDistance,
    handleFilterByDistance,
    onClose,
  ]);

  const formatDistanceLabel = (distance: number) => {
    if (distance === 0) {
      return "Any distance";
    }

    const lastDistanceOption = DISTANCE_OPTIONS[DISTANCE_OPTIONS.length - 1];
    if (distance === lastDistanceOption) {
      return `${lastDistanceOption}+ km`;
    }

    return `${distance} km`;
  };

  const getAvailableMaxDistances = () => {
    return DISTANCE_OPTIONS.filter(
      (distance) => distance > selectedMinDistance
    );
  };

  const getAvailableMinDistances = () => {
    return DISTANCE_OPTIONS.filter(
      (distance) => distance < selectedMaxDistance
    );
  };

  const handleDistanceChange = useCallback(
    (itemValue: number) => {
      if (activeTab === "min") {
        setSelectedMinDistance(itemValue);
        // Ensure max is always greater than min
        if (itemValue >= selectedMaxDistance) {
          // Find the next available max distance
          const nextMax = DISTANCE_OPTIONS.find((d) => d > itemValue);
          if (nextMax !== undefined) {
            setSelectedMaxDistance(nextMax);
          }
        }
      } else {
        setSelectedMaxDistance(itemValue);
        // Ensure min is always less than max
        if (itemValue <= selectedMinDistance) {
          // Find the previous available min distance
          const prevMin = [...DISTANCE_OPTIONS]
            .reverse()
            .find((d) => d < itemValue);
          if (prevMin !== undefined) {
            setSelectedMinDistance(prevMin);
          }
        }
      }
    },
    [activeTab, selectedMaxDistance, selectedMinDistance]
  );

  return (
    <BottomModal
      visible={visible}
      onClose={onClose}
      title="How far I'll go"
      description='Set minimum and maximum distance'
      showCancelButton
    >
      <View className='gap-3'>
        {/* Tab Buttons */}
        <View className='flex-row gap-2'>
          <TouchableOpacity
            onPress={() => setActiveTab("min")}
            className={`flex-1 py-3 rounded-[16px] ${
              activeTab === "min" ? "bg-black" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-semibold text-base ${
                activeTab === "min" ? "text-white" : "text-black"
              }`}
            >
              Min Distance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("max")}
            className={`flex-1 py-3 rounded-[16px] ${
              activeTab === "max" ? "bg-black" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-semibold text-base ${
                activeTab === "max" ? "text-white" : "text-black"
              }`}
            >
              Max Distance
            </Text>
          </TouchableOpacity>
        </View>

        {/* Picker */}
        <View className='bg-gray-200 rounded-[24px] overflow-hidden'>
          <Picker
            selectedValue={
              activeTab === "min" ? selectedMinDistance : selectedMaxDistance
            }
            onValueChange={handleDistanceChange}
            style={{
              backgroundColor: "transparent",
            }}
            itemStyle={{
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            {(activeTab === "min"
              ? getAvailableMinDistances()
              : getAvailableMaxDistances()
            ).map((distance) => (
              <Picker.Item
                key={distance}
                label={formatDistanceLabel(distance)}
                value={distance}
                color={Colors.black}
              />
            ))}
          </Picker>
        </View>

        {/* Current Selection Display */}
        <View className='flex-row justify-between items-center px-2'>
          <Text className='text-gray-600 text-sm'>
            Min: {formatDistanceLabel(selectedMinDistance)}
          </Text>
          <Text className='text-gray-600 text-sm'>
            Max: {formatDistanceLabel(selectedMaxDistance)}
          </Text>
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
