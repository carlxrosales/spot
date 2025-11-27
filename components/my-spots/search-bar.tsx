import { AbsoluteView } from "@/components/common/absolute-view";
import { SafeView } from "@/components/common/safe-view";
import { Inputs } from "@/constants/inputs";
import { getShadow } from "@/utils/shadows";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Keyboard, Platform, TextInput, View } from "react-native";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

/**
 * Search bar component for the my-spots page.
 * Fixed at the bottom with a gradient background and search functionality.
 * Automatically adjusts position when keyboard is open.
 *
 * @param searchQuery - Current search query value
 * @param onSearchChange - Callback function when search query changes
 */
export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <AbsoluteView bottom={keyboardHeight} left={0} right={0}>
      <LinearGradient
        colors={["rgba(0, 0, 0, 0.3)", "rgba(0, 0, 0, 0)"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        className='absolute inset-0'
      />
      <SafeView edges={["left", "right", "bottom"]}>
        <View className='px-4 pb-4 relative'>
          <View
            className='w-full rounded-[24px] bg-black flex-row justify-start items-center px-5 gap-4'
            style={getShadow("light")}
          >
            <Ionicons
              name='search-outline'
              size={20}
              color={Inputs.search.style.placeholderColor}
            />
            <TextInput
              className={`flex-1 text-xl text-white pt-3 pb-4`}
              textAlign='left'
              textAlignVertical='top'
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder={Inputs.search.placeholder}
              placeholderTextColor={Inputs.search.style.placeholderColor}
              autoCapitalize='none'
              numberOfLines={1}
              multiline
              autoCorrect={false}
              returnKeyType='done'
            />
          </View>
        </View>
      </SafeView>
    </AbsoluteView>
  );
}
