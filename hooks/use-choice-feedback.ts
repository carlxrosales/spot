import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";

export function useChoiceFeedback() {
  const choiceSoundRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    const loadSounds = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
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
