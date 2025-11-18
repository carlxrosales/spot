import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";

type HapticType = "light" | "medium" | "heavy" | "success" | "warning";

export function useSwipeFeedback() {
  const skipSoundRef = useRef<AudioPlayer | null>(null);
  const selectSoundRef = useRef<AudioPlayer | null>(null);
  const thresholdSoundRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    const loadSounds = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
        });

        try {
          const skipSound = createAudioPlayer(
            require("@/assets/sounds/swipe/skip.mp3"),
            {}
          );
          skipSound.volume = 0.3;
          skipSoundRef.current = skipSound;
        } catch {}

        try {
          const selectSound = createAudioPlayer(
            require("@/assets/sounds/swipe/select.mp3"),
            {}
          );
          selectSound.volume = 0.2;
          selectSoundRef.current = selectSound;
        } catch {}

        try {
          const thresholdSound = createAudioPlayer(
            require("@/assets/sounds/swipe/threshold.mp3"),
            {}
          );
          thresholdSound.volume = 0.3;
          thresholdSoundRef.current = thresholdSound;
        } catch {}
      } catch {}
    };

    loadSounds();

    return () => {
      skipSoundRef.current?.remove();
      selectSoundRef.current?.remove();
      thresholdSoundRef.current?.remove();
    };
  }, []);

  const triggerHaptic = (type: HapticType) => {
    try {
      switch (type) {
        case "light":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case "medium":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case "heavy":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case "success":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case "warning":
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
      }
    } catch {}
  };

  const playSound = async (soundRef: React.RefObject<AudioPlayer | null>) => {
    try {
      if (soundRef.current) {
        await soundRef.current.seekTo(0);
        soundRef.current.play();
      }
    } catch {}
  };

  const onSwipeStart = () => {
    triggerHaptic("light");
  };

  const onSwipeThreshold = () => {
    triggerHaptic("medium");
    playSound(thresholdSoundRef);
  };

  const onSwipeSkip = () => {
    triggerHaptic("warning");
    playSound(skipSoundRef);
  };

  const onSwipeSelect = () => {
    triggerHaptic("success");
    playSound(selectSoundRef);
  };

  return {
    onSwipeStart,
    onSwipeThreshold,
    onSwipeSkip,
    onSwipeSelect,
  };
}
