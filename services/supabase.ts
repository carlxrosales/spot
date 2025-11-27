import { Suggestion } from "@/data/suggestions";
import { LocationCoordinates } from "@/data/types";
import { createClient } from "@supabase/supabase-js";

// ============================================================================
// CLIENT
// ============================================================================

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Supabase URL and Anon Key must be set in environment variables"
  );
}

/**
 * Supabase client for database operations.
 * Configured with the project URL and anon key from environment variables.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default maximum number of places to return from similarity search.
 */
export const DEFAULT_LIMIT_COUNT = 80;

/**
 * Truncates a name to 28 characters, adding "..." if it exceeds the limit.
 */
function truncateName(name: string): string {
  if (name.length > 28) {
    return name.substring(0, 28) + "...";
  }
  return name;
}

// ============================================================================
// FUNCTIONS
// ============================================================================

export interface SuggestPlacesOptions {
  queryEmbedding: number[];
  limitCount?: number;
  filterOpenNow?: boolean;
  filterCity?: string | null;
  userLocation?: LocationCoordinates;
  maxDistanceKm?: number | null;
}

export interface SuggestPlacesResult {
  id: string;
  name: string;
  address: string;
  rating: number;
  price_level: number | null;
  photos: string[];
  tags: string[];
  lat: number;
  lng: number;
  opening_hours: string[] | null;
  description: string | null;
  share_link: string | null;
  reviews_link: string | null;
  document: string | null;
  similarity: number;
  distance_in_km: number | null;
}

/**
 * Suggests places based on similarity search using embeddings.
 * Queries the Supabase database using the suggest_places function.
 *
 * @param options - Configuration options for the similarity search
 * @returns Promise resolving to an array of suggested places
 * @throws Error if the query fails
 */
export async function suggestPlaces(
  options: SuggestPlacesOptions
): Promise<Suggestion[]> {
  const {
    queryEmbedding,
    limitCount = DEFAULT_LIMIT_COUNT,
    filterOpenNow = false,
    filterCity = null,
    userLocation,
    maxDistanceKm,
  } = options;

  const { data, error } = await supabase.rpc("suggest_places", {
    query_embedding: queryEmbedding,
    limit_count: limitCount,
    filter_open_now: filterOpenNow,
    filter_city: filterCity,
    user_lat: userLocation?.lat ?? null,
    user_lng: userLocation?.lng ?? null,
    max_distance_km: maxDistanceKm ?? null,
  });

  if (error) {
    throw new Error(`oof! somethin' went wrong`);
  }

  if (!data) {
    return [];
  }

  // Transform database results to Suggestion interface
  return data.map((result: SuggestPlacesResult) => ({
    id: result.id,
    name: truncateName(result.name),
    address: result.address,
    rating: Number(result.rating),
    priceLevel: result.price_level ?? undefined,
    photos: result.photos,
    tags: result.tags,
    lat: Number(result.lat),
    lng: Number(result.lng),
    openingHours: result.opening_hours ?? undefined,
    description: result.description ?? undefined,
    shareLink: result.share_link ?? undefined,
    reviewsLink: result.reviews_link ?? undefined,
    distanceInKm: result.distance_in_km
      ? Number(result.distance_in_km)
      : undefined,
  }));
}

export interface GetPlacesByIdsOptions {
  placeIds: string[];
  userLocation?: LocationCoordinates;
}

export interface GetPlacesByIdsResult {
  id: string;
  name: string;
  address: string;
  rating: number;
  price_level: number | null;
  photos: string[];
  tags: string[];
  lat: number;
  lng: number;
  opening_hours: string[] | null;
  description: string | null;
  share_link: string | null;
  reviews_link: string | null;
  distance_in_km?: number | null;
}

/**
 * Gets places by their IDs from the database.
 * Queries the places table directly using the provided place IDs.
 *
 * @param options - Configuration options including place IDs and optional user location
 * @returns Promise resolving to an array of places
 * @throws Error if the query fails
 */
export async function getPlacesByIds(
  options: GetPlacesByIdsOptions
): Promise<Suggestion[]> {
  const { placeIds, userLocation } = options;

  if (placeIds.length === 0) {
    return [];
  }

  let query = supabase
    .from("places")
    .select(
      "id, name, address, rating, price_level, photos, tags, lat, lng, opening_hours, description, share_link, reviews_link"
    )
    .in("id", placeIds);

  const { data, error } = await query;

  if (error) {
    throw new Error(`oof! somethin' went wrong`);
  }

  if (!data) {
    return [];
  }

  // Transform database results to Suggestion interface
  const suggestions = data.map((result: GetPlacesByIdsResult) => {
    let distanceInKm: number | undefined = undefined;

    if (userLocation && result.lat && result.lng) {
      const R = 6371;
      const dLat = ((Number(result.lat) - userLocation.lat) * Math.PI) / 180;
      const dLng = ((Number(result.lng) - userLocation.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userLocation.lat * Math.PI) / 180) *
          Math.cos((Number(result.lat) * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distanceInKm = Math.round(R * c * 10) / 10;
    }

    const suggestion: Suggestion = {
      id: result.id,
      name: truncateName(result.name),
      address: result.address,
      rating: Number(result.rating),
      photos: result.photos,
      tags: result.tags,
      lat: Number(result.lat),
      lng: Number(result.lng),
      distanceInKm,
    };

    if (result.price_level !== null) {
      suggestion.priceLevel = result.price_level;
    }

    if (result.opening_hours) {
      suggestion.openingHours = result.opening_hours;
    }

    if (result.description) {
      suggestion.description = result.description;
    }

    if (result.share_link) {
      suggestion.shareLink = result.share_link;
    }

    if (result.reviews_link) {
      suggestion.reviewsLink = result.reviews_link;
    }

    return suggestion;
  });

  // Preserve the order of placeIds
  const orderedSuggestions = placeIds
    .map((id) => suggestions.find((s) => s.id === id))
    .filter((s): s is Suggestion => s !== undefined);

  return orderedSuggestions;
}
