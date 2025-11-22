import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

/**
 * Custom hook that monitors network connectivity status.
 * Returns whether the device is currently connected to the internet.
 *
 * @returns boolean indicating if device is connected to internet
 */
export function useNetworkConnectivity(): boolean {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isConnected;
}
