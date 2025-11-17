import { FontsProvider } from "@/contexts/fonts-context";
import { SuggestionsProvider } from "@/contexts/suggestions-context";
import { SurveyProvider } from "@/contexts/survey-context";
import { ToastProvider } from "@/contexts/toast-context";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

export default function RootLayout() {
  const screenOptions = {
    headerShown: false,
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FontsProvider>
        <ToastProvider>
          <SurveyProvider>
            <SuggestionsProvider>
              <Stack screenOptions={screenOptions}>
                <Stack.Screen
                  name='custom-input'
                  options={{
                    headerShown: false,
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
