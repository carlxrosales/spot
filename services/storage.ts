import AsyncStorage from "@react-native-async-storage/async-storage";

const SAVED_SPOTS_KEY = "@spot:saved_spots";

/**
 * Storage utility for managing saved spots.
 * Provides functions to save, load, and remove spots from local storage.
 * Only stores place IDs to ensure fresh data is fetched from Supabase.
 */

/**
 * Save a spot to local storage.
 * Adds the place ID to the existing list of saved spot IDs.
 *
 * @param placeId - The place ID to save
 */
export async function saveSpot(placeId: string): Promise<void> {
  try {
    const savedSpotIds = await loadSpots();
    if (!savedSpotIds.includes(placeId)) {
      savedSpotIds.push(placeId);
      await AsyncStorage.setItem(SAVED_SPOTS_KEY, JSON.stringify(savedSpotIds));
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Load all saved spot IDs from local storage.
 * Handles migration from old format (full Suggestion objects) to new format (place IDs only).
 *
 * @returns Array of saved place IDs
 */
export async function loadSpots(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(SAVED_SPOTS_KEY);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data);

    // Handle migration: if old format (array of objects), extract IDs
    if (Array.isArray(parsed) && parsed.length > 0) {
      if (
        typeof parsed[0] === "object" &&
        parsed[0] !== null &&
        "id" in parsed[0]
      ) {
        // Old format: array of Suggestion objects
        const placeIds = parsed.map((spot: { id: string }) => spot.id);
        // Save in new format
        await AsyncStorage.setItem(SAVED_SPOTS_KEY, JSON.stringify(placeIds));
        return placeIds.reverse();
      }
      // New format: array of strings (place IDs)
      if (typeof parsed[0] === "string") {
        return parsed.reverse();
      }
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Remove a spot from local storage.
 *
 * @param spotId - The ID of the spot to remove
 */
export async function removeSpot(spotId: string): Promise<void> {
  try {
    const savedSpotIds = await loadSpots();
    const filteredSpotIds = savedSpotIds.filter((id) => id !== spotId);
    await AsyncStorage.setItem(
      SAVED_SPOTS_KEY,
      JSON.stringify(filteredSpotIds)
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Check if a spot is saved.
 *
 * @param spotId - The ID of the spot to check
 * @returns True if the spot is saved, false otherwise
 */
export async function isSpotSaved(spotId: string): Promise<boolean> {
  try {
    const savedSpotIds = await loadSpots();
    return savedSpotIds.includes(spotId);
  } catch (error) {
    return false;
  }
}
