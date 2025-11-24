/**
 * Validates if a string is a valid emoji.
 * Checks against common Unicode emoji ranges including emoticons, symbols, flags, and more.
 *
 * @param str - The string to validate
 * @returns True if the string is a valid emoji, false otherwise
 */
export function isValidEmoji(str: string): boolean {
  if (!str || str.trim().length === 0) return false;
  const emojiRegex =
    /^[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{200D}]/u;
  return emojiRegex.test(str);
}
