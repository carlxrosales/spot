// ============================================================================
// CONSTANTS
// ============================================================================

export const PHOTO_MAX_WIDTH_PX = 800;
export const PHOTO_MAX_HEIGHT_PX = 800;
export const PHOTO_MIN_HIGH_RES_PX = 800;

// ============================================================================
// TYPES
// ============================================================================

export interface GetPhotoUriOptions {
  photoName: string;
  maxWidthPx?: number;
  maxHeightPx?: number;
}

/**
 * Response from the Google Places API Place Photos (New) getMedia endpoint.
 *
 * @see https://developers.google.com/maps/documentation/places/web-service/place-photos
 */
export interface GetPhotoUriResponse {
  /**
   * The resource name of the photo media in the format:
   * places/{placeId}/photos/{photo_reference}/media
   */
  name: string;

  /**
   * A short-lived URI that can be used to render the photo.
   * This URI is temporary and should be used immediately.
   */
  photoUri: string;
}

// ============================================================================
// CLIENT
// ============================================================================

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

/**
 * Client for making requests to the Google Places API.
 *
 * @see https://developers.google.com/maps/documentation/places/web-service/overview
 */
export const places = {
  /**
   * Gets a photo URI from the Google Places API.
   *
   * @param options - Photo request options
   * @param options.photoName - Photo resource name in format: places/{placeId}/photos/{photo_reference}
   * @param options.maxWidthPx - Maximum width in pixels (optional)
   * @param options.maxHeightPx - Maximum height in pixels (optional)
   * @returns Promise resolving to the photo URI (short-lived URI for rendering)
   * @throws Error if the API key is missing or the request fails
   */
  getPhotoUri: async (options: GetPhotoUriOptions): Promise<string> => {
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error("Google Places API key is not configured");
    }

    const { photoName, maxWidthPx, maxHeightPx } = options;
    const mediaResourceName = `${photoName}/media`;

    const url = new URL(
      `https://places.googleapis.com/v1/${mediaResourceName}`
    );

    if (maxWidthPx !== undefined) {
      url.searchParams.append("maxWidthPx", maxWidthPx.toString());
    }

    if (maxHeightPx !== undefined) {
      url.searchParams.append("maxHeightPx", maxHeightPx.toString());
    }

    url.searchParams.append("skipHttpRedirect", "true");

    const fetchOptions: RequestInit = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      },
    };

    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
      throw new Error(
        `Google Places API photo request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as GetPhotoUriResponse;
    return data.photoUri;
  },
};
