import { Suggestion } from "@/data/suggestions";
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
 * Default threshold for similarity search (0-1, where 1 is most similar).
 * Only places with similarity scores above this threshold will be returned.
 */
export const DEFAULT_THRESHOLD = 0.6;
export const SHOW_NOW_THRESHOLD = 0.4;
export const SPONTY_THRESHOLD = 0.3;
export const LAZY_THRESHOLD = 0.2;

/**
 * Default maximum number of places to return from similarity search.
 */
export const DEFAULT_LIMIT_COUNT = 20;
export const DEFAULT_SPONTY_LIMIT_COUNT = 100;

/**
 * Default maximum number of photos to return from similarity search.
 */
export const DEFAULT_PHOTO_LIMIT_COUNT = 4;

// ============================================================================
// FUNCTIONS
// ============================================================================

export interface SuggestPlacesOptions {
  queryEmbedding: number[];
  threshold?: number;
  limitCount?: number;
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
    threshold = DEFAULT_THRESHOLD,
    limitCount = DEFAULT_LIMIT_COUNT,
  } = options;

  const { data, error } = await supabase.rpc("suggest_places", {
    query_embedding: queryEmbedding,
    threshold,
    limit_count: limitCount,
  });

  if (error) {
    throw new Error(`Oof! Somethin' went wrong`);
  }

  if (!data) {
    return [];
  }

  // Transform database results to Suggestion interface
  return data.map((result: SuggestPlacesResult) => ({
    id: result.id,
    name: result.name,
    address: result.address,
    rating: Number(result.rating),
    priceLevel: result.price_level ?? undefined,
    photos: Array.isArray(result.photos)
      ? result.photos.slice(0, DEFAULT_PHOTO_LIMIT_COUNT)
      : [],
    tags: result.tags,
    lat: Number(result.lat),
    lng: Number(result.lng),
    openingHours: result.opening_hours ?? undefined,
    description: result.description ?? undefined,
    shareLink: result.share_link ?? undefined,
    reviewsLink: result.reviews_link ?? undefined,
  }));
}
