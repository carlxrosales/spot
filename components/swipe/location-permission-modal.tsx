import { BottomModal } from "@/components/common/bottom-modal";
import { TextButton } from "@/components/common/text-button";
import { ButtonVariant } from "@/constants/buttons";
import { useLocation } from "@/contexts/location-context";

const copy = {
  title: "FBI wants to know your location",
  description:
    "Just kidding! We need your location to find the best spots near you.",
  enableLocation: "Enable Location",
};

export function LocationPermissionModal() {
  const { hasPermission, isLoading, requestPermission } = useLocation();
  return (
    <BottomModal
      visible={!hasPermission && !isLoading}
      onClose={() => {}}
      title={copy.title}
      description={copy.description}
      dismissible={false}
    >
      <TextButton
        label={copy.enableLocation}
        onPress={requestPermission}
        variant={ButtonVariant.black}
        fullWidth
        loading={isLoading}
      />
    </BottomModal>
  );
}
