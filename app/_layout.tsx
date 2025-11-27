import { NetworkOverlay } from "@/components/common/network-overlay";
import { FontsProvider } from "@/contexts/fonts-context";
import { LocationProvider } from "@/contexts/location-context";
import { SurveyProvider } from "@/contexts/survey-context";
import { ToastProvider } from "@/contexts/toast-context";
import { useNetworkConnectivity } from "@/hooks/use-network-connectivity";
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

  const isConnected = useNetworkConnectivity();

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
                    animation: "slide_from_bottom",
                  }}
                />
                <Stack.Screen
                  name='lazy-mode'
                  options={{
                    ...commonScreenOptions,
                    presentation: "modal",
                    animation: "slide_from_bottom",
                  }}
                />
                <Stack.Screen name='suggestion' options={commonScreenOptions} />
                <Stack.Screen name='my-spots' options={commonScreenOptions} />

                {/* recommendation (share) link */}
                <Stack.Screen name='recos' options={commonScreenOptions} />
              </Stack>
              <NetworkOverlay visible={!isConnected} />
            </SurveyProvider>
          </ToastProvider>
        </LocationProvider>
      </FontsProvider>
    </GestureHandlerRootView>
  );
}
