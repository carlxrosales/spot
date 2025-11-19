import { CancelButton } from "@/components/common/cancel-button";
import { Logo } from "@/components/common/logo";
import { SafeView } from "@/components/common/safe-view";
import { TextButton } from "@/components/common/text-button";
import { ButtonVariant } from "@/constants/buttons";
import { Colors } from "@/constants/theme";
import { Suggestion } from "@/data/suggestions";
import React, { forwardRef, useImperativeHandle } from "react";
import { Modal, View } from "react-native";
import ViewShot from "react-native-view-shot";
import { ShareCard } from "./share-card";

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  suggestion: Suggestion | null;
  onShareImage: () => void;
  onShareLink: () => void;
}

export interface ShareModalRef {
  capture: () => Promise<string | null>;
}

export const ShareModal = forwardRef<ShareModalRef, ShareModalProps>(
  ({ visible, onClose, suggestion, onShareImage, onShareLink }, ref) => {
    const viewShotRef = React.useRef<ViewShot>(null);

    useImperativeHandle(ref, () => ({
      capture: async () => {
        if (!viewShotRef.current || !viewShotRef.current.capture) return null;
        try {
          const uri = await viewShotRef.current.capture();
          return uri || null;
        } catch {
          return null;
        }
      },
    }));

    if (!suggestion) return null;

    return (
      <Modal
        visible={visible}
        transparent
        animationType='fade'
        onRequestClose={onClose}
      >
        <SafeView className='flex-1 bg-neonGreen justify-center items-center'>
          <View className='flex-1 w-full justify-center items-center'>
            <ViewShot
              ref={viewShotRef}
              options={{ format: "png", quality: 1 }}
              style={{
                backgroundColor: Colors.neonGreen,
                width: "100%",
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View className='w-full flex-1 justify-center items-center'>
                <View className='pt-4 items-center justify-center'>
                  <Logo />
                </View>
                <View className='flex-1 w-full'>
                  <ShareCard suggestion={suggestion} />
                </View>
              </View>
            </ViewShot>
            <View className='w-full px-6 pb-8 gap-3'>
              <TextButton
                label='Share Image'
                onPress={onShareImage}
                variant={ButtonVariant.white}
                fullWidth
              />
              <TextButton
                label='Share Link'
                onPress={onShareLink}
                variant={ButtonVariant.black}
                fullWidth
              />
              <CancelButton onPress={onClose} />
            </View>
          </View>
        </SafeView>
      </Modal>
    );
  }
);

ShareModal.displayName = "ShareModal";
