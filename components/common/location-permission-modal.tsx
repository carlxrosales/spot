import { BottomModal } from "@/components/common/bottom-modal";
import { TextButton } from "@/components/common/text-button";
import { ButtonVariant } from "@/constants/buttons";
import { useLocation } from "@/contexts/location-context";
import { LocationCoordinates } from "@/data/types";
import { useCallback } from "react";
import { Platform } from "react-native";

const copy = {
  title: "FBI wants to know your location",
  description:
    "Just kidding! We need your location to find the best spots near you.",
  enableLocation: {
    default: "Enable Location",
    ios: "Continue",
  },
};

interface LocationPermissionModalProps {
  onPermissionGranted?: (location: LocationCoordinates) => void;
}

/**
 * Modal component for requesting location permission.
 * Displays when location permission is not granted and cannot be dismissed until permission is granted.
 * Automatically shows/hides based on permission status.
 *
 * @param onPermissionGranted - Optional callback called when permission is granted with the location
 */
export function LocationPermissionModal({
  onPermissionGranted,
}: LocationPermissionModalProps) {
  const { isLoading, requestPermission } = useLocation();

  const handleRequestPermission = useCallback(async () => {
    const location = await requestPermission();
    if (location && onPermissionGranted) {
      onPermissionGranted(location);
    }
  }, [requestPermission, onPermissionGranted]);

  return (
    <BottomModal
      visible
      onClose={() => {}}
      title={copy.title}
      description={copy.description}
      dismissible={false}
    >
      <TextButton
        label={
          Platform.OS === "ios"
            ? copy.enableLocation.ios
            : copy.enableLocation.default
        }
        onPress={handleRequestPermission}
        variant={ButtonVariant.black}
        fullWidth
        loading={isLoading}
      />
    </BottomModal>
  );
}
