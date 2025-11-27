import { FixedView } from "@/components/common/fixed-view";
import { Inputs } from "@/constants/inputs";
import { getShadow } from "@/utils/shadows";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { TextInput, View } from "react-native";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/**
 * Search bar component for the my-spots page.
 * Fixed at the bottom with a gradient background and search functionality.
 *
 * @param searchQuery - Current search query value
 * @param onSearchChange - Callback function when search query changes
 */
export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <FixedView bottom={0} left={0} right={0} withSafeAreaInsets>
      <LinearGradient
        colors={["rgba(0, 0, 0, 0.3)", "rgba(0, 0, 0, 0)"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        className='absolute inset-0'
      />
      <View className='px-4 pb-4 relative z-10'>
        <View
          className='w-full rounded-[24px] bg-black flex-row justify-center items-center'
          style={getShadow("light")}
        >
          <View className='pl-5 pr-3'>
            <Ionicons
              name='search-outline'
              size={20}
              color={Inputs.search.style.placeholderColor}
            />
          </View>
          <TextInput
            className='flex-1 py-3 pr-4 text-lg text-black'
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder={Inputs.search.placeholder}
            placeholderTextColor={Inputs.search.style.placeholderColor}
            autoCapitalize='none'
            autoCorrect={false}
          />
        </View>
      </View>
    </FixedView>
  );
}
