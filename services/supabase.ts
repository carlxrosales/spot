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

export interface RecommendPlacesOptions {
  placeIds: string[];
  filterOpenNow?: boolean;
  filterCity?: string | null;
  userLocation?: LocationCoordinates;
  maxDistanceKm?: number | null;
}

export interface RecommendPlacesResult {
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
  distance_in_km: number | null;
}

/**
 * Recommends places by their IDs from the database.
 * Queries the Supabase database using the recommend_places function.
 *
 * @param options - Configuration options including place IDs and optional filters
 * @returns Promise resolving to an array of places
 * @throws Error if the query fails
 */
export async function recommendPlaces(
  options: RecommendPlacesOptions
): Promise<Suggestion[]> {
  const {
    placeIds,
    filterOpenNow = false,
    filterCity = null,
    userLocation,
    maxDistanceKm,
  } = options;

  if (placeIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase.rpc("recommend_places", {
    place_ids: placeIds,
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
  return data.map((result: RecommendPlacesResult) => ({
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

/**
 * Generates a unique code for sharing.
 * @returns A random alphanumeric string of 8 characters
 */
function generateShareCode(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Creates a share record in the database.
 * @param placeIds - Array of place IDs to share
 * @returns Promise resolving to the share code
 * @throws Error if the creation fails
 */
export async function createShare(placeIds: string[]): Promise<string> {
  if (placeIds.length === 0) {
    throw new Error("yikes! can't share with no spots");
  }

  let code = generateShareCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const { data, error } = await supabase
      .from("shares")
      .insert({ code, place_ids: placeIds })
      .select("code")
      .single();

    if (!error) {
      return code;
    }

    if (error.code === "23505") {
      code = generateShareCode();
      attempts++;
    } else {
      throw new Error(`oof! somethin' went wrong`);
    }
  }

  throw new Error(`oof! couldn't create share after ${maxAttempts} tries fr`);
}

/**
 * Fetches place IDs from a share code.
 * @param code - The share code
 * @returns Promise resolving to an array of place IDs
 * @throws Error if the fetch fails or code is not found
 */
export async function getSharePlaceIds(code: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("shares")
    .select("place_ids")
    .eq("code", code)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("yikes! share not found");
    }
    throw new Error(`oof! somethin' went wrong`);
  }

  if (!data || !data.place_ids) {
    throw new Error("yikes! share not found");
  }

  return data.place_ids;
}
