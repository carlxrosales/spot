/**
 * Cleans the address string by removing:
 * - "philippines" (case-insensitive)
 * - Google Maps Plus Codes (e.g., "GXPJ+3QW,")
 * - Address parts containing numbers
 * Returns up to 4 comma-separated parts of the address.
 */
export function cleanAddress(address: string): string {
  if (!address) return address;

  let cleaned = address;

  // Remove Google Maps Plus Codes (pattern: alphanumeric+alphanumeric,)
  cleaned = cleaned.replace(/[A-Z0-9]+\+[A-Z0-9]+,\s*/gi, "");

  // Remove "philippines" (case-insensitive, with surrounding commas/spaces)
  cleaned = cleaned.replace(/,?\s*philippines\s*,?/gi, "");

  // Clean up any double commas or trailing/leading commas
  cleaned = cleaned
    .replace(/,\s*,/g, ",")
    .replace(/^,\s*|\s*,$/g, "")
    .trim();

  // Split by comma and take only the first 4 parts (do not remove numbers)
  const parts = cleaned
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part);
  const limitedParts = parts.slice(0, 4);

  return limitedParts.join(", ");
}
