import { useState } from "react";

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
