import { FontsProvider } from "@/contexts/fonts-context";
import { LocationProvider } from "@/contexts/location-context";
import { SurveyProvider } from "@/contexts/survey-context";
import { ToastProvider } from "@/contexts/toast-context";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

/**
 * Root layout component for the application.
 * Sets up the navigation stack and provides all context providers.
 * Configures screen options and presentation styles for different routes.
 */
export default function RootLayout() {
  const commonScreenOptions = {
    headerShown: false,
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FontsProvider>
        <LocationProvider>
          <ToastProvider>
            <SurveyProvider>
              <Stack screenOptions={commonScreenOptions}>
                <Stack.Screen name='survey' options={commonScreenOptions} />
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
                <Stack.Screen name='swipe' options={commonScreenOptions} />
              </Stack>
            </SurveyProvider>
          </ToastProvider>
        </LocationProvider>
      </FontsProvider>
    </GestureHandlerRootView>
  );
}
