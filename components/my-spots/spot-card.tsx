import { BottomModal } from "@/components/common/bottom-modal";
import { Button } from "@/components/common/button";
import { IconButton } from "@/components/common/icon-button";
import { ImageCarousel } from "@/components/common/image-carousel";
import { GoogleMapsButton } from "@/components/common/map-buttons/google-maps-button";
import { ShareButton } from "@/components/common/share-button";
import { ButtonSize, ButtonVariant } from "@/constants/buttons";
import { Animation, Overlay } from "@/constants/theme";
import { Suggestion } from "@/data/suggestions";
import { useModal } from "@/hooks/use-modal";
import {
  getCountdown,
  getOpeningHoursForToday,
  isCurrentlyOpen,
} from "@/utils/places";
import { getShadow } from "@/utils/shadows";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const copy = {
  kmAway: "km away",
  closingIn: "Closing in",
  openingIn: "Opening in",
  spotted: "spotted",
  deleteModal: {
    title: "Is this goodbye?",
    description: "This action cannot be undone",
    button: "Delete spot",
  },
};

interface SpotCardProps {
  spot: Suggestion;
  getPhotoUri: (spotId: string, photoName: string) => string | undefined;
  onPhotoIndexChange: (spotId: string, index: number) => void;
  currentPhotoIndex: number;
  onRemove: (spotId: string) => Promise<void>;
  isRemoving: boolean;
  isVisible?: boolean;
}

/**
 * Spot card component for displaying saved spots in the my-spots page.
 * Matches the design of swipeable-card with selected/spotted state.
 * Displays spot photos, name, rating, distance, and opening hours.
 * Provides actions to share, get directions, and remove.
 *
 * @param spot - The spot to display
 * @param getPhotoUri - Function to get photo URI for a spot
 * @param onPhotoIndexChange - Callback when photo index changes
 * @param currentPhotoIndex - Current photo index
 * @param onRemove - Callback to remove the spot
 * @param isRemoving - Whether the spot is being removed
 */
export function SpotCard({
  spot,
  getPhotoUri,
  onPhotoIndexChange,
  currentPhotoIndex,
  onRemove,
  isRemoving,
  isVisible = false,
}: SpotCardProps) {
  const [countdown, setCountdown] = useState<string>("");
  const deleteModal = useModal();

  const scale = useSharedValue<number>(Animation.scale.hidden);
  const opacity = useSharedValue<number>(Animation.opacity.hidden);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isVisible) {
      if (!hasAnimated.current) {
        hasAnimated.current = true;
        scale.value = withSpring(Animation.scale.normal, Animation.dampSpring);
        opacity.value = withTiming(Animation.opacity.visible, {
          duration: Animation.duration.normal,
        });
      }
    }
  }, [isVisible, scale, opacity]);

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const imageItems = useMemo(
    () =>
      spot.photos?.map((photo) => ({
        name: photo,
        uri: getPhotoUri(spot.id, photo),
      })) || [],
    [spot.photos, spot.id, getPhotoUri]
  );

  const handlePhotoIndexChange = useCallback(
    (index: number) => {
      onPhotoIndexChange(spot.id, index);
    },
    [spot.id, onPhotoIndexChange]
  );

  const handleDeletePress = useCallback(() => {
    deleteModal.handleOpen();
  }, [deleteModal]);

  const handleConfirmDelete = useCallback(async () => {
    deleteModal.handleClose();
    await onRemove(spot.id);
  }, [deleteModal, onRemove, spot.id]);

  useEffect(() => {
    if (spot.opensAt || spot.closesAt) {
      const updateCountdown = () => {
        const isOpen = isCurrentlyOpen(spot.opensAt, spot.closesAt);

        if (!isOpen && spot.opensAt) {
          setCountdown(getCountdown(spot.opensAt));
        } else if (spot.closesAt) {
          setCountdown(getCountdown(spot.closesAt));
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 60000);

      return () => clearInterval(interval);
    }
  }, [spot.opensAt, spot.closesAt]);

  return (
    <Animated.View style={cardStyle}>
      <View
        className='bg-white rounded-3xl overflow-hidden m-4 mb-0'
        style={[getShadow("dark"), { height: 500 }]}
      >
        <View
          className='absolute top-8 right-[-55px] z-50'
          style={{ transform: [{ rotate: "45deg" }] }}
        >
          <View className='bg-neonPink px-20 py-3'>
            <Text className='text-white font-bold text-md'>{copy.spotted}</Text>
          </View>
        </View>
        <View className='absolute top-4 left-4 z-50'>
          <IconButton
            icon='trash-outline'
            variant={ButtonVariant.black}
            size={ButtonSize.sm}
            onPress={handleDeletePress}
            loading={isRemoving}
          />
        </View>
        {spot.photos && spot.photos.length > 0 && (
          <ImageCarousel
            images={imageItems}
            currentIndex={currentPhotoIndex}
            onIndexChange={handlePhotoIndexChange}
            showIndicator={false}
          />
        )}
        <View
          className='absolute bottom-0 left-0 right-0 p-6 gap-6 flex-1 w-full h-full'
          style={{
            backgroundColor: Overlay.backgroundColor,
          }}
          pointerEvents='box-none'
        >
          <View className='flex-1 justify-end h-full' pointerEvents='box-none'>
            <View className='py-4 gap-4' pointerEvents='box-none'>
              <Text
                className='text-5xl font-groen text-white'
                pointerEvents='none'
              >
                {spot.name}
              </Text>
              <View
                className='flex-row items-center justify-between'
                pointerEvents='box-none'
              >
                <Text
                  className='text-xl text-white font-semibold text-left'
                  pointerEvents='none'
                >
                  ⭐ {spot.rating}
                </Text>
                {spot.distanceInKm && (
                  <Text
                    className='text-xl text-white opacity-90 text-right'
                    pointerEvents='none'
                  >
                    {spot.distanceInKm.toFixed(1)} {copy.kmAway}
                  </Text>
                )}
              </View>
              {(spot.openingHours || spot.closesAt || spot.opensAt) && (
                <View
                  className='flex-row items-center justify-between'
                  pointerEvents='box-none'
                >
                  {spot.openingHours && (
                    <Text
                      className='text-lg text-white opacity-90 text-left'
                      pointerEvents='none'
                    >
                      {getOpeningHoursForToday(spot.openingHours)}
                    </Text>
                  )}
                  {countdown && (
                    <Text
                      className='text-lg text-white opacity-90 text-right'
                      pointerEvents='none'
                    >
                      {isCurrentlyOpen(spot.opensAt, spot.closesAt)
                        ? `${copy.closingIn} ${countdown}`
                        : `${copy.openingIn} ${countdown}`}
                    </Text>
                  )}
                </View>
              )}
              <View className='py-4 gap-3'>
                <GoogleMapsButton
                  suggestion={spot}
                  variant={ButtonVariant.white}
                />
                <ShareButton
                  suggestion={spot}
                  currentPhotoIndex={currentPhotoIndex}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
      <BottomModal
        visible={deleteModal.isVisible}
        onClose={deleteModal.handleClose}
        title={copy.deleteModal.title}
        description={copy.deleteModal.description}
        showCancelButton={true}
      >
        <Button
          label={copy.deleteModal.button}
          variant={ButtonVariant.black}
          size={ButtonSize.lg}
          fullWidth={true}
          onPress={handleConfirmDelete}
          loading={isRemoving}
        />
      </BottomModal>
    </Animated.View>
  );
}
