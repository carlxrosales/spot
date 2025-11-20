import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";

/**
 * Custom hook that provides haptic and audio feedback for survey choice interactions.
 * Loads and manages audio playback for choice selection with haptic feedback.
 *
 * @returns Object containing `onChoicePress` callback function
 */
export function useChoiceFeedback() {
  const choiceSoundRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    const loadSounds = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
        });

        try {
          const choiceSound = createAudioPlayer(
            require("@/assets/sounds/survey/choice.mp3"),
            {}
          );
          choiceSound.volume = 0.1;
          choiceSoundRef.current = choiceSound;
        } catch {}
      } catch {}
    };

    loadSounds();

    return () => {
      choiceSoundRef.current?.remove();
    };
  }, []);

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  };

  const playSound = async () => {
    try {
      if (choiceSoundRef.current) {
        await choiceSoundRef.current.seekTo(0);
        choiceSoundRef.current.play();
        await choiceSoundRef.current.seekTo(0);
      }
    } catch {}
  };

  const onChoicePress = () => {
    triggerHaptic();
    playSound();
  };

  return {
    onChoicePress,
  };
}
