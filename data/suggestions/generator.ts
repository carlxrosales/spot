import { LocationCoordinates } from "@/data/location";
import { SpontyChoice } from "@/data/survey";
import { generateEmbedding, generateQuery } from "@/services/gemini";
import { getPhotoUris } from "@/services/places";
import { suggestPlaces } from "@/services/supabase";
import {
  DEFAULT_THRESHOLD,
  SHOW_NOW_THRESHOLD,
  SPONTY_THRESHOLD,
} from "@/services/supabase/constants";
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
  userLocation: LocationCoordinates
): Promise<Suggestion[]> => {
  const query = await generateQuery(answers);
  const embeddings = await generateEmbedding(query);

  let threshold = DEFAULT_THRESHOLD;
  if (answers.includes(SpontyChoice.value)) {
    threshold = SPONTY_THRESHOLD;
  } else if (answers.length <= 4) {
    threshold = SHOW_NOW_THRESHOLD;
  }

  const suggestions: Suggestion[] = await suggestPlaces({
    queryEmbedding: embeddings,
    threshold,
  });

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

  return suggestionsWithComputedFields.filter(
    (suggestion) =>
      suggestion.photoUris &&
      suggestion.photoUris.length > 0 &&
      suggestion.distanceInKm !== undefined
  );
};
