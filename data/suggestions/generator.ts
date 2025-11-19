import { LocationCoordinates } from "@/data/location";
import { generateEmbedding, generateQuery } from "@/services/gemini";
import { getPhotoUris } from "@/services/places";
import { DEFAULT_MAX_DISTANCE_IN_KM } from "./constants";
import { Suggestion } from "./types";
import {
  getClosingTimeForToday,
  getDistanceInKm,
  getOpeningTimeForToday,
} from "./utils";

/**
 * Generates place suggestions based on user survey answers and location.
 * Computes additional fields like distance, opening/closing times, and photo URIs.
 *
 * @param answers - Array of user answers from the survey
 * @param userLocation - User's current location coordinates
 * @param maxDistanceInKm - Maximum distance in kilometers for filtering (default: DEFAULT_MAX_DISTANCE_IN_KM)
 * @returns Promise resolving to an array of Suggestion objects with computed fields
 */
export const generateSuggestions = async (
  answers: string[],
  userLocation: LocationCoordinates,
  maxDistanceInKm: number = DEFAULT_MAX_DISTANCE_IN_KM
): Promise<Suggestion[]> => {
  const query = await generateQuery(answers);
  const embeddings = await generateEmbedding(query);
  // Query supabase using similarity search here
  const suggestions: Suggestion[] = [];

  const suggestionsWithComputedFields = await Promise.all(
    suggestions.map(async (suggestion: Suggestion) => {
      const distanceInKm = getDistanceInKm(
        userLocation.lat,
        userLocation.lng,
        suggestion.lat,
        suggestion.lng
      );

      const photoUris =
        suggestion.photos.length > 0
          ? await getPhotoUris(suggestion.photos)
          : undefined;

      if (suggestion.openingHours) {
        const opensAt = getOpeningTimeForToday(suggestion.openingHours);
        const closesAt = getClosingTimeForToday(suggestion.openingHours);
        return {
          ...suggestion,
          distanceInKm,
          opensAt,
          closesAt,
          photoUris,
        };
      }

      return {
        ...suggestion,
        distanceInKm,
        photoUris,
      };
    })
  );

  return suggestionsWithComputedFields;
};
