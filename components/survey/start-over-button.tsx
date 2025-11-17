import { IconButton } from "@/components/common/icon-button";

interface StartOverButtonProps {
  onPress: () => void;
  disabled: boolean;
}

export function StartOverButton({ onPress, disabled }: StartOverButtonProps) {
  return (
    <IconButton
      onPress={onPress}
      icon='reload'
      variant='white'
      size='md'
      disabled={disabled}
    />
  );
}
