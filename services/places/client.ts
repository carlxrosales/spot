const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

export interface PlacesApiRequestOptions {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  searchParams?: Record<string, string | number>;
  body?: unknown;
}

/**
 * Reusable client for making requests to the Google Places API.
 *
 * @see https://developers.google.com/maps/documentation/places/web-service/overview
 */
export const places = {
  /**
   * Sends a request to the Google Places API.
   *
   * @param options - Request configuration options
   * @returns Promise resolving to the JSON response data
   * @throws Error if the API key is missing or the request fails
   */
  sendRequest: async <T = unknown>(
    options: PlacesApiRequestOptions
  ): Promise<T> => {
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error("Google Places API key is not configured");
    }

    const { path, method = "GET", searchParams, body } = options;

    const url = new URL(`https://places.googleapis.com/v1/${path}`);

    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        url.searchParams.append(key, value.toString());
      });
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      },
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
      throw new Error(
        `Google Places API request failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  },
};
