import { Animation } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";

/**
 * Custom hook that delays updating a value by a specified duration.
 * Useful for animations and transitions where you want to delay state updates.
 *
 * @param value - The value to delay
 * @param delay - Delay duration in milliseconds (default: Animation.duration.normal)
 * @returns The delayed value that updates after the specified delay
 */
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
