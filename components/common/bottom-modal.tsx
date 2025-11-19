import { ReactNode } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface BottomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  showCancelButton?: boolean;
  dismissible?: boolean;
}

/**
 * Bottom modal component that slides up from the bottom of the screen.
 * Displays content in a modal with a title, optional description, and customizable actions.
 *
 * @param visible - Whether the modal is visible
 * @param onClose - Callback function called when modal is closed
 * @param title - Modal title text
 * @param description - Optional description text displayed below title
 * @param children - Child components to render in the modal content area
 * @param showCancelButton - Whether to show a cancel button at the bottom (default: false)
 * @param dismissible - Whether the modal can be dismissed by tapping outside (default: true)
 */
export function BottomModal({
  visible,
  onClose,
  title,
  description,
  children,
  showCancelButton = false,
  dismissible = true,
}: BottomModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={dismissible ? onClose : undefined}
    >
      <TouchableOpacity
        className='flex-1 bg-black/50 justify-end'
        activeOpacity={1}
        onPress={dismissible ? onClose : undefined}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          className='bg-neonGreen rounded-t-3xl p-6 pt-8 pb-12'
        >
          <Text className='text-2xl font-bold text-black mb-2 text-center'>
            {title}
          </Text>
          {description && (
            <Text className='text-lg text-black/70 mb-6 text-center'>
              {description}
            </Text>
          )}
          <View className='gap-3'>
            {children}
            {showCancelButton && (
              <TouchableOpacity
                onPress={onClose}
                className='bg-gray-200 rounded-[24px] px-6 pt-4 pb-6 items-center'
              >
                <Text className='text-lg font-semibold text-black'>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
