import { useState } from "react";

/**
 * Custom hook for managing modal visibility state.
 * Provides simple open/close functionality for modal components.
 *
 * @param initialState - Initial visibility state (default: false)
 * @returns Object containing `isVisible` state and `handleOpen`/`handleClose` functions
 */
export function useModal(initialState: boolean = false) {
  const [isVisible, setIsVisible] = useState<boolean>(initialState);

  const handleOpen = () => {
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return {
    isVisible,
    handleOpen,
    handleClose,
  };
}
