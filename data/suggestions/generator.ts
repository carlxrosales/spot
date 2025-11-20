import { LocationCoordinates } from "@/data/location";
import { LazyChoice, SpontyChoice } from "@/data/survey";
import { generateEmbedding, generateQuery } from "@/services/gemini";
import { getPhotoUris } from "@/services/places";
import { places } from "@/services/places/client";
import {
  PHOTO_MAX_HEIGHT_PX,
  PHOTO_MAX_WIDTH_PX,
} from "@/services/places/constants";
import { suggestPlaces } from "@/services/supabase";
import {
  DEFAULT_THRESHOLD,
  LAZY_THRESHOLD,
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
 * Computes additional fields like distance and opening/closing times.
 * Photo URIs are loaded separately in the context.
 *
 * @param answers - Array of user answers from the survey
 * @param userLocation - User's current location coordinates
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
  } else if (answers.includes(LazyChoice.value)) {
    threshold = LAZY_THRESHOLD;
  }

  const suggestions: Suggestion[] = await suggestPlaces({
    queryEmbedding: embeddings,
    threshold,
  });

  const suggestionsWithComputedFields = suggestions.map(
    (suggestion: Suggestion) => {
      const distanceInKm = getDistanceInKm(
        userLocation.lat,
        userLocation.lng,
        suggestion.lat,
        suggestion.lng
      );

      if (suggestion.openingHours) {
        const opensAt = getOpeningTimeForToday(suggestion.openingHours);
        const closesAt = getClosingTimeForToday(suggestion.openingHours);
        return {
          ...suggestion,
          distanceInKm,
          opensAt,
          closesAt,
        };
      }

      return {
        ...suggestion,
        distanceInKm,
      };
    }
  );

  const filteredSuggestions = suggestionsWithComputedFields.filter(
    (suggestion) => suggestion.distanceInKm !== undefined
  );

  return filteredSuggestions;
};

/**
 * Loads the first photo URI for a suggestion.
 *
 * @param suggestion - The suggestion to load the first photo for
 * @returns Promise resolving to the first photo URI, or undefined if no photos
 */
export const loadFirstPhoto = async (
  suggestion: Suggestion
): Promise<string | undefined> => {
  if (suggestion.photos.length === 0) {
    return undefined;
  }

  const firstPhotoUri = await places.getPhotoUri({
    photoName: suggestion.photos[0],
    maxWidthPx: PHOTO_MAX_WIDTH_PX,
    maxHeightPx: PHOTO_MAX_HEIGHT_PX,
  });

  return firstPhotoUri;
};

/**
 * Loads all remaining photo URIs for a suggestion.
 * This is used when the user navigates the image carousel.
 *
 * @param suggestion - The suggestion to load additional photos for
 * @param loadedPhotoCount - Number of photos already loaded
 * @returns Promise resolving to array of remaining photo URIs
 */
export const loadNextPhotoForSuggestion = async (
  suggestion: Suggestion,
  loadedPhotoCount: number
): Promise<string[]> => {
  if (suggestion.photos.length === 0) {
    return [];
  }

  if (loadedPhotoCount >= suggestion.photos.length) {
    return [];
  }

  const remainingPhotoNames = suggestion.photos.slice(loadedPhotoCount);
  const remainingPhotoUris = await getPhotoUris(remainingPhotoNames);

  return remainingPhotoUris;
};

/**
 * Loads the first photo URI for the current suggestion and preloads the first photo for the next one.
 * This is used for lazy loading photos as the user navigates through suggestions.
 *
 * @param suggestions - Array of suggestions
 * @param currentIndex - Index of the current suggestion
 * @param photoUrisMap - Map of suggestion IDs to their photo URIs
 * @returns Promise resolving to a map of loaded photo URIs (suggestion ID -> photo URI)
 */
export const loadPhotosForCurrentAndNextSuggestions = async (
  suggestions: Suggestion[],
  currentIndex: number,
  photoUrisMap: Map<string, string[]>
): Promise<Map<string, string[]>> => {
  const updatedMap = new Map(photoUrisMap);
  const currentSuggestion = suggestions[currentIndex];
  const nextSuggestion = suggestions[currentIndex + 1];

  const loadPromises: Promise<void>[] = [];

  if (currentSuggestion && currentSuggestion.photos.length > 0) {
    const currentPhotoUris = updatedMap.get(currentSuggestion.id);
    if (!currentPhotoUris || currentPhotoUris.length === 0) {
      loadPromises.push(
        loadFirstPhoto(currentSuggestion).then((photoUri) => {
          if (photoUri) {
            updatedMap.set(currentSuggestion.id, [photoUri]);
          }
        })
      );
    }
  }

  if (nextSuggestion && nextSuggestion.photos.length > 0) {
    const nextPhotoUris = updatedMap.get(nextSuggestion.id);
    if (!nextPhotoUris || nextPhotoUris.length === 0) {
      loadPromises.push(
        loadFirstPhoto(nextSuggestion).then((photoUri) => {
          if (photoUri) {
            updatedMap.set(nextSuggestion.id, [photoUri]);
          }
        })
      );
    }
  }

  await Promise.all(loadPromises);
  return updatedMap;
};
