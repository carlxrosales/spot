import { useFonts as useExpoFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { createContext, ReactNode, useContext, useEffect } from "react";

SplashScreen.preventAutoHideAsync();

interface FontsContextType {
  fontsLoaded: boolean;
}

const FontsContext = createContext<FontsContextType | undefined>(undefined);

interface FontsProviderProps {
  children: ReactNode;
}

export function FontsProvider({ children }: FontsProviderProps) {
  const [fontsLoaded] = useExpoFonts({
    Groen: require("../assets/fonts/Groen.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <FontsContext.Provider value={{ fontsLoaded }}>
      {children}
    </FontsContext.Provider>
  );
}

export function useFonts() {
  const context = useContext(FontsContext);
  if (context === undefined) {
    throw new Error("useFontsContext must be used within a FontsProvider");
  }
  return context;
}
