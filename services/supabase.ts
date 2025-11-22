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
 * Default maximum number of places to return from similarity search.
 */
export const DEFAULT_LIMIT_COUNT = 80;

// ============================================================================
// FUNCTIONS
// ============================================================================

export interface SuggestPlacesOptions {
  queryEmbedding: number[];
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
  const { queryEmbedding, limitCount = DEFAULT_LIMIT_COUNT } = options;

  const { data, error } = await supabase.rpc("suggest_places", {
    query_embedding: queryEmbedding,
    limit_count: limitCount,
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
    name: result.name,
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
  }));
}
