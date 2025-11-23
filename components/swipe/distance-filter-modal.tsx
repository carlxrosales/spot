import { BottomModal } from "@/components/common/bottom-modal";
import { TextButton } from "@/components/common/text-button";
import { Colors } from "@/constants/theme";
import { Timeouts } from "@/constants/timeouts";
import { useSuggestions } from "@/contexts/suggestions-context";
import {
  DEFAULT_MIN_DISTANCE_IN_KM,
  DISTANCE_OPTIONS,
} from "@/data/suggestions";
import { ensureMinimumDelay } from "@/utils/delay";
import { Picker } from "@react-native-picker/picker";
import { useCallback, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const copy = {
  title: "How far I'll go",
  description: "Set minimum and maximum distance",
  minDistance: "Min Distance",
  maxDistance: "Max Distance",
  anyDistance: "Any distance",
  minLabel: "Min:",
  maxLabel: "Max:",
  save: "Save",
};

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
  const { initialMaxDistance, filterSuggestions } = useSuggestions();

  const [activeTab, setActiveTab] = useState<TabType>("max");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedMinDistance, setSelectedMinDistance] = useState<number>(
    DEFAULT_MIN_DISTANCE_IN_KM
  );
  const [selectedMaxDistance, setSelectedMaxDistance] =
    useState<number>(initialMaxDistance);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    await ensureMinimumDelay(Timeouts.distanceFilter)(() =>
      filterSuggestions(selectedMinDistance, selectedMaxDistance)
    );
    setIsLoading(false);
    onClose();
  }, [selectedMinDistance, selectedMaxDistance, filterSuggestions, onClose]);

  const formatDistanceLabel = (distance: number) => {
    if (distance === 0) {
      return copy.anyDistance;
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
      title={copy.title}
      description={copy.description}
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
              {copy.minDistance}
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
              {copy.maxDistance}
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
          <Text className='text-black opacity-80 text-sm'>
            {copy.minLabel} {formatDistanceLabel(selectedMinDistance)}
          </Text>
          <Text className='text-black opacity-80 text-sm'>
            {copy.maxLabel} {formatDistanceLabel(selectedMaxDistance)}
          </Text>
        </View>

        <TextButton
          onPress={handleSave}
          label={copy.save}
          variant='black'
          loading={isLoading}
          fullWidth
        />
      </View>
    </BottomModal>
  );
}
