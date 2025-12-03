import { AbsoluteView } from "@/components/common/absolute-view";
import { SafeView } from "@/components/common/safe-view";
import { Inputs } from "@/constants/inputs";
import { getShadow } from "@/utils/shadows";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, TextInput, View } from "react-native";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const DEBOUNCE_DELAY = 300;

/**
 * Search bar component for the my-spots page.
 * Fixed at the bottom with a gradient background and search functionality.
 * Automatically adjusts position when keyboard is open.
 * Debounces search input to reduce unnecessary filtering operations.
 *
 * @param searchQuery - Current search query value
 * @param onSearchChange - Callback function when search query changes
 */
export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleTextChange = useCallback(
    (text: string) => {
      const textWithoutNewlines = text.replace(/\n/g, "");
      if (textWithoutNewlines !== text) {
        Keyboard.dismiss();
      }

      setLocalQuery(textWithoutNewlines);

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        onSearchChange(textWithoutNewlines);
      }, DEBOUNCE_DELAY);
    },
    [onSearchChange]
  );

  return (
    <AbsoluteView bottom={0} left={0} right={0} avoidKeyboard>
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
              value={localQuery}
              onChangeText={handleTextChange}
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
