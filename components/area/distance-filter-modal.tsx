import { BottomModal } from "@/components/common/bottom-modal";
import { TextButton } from "@/components/common/text-button";
import { Colors } from "@/constants/theme";
import { useArea } from "@/contexts/area-context";
import { useLocation } from "@/contexts/location-context";
import { getCities } from "@/data/cities";
import { DISTANCE_OPTIONS, LAST_DISTANCE_OPTION } from "@/data/suggestions";
import { Picker } from "@react-native-picker/picker";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

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
 * Modal component for filtering area suggestions by city and maximum distance.
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
    filterOpenNow,
    filterCity,
    setFilterCity,
    filterMaxDistance,
    setFilterMaxDistance,
    fetchSuggestionsByArea,
    area,
  } = useArea();
  const { location } = useLocation();
  const colorScheme = useColorScheme();

  const [activeTab, setActiveTab] = useState<TabType>("max");
  const [selectedCity, setSelectedCity] = useState<string | null>(filterCity);
  const [selectedMaxDistance, setSelectedMaxDistance] =
    useState<number>(initialMaxDistance);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false);

  useEffect(() => {
    const loadCities = async () => {
      setIsLoadingCities(true);
      try {
        const citiesList = await getCities();
        setCities(citiesList);
      } catch {
        // Handle error silently
      } finally {
        setIsLoadingCities(false);
      }
    };
    loadCities();
    setSelectedCity(filterCity);
  }, []);

  useEffect(() => {
    setSelectedMaxDistance(filterMaxDistance ?? initialMaxDistance);
  }, [filterMaxDistance, initialMaxDistance]);

  const handleSave = useCallback(async () => {
    const cityChanged = selectedCity !== filterCity;
    const distanceChanged =
      selectedMaxDistance !== (filterMaxDistance ?? initialMaxDistance);

    if ((cityChanged || distanceChanged) && location && area) {
      if (cityChanged) {
        setFilterCity(selectedCity);
      }
      if (distanceChanged) {
        setFilterMaxDistance(selectedMaxDistance);
      }
      await fetchSuggestionsByArea(
        location,
        area,
        filterOpenNow,
        selectedCity,
        selectedMaxDistance
      );
    }

    onClose();
  }, [
    selectedCity,
    selectedMaxDistance,
    filterOpenNow,
    filterCity,
    filterMaxDistance,
    initialMaxDistance,
    setFilterCity,
    setFilterMaxDistance,
    fetchSuggestionsByArea,
    location,
    area,
    onClose,
  ]);

  const formatDistanceLabel = (distance: number) => {
    if (distance === LAST_DISTANCE_OPTION) {
      return copy.anyDistance;
    }

    return `${distance} km`;
  };

  const handleCityChange = useCallback((itemValue: string) => {
    setSelectedCity(itemValue === copy.anyCity ? null : itemValue);
    setSelectedMaxDistance(LAST_DISTANCE_OPTION);
  }, []);

  const handleDistanceChange = useCallback((itemValue: number) => {
    setSelectedMaxDistance(itemValue);
  }, []);

  const renderCityPicker = () => {
    if (isLoadingCities) {
      return (
        <View className='py-8 items-center justify-center'>
          <ActivityIndicator size='large' color={Colors.black} />
        </View>
      );
    }

    const pickerColor =
      Platform.OS === "android" && colorScheme === "dark"
        ? Colors.white
        : Colors.black;

    return (
      <Picker
        selectedValue={selectedCity || copy.anyCity}
        onValueChange={handleCityChange}
        style={{
          color: Colors.black,
          backgroundColor: "transparent",
        }}
        itemStyle={{
          fontSize: 18,
          fontWeight: "600",
        }}
        mode={Platform.OS === "android" ? "dropdown" : undefined}
      >
        <Picker.Item
          label={copy.anyCity}
          value={copy.anyCity}
          color={pickerColor}
        />
        {cities.map((city) => (
          <Picker.Item
            key={city}
            label={city}
            value={city}
            color={pickerColor}
          />
        ))}
      </Picker>
    );
  };

  const renderDistancePicker = () => {
    const pickerColor =
      Platform.OS === "android" && colorScheme === "dark"
        ? Colors.white
        : Colors.black;

    return (
      <Picker
        selectedValue={selectedMaxDistance}
        onValueChange={handleDistanceChange}
        style={{
          color: Colors.black,
          backgroundColor: "transparent",
        }}
        itemStyle={{
          fontSize: 18,
          fontWeight: "600",
        }}
        mode={Platform.OS === "android" ? "dropdown" : undefined}
      >
        {DISTANCE_OPTIONS.map((distance) => (
          <Picker.Item
            key={distance}
            label={formatDistanceLabel(distance)}
            value={distance}
            color={pickerColor}
          />
        ))}
      </Picker>
    );
  };

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
          {activeTab === "city" ? renderCityPicker() : renderDistancePicker()}
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
