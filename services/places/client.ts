import { PHOTO_MAX_HEIGHT_PX, PHOTO_MAX_WIDTH_PX } from "./constants";

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

/**
 * Fetches photo URIs from Google Places API for given photo resource names.
 *
 * @param photoNames - Array of photo resource names in format: places/{placeId}/photos/{photo_reference}
 * @returns Promise resolving to array of photo URIs (short-lived URIs for rendering)
 *
 * @see https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places.photos/getMedia
 */
export const getPhotoUris = async (photoNames: string[]): Promise<string[]> => {
  if (!GOOGLE_PLACES_API_KEY || photoNames.length === 0) {
    return [];
  }

  try {
    const photoUriPromises = photoNames.map(async (photoName) => {
      const mediaResourceName = `${photoName}/media`;

      const url = new URL(
        `https://places.googleapis.com/v1/${mediaResourceName}`
      );
      url.searchParams.append("maxWidthPx", PHOTO_MAX_WIDTH_PX.toString());
      url.searchParams.append("maxHeightPx", PHOTO_MAX_HEIGHT_PX.toString());

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch photo URI: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.photoUri as string;
    });

    const photoUris = await Promise.all(photoUriPromises);
    return photoUris.filter((uri) => uri != null);
  } catch {
    return [];
  }
};
