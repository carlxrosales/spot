import { Animation } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";

export function useDelayedValue<T>(
  value: T,
  delay: number = Animation.duration.normal
): T {
  const [delayedValue, setDelayedValue] = useState<T>(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDelayedValue(value);
      timeoutRef.current = null;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return delayedValue;
}
