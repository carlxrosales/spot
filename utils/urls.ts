/**
 * Application URL utilities.
 * Defines base URLs and URL builders for deep linking.
 */

export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
export const DEEP_LINK_SCHEME = "spot";

if (!BASE_URL) {
  throw new Error("BASE_URL must be set in environment variables");
}

/**
 * Builds a recommendation URL with a share code.
 * @param code - Share code to include in the URL
 * @returns Full URL string for the recommendation page
 */
export function getRecommendationUrl(code: string): string {
  return `${DEEP_LINK_SCHEME}://recos/${code}`;
}

/**
 * Builds a share URL with a suggestion ID.
 * @param suggestionId - ID of the suggestion to share
 * @returns Full URL string for the share page
 */
export function getShareUrl(suggestionId: string): string {
  return `${BASE_URL}/share/${suggestionId}`;
}
