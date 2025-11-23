import { BottomModal } from "@/components/common/bottom-modal";
import { TextButton } from "@/components/common/text-button";
import { Colors } from "@/constants/theme";
import { useLocation } from "@/contexts/location-context";
import { useSuggestions } from "@/contexts/suggestions-context";
import { getCities } from "@/data/cities";
import { DISTANCE_OPTIONS } from "@/data/suggestions";
import { Picker } from "@react-native-picker/picker";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

const copy = {
  title: "How far I'll go",
  description: "Set city or maximum distance",
  city: "City",
  maxDistance: "Max Distance",
  anyCity: "Any city",
  anyDistance: "Any distance",
  cityLabel: "City:",
  maxLabel: "Max:",
  save: "Save",
};

interface DistanceFilterModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = "city" | "max";

/**
 * Modal component for filtering suggestions by city and maximum distance.
 * Allows users to select a city (which triggers a refetch) and maximum distance in kilometers for filtering place suggestions.
 *
 * @param visible - Whether the modal is visible
 * @param onClose - Callback function called when modal is closed
 */
export function DistanceFilterModal({
  visible,
  onClose,
}: DistanceFilterModalProps) {
  const {
    initialMaxDistance,
    filterSuggestions,
    filterCity,
    setFilterCity,
    fetchSuggestions,
  } = useSuggestions();
  const { location } = useLocation();

  const [activeTab, setActiveTab] = useState<TabType>("max");
  const [selectedCity, setSelectedCity] = useState<string | null>(filterCity);
  const [selectedMaxDistance, setSelectedMaxDistance] =
    useState<number>(initialMaxDistance);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false);

  useEffect(() => {
    setSelectedCity(filterCity);
    loadCities();
  }, []);

  const loadCities = useCallback(async () => {
    setIsLoadingCities(true);
    try {
      const citiesList = await getCities();
      setCities(citiesList);
    } catch {
      // Handle error silently
    } finally {
      setIsLoadingCities(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    const cityChanged = selectedCity !== filterCity;

    if (cityChanged && location) {
      setFilterCity(selectedCity);
      fetchSuggestions(location, true, undefined, selectedCity);
    }

    filterSuggestions(selectedMaxDistance);
    onClose();
  }, [
    selectedCity,
    selectedMaxDistance,
    filterCity,
    initialMaxDistance,
    setFilterCity,
    fetchSuggestions,
    filterSuggestions,
    location,
    onClose,
  ]);

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

  const handleValueChange = useCallback(
    (itemValue: string | number) => {
      if (activeTab === "city") {
        setSelectedCity(
          itemValue === copy.anyCity ? null : (itemValue as string)
        );
        setSelectedMaxDistance(DISTANCE_OPTIONS[0]);
      } else {
        setSelectedMaxDistance(itemValue as number);
      }
    },
    [activeTab]
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
            onPress={() => setActiveTab("city")}
            className={`flex-1 py-3 rounded-[16px] ${
              activeTab === "city" ? "bg-black" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-center font-semibold text-base ${
                activeTab === "city" ? "text-white" : "text-black"
              }`}
            >
              {copy.city}
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
          {isLoadingCities && activeTab === "city" ? (
            <View className='py-8 items-center justify-center'>
              <ActivityIndicator size='large' color={Colors.black} />
            </View>
          ) : (
            <Picker
              selectedValue={
                activeTab === "city"
                  ? selectedCity || copy.anyCity
                  : selectedMaxDistance
              }
              onValueChange={handleValueChange}
              style={{
                backgroundColor: "transparent",
              }}
              itemStyle={{
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              {activeTab === "city" ? (
                <>
                  <Picker.Item
                    label={copy.anyCity}
                    value={copy.anyCity}
                    color={Colors.black}
                  />
                  {cities.map((city) => (
                    <Picker.Item
                      key={city}
                      label={city}
                      value={city}
                      color={Colors.black}
                    />
                  ))}
                </>
              ) : (
                DISTANCE_OPTIONS.map((distance) => (
                  <Picker.Item
                    key={distance}
                    label={formatDistanceLabel(distance)}
                    value={distance}
                    color={Colors.black}
                  />
                ))
              )}
            </Picker>
          )}
        </View>

        {/* Current Selection Display */}
        <View className='flex-row justify-between items-center px-2'>
          <Text className='text-black opacity-80 text-sm'>
            {copy.cityLabel} {selectedCity || copy.anyCity}
          </Text>
          <Text className='text-black opacity-80 text-sm'>
            {copy.maxLabel} {formatDistanceLabel(selectedMaxDistance)}
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
