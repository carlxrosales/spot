import { TextButton } from "@/components/common/TextButton";

const copy = {
  feelingSponty: "I'm feeling sponty",
};

interface FeelingSpontyButtonProps {
  onPress: () => void;
  label?: string;
}

export function FeelingSpontyButton({
  onPress,
  label = copy.feelingSponty,
}: FeelingSpontyButtonProps) {
  return (
    <TextButton onPress={onPress} label={label} variant='black' size='md' />
  );
}
