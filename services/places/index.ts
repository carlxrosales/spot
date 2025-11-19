import { places } from "./client";
import { PHOTO_MAX_HEIGHT_PX, PHOTO_MAX_WIDTH_PX } from "./constants";

/**
 * Fetches photo URIs from Google Places API for given photo resource names.
 *
 * @param photoNames - Array of photo resource names in format: places/{placeId}/photos/{photo_reference}
 * @returns Promise resolving to array of photo URIs (short-lived URIs for rendering)
 *
 * @see https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places.photos/getMedia
 */
export const getPhotoUris = async (photoNames: string[]): Promise<string[]> => {
  if (photoNames.length === 0) {
    return [];
  }

  try {
    const photoUriPromises = photoNames.map(async (photoName) => {
      const mediaResourceName = `${photoName}/media`;

      const data = await places.sendRequest<{ photoUri: string }>({
        path: mediaResourceName,
        searchParams: {
          maxWidthPx: PHOTO_MAX_WIDTH_PX,
          maxHeightPx: PHOTO_MAX_HEIGHT_PX,
        },
      });

      return data.photoUri;
    });

    const photoUris = await Promise.all(photoUriPromises);
    return photoUris.filter((uri) => uri != null);
  } catch {
    return [];
  }
};
