import { Suggestion } from "@/data/suggestions";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SAVED_SPOTS_KEY = "@spot:saved_spots";

/**
 * Storage utility for managing saved spots.
 * Provides functions to save, load, and remove spots from local storage.
 */

/**
 * Save a spot to local storage.
 * Adds the spot to the existing list of saved spots.
 *
 * @param spot - The suggestion to save
 */
export async function saveSpot(spot: Suggestion): Promise<void> {
  try {
    const savedSpots = await loadSpots();
    const existingIndex = savedSpots.findIndex((s) => s.id === spot.id);

    if (existingIndex === -1) {
      savedSpots.push(spot);
      await AsyncStorage.setItem(SAVED_SPOTS_KEY, JSON.stringify(savedSpots));
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Load all saved spots from local storage.
 *
 * @returns Array of saved suggestions
 */
export async function loadSpots(): Promise<Suggestion[]> {
  try {
    const data = await AsyncStorage.getItem(SAVED_SPOTS_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data) as Suggestion[];
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
    const savedSpots = await loadSpots();
    const filteredSpots = savedSpots.filter((s) => s.id !== spotId);
    await AsyncStorage.setItem(SAVED_SPOTS_KEY, JSON.stringify(filteredSpots));
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
    const savedSpots = await loadSpots();
    return savedSpots.some((s) => s.id === spotId);
  } catch (error) {
    return false;
  }
}
