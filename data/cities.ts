import { supabase } from "@/services/supabase";

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Gets all unique city values from the places table in Supabase.
 *
 * @returns Promise resolving to an array of unique city names, sorted alphabetically
 * @throws Error if the query fails
 */
export const getCities = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from("places")
    .select("city")
    .not("city", "is", null);

  if (error) {
    throw new Error(`oof! somethin' went wrong`);
  }

  if (!data) {
    return [];
  }

  const uniqueCities = Array.from(
    new Set(data.map((row) => String(row.city)).filter(Boolean))
  ).sort();

  return uniqueCities;
};
