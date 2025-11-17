import { FontsProvider } from "@/contexts/FontsContext";
import { SurveyProvider } from "@/contexts/SurveyContext";
import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  const screenOptions = {
    headerShown: false,
  };

  return (
    <FontsProvider>
      <SurveyProvider>
        <Stack screenOptions={screenOptions} />
      </SurveyProvider>
    </FontsProvider>
  );
}
