import { FontsProvider } from "@/contexts/FontsContext";
import { SuggestionsProvider } from "@/contexts/SuggestionsContext";
import { SurveyProvider } from "@/contexts/SurveyContext";
import { ToastProvider } from "@/contexts/ToastContext";
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
