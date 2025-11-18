import { FontsProvider } from "@/contexts/fonts-context";
import { SuggestionsProvider } from "@/contexts/suggestions-context";
import { SurveyProvider } from "@/contexts/survey-context";
import { ToastProvider } from "@/contexts/toast-context";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

export default function RootLayout() {
  const commonScreenOptions = {
    headerShown: false,
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FontsProvider>
        <ToastProvider>
          <SurveyProvider>
            <SuggestionsProvider>
              <Stack screenOptions={commonScreenOptions}>
                <Stack.Screen name='survey' options={commonScreenOptions} />
                <Stack.Screen name='swipe' options={commonScreenOptions} />
                <Stack.Screen
                  name='custom-input'
                  options={{
                    ...commonScreenOptions,
                    presentation: "modal",
                  }}
                />
                <Stack.Screen
                  name='lazy-mode'
                  options={{
                    ...commonScreenOptions,
                    presentation: "modal",
                  }}
                />
              </Stack>
            </SuggestionsProvider>
          </SurveyProvider>
        </ToastProvider>
      </FontsProvider>
    </GestureHandlerRootView>
  );
}
