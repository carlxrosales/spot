/**
 * Creates a function that ensures an async operation takes at least a minimum duration.
 * If the operation completes faster than the minimum delay, it waits for the remaining time.
 *
 * @param minimumDelay - Minimum duration in milliseconds that the operation should take
 * @returns A function that wraps an async operation to ensure minimum delay
 */
export function ensureMinimumDelay(minimumDelay: number) {
  return async <T>(operation: () => Promise<T>): Promise<T> => {
    const startTime = Date.now();

    const result = await operation();

    const elapsedTime = Date.now() - startTime;
    const remainingTime = minimumDelay - elapsedTime;

    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    return result;
  };
}
