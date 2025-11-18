import { UserLocation } from "@/data/location";
import * as Location from "expo-location";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface LocationContextType {
  location: UserLocation | null;
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocation(null);
        setHasPermission(false);
        setIsLoading(false);
        setError("Oof! You denied us access to your location");
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      setLocation({
        lat: locationData.coords.latitude,
        lng: locationData.coords.longitude,
      });
      setHasPermission(true);
      setIsLoading(false);
      setError(null);
    } catch {
      setLocation(null);
      setHasPermission(false);
      setIsLoading(false);
      setError("Oof! Can't find your location");
    }
  }, []);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === "granted") {
          const locationData = await Location.getCurrentPositionAsync({});
          setLocation({
            lat: locationData.coords.latitude,
            lng: locationData.coords.longitude,
          });
          setHasPermission(true);
          setIsLoading(false);
          setError(null);
        } else {
          setLocation(null);
          setHasPermission(false);
          setIsLoading(false);
          setError(null);
        }
      } catch {
        setLocation(null);
        setHasPermission(false);
        setIsLoading(false);
        setError("Oof! Can't find your location");
      }
    };

    checkPermission();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        hasPermission,
        isLoading,
        error,
        requestPermission,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
