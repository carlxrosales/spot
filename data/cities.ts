import { supabase } from "@/services/supabase";

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Gets all unique city values from the places table in Supabase.
 * Uses a database function to efficiently retrieve unique cities without fetching all places.
 *
 * @returns Promise resolving to an array of unique city names, sorted alphabetically
 * @throws Error if the query fails
 */
export const getCities = async (): Promise<string[]> => {
  const { data, error } = await supabase.rpc("get_cities");

  if (error) {
    throw new Error(`oof! somethin' went wrong`);
  }

  if (!data) {
    return [];
  }

  return data;
};
