import { SuggestionFeedback } from "./types";

/**
 * Default maximum distance in kilometers for filtering place suggestions.
 */
export const DEFAULT_MAX_DISTANCE_IN_KM: number = 20;

/**
 * Available distance filter options in kilometers.
 * Used for distance-based filtering of place suggestions.
 * Includes 0 for minimum distance filtering.
 */
export const DISTANCE_OPTIONS = [
  0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250,
] as const;

/**
 * Array of feedback messages displayed when a user skips a suggestion.
 * Messages are randomly selected and tracked to avoid repetition.
 */
export const suggestionSkipFeedbacks: SuggestionFeedback[] = [
  { text: "nah", emoji: "😒" },
  { text: "mid", emoji: "😐" },
  { text: "pass", emoji: "👋" },
  { text: "hard pass", emoji: "🚫" },
  { text: "nope", emoji: "🙅" },
  { text: "skip", emoji: "⏭️" },
  { text: "meh", emoji: "🤷" },
  { text: "not for me", emoji: "👎" },
  { text: "next", emoji: "➡️" },
  { text: "bye", emoji: "👋" },
  { text: "no thanks", emoji: "🙅‍♂️" },
  { text: "not today", emoji: "📅" },
  { text: "maybe later", emoji: "⏰" },
  { text: "not feelin' it", emoji: "😕" },
  { text: "nah fam", emoji: "🙄" },
  { text: "not my vibe", emoji: "🎵" },
  { text: "skip it", emoji: "⏩" },
  { text: "naw", emoji: "👀" },
  { text: "not it", emoji: "👎" },
  { text: "pass for now", emoji: "⏸️" },
  { text: "not my thing", emoji: "🎯" },
  { text: "sus", emoji: "🤔" },
  { text: "cringe", emoji: "😬" },
  { text: "oof", emoji: "😮" },
  { text: "yikes", emoji: "😳" },
  { text: "bruh", emoji: "😑" },
  { text: "L", emoji: "💀" },
  { text: "rip", emoji: "⚰️" },
  { text: "dead", emoji: "☠️" },
  { text: "cap", emoji: "🎩" },
  { text: "nahhh", emoji: "😤" },
  { text: "nvm", emoji: "🤐" },
  { text: "ratio", emoji: "📉" },
  { text: "fr?", emoji: "🤨" },
  { text: "negats", emoji: "🙅‍♀️" },
];

/**
 * Array of feedback messages displayed when a user selects a suggestion.
 * Messages are randomly selected and tracked to avoid repetition.
 */
export const suggestionSelectFeedbacks: SuggestionFeedback[] = [
  { text: "bet", emoji: "🤝" },
  { text: "fire", emoji: "🔥" },
  { text: "let's go", emoji: "🚀" },
  { text: "yessir", emoji: "💯" },
  { text: "this one", emoji: "👉" },
  { text: "nice", emoji: "👍" },
  { text: "love it", emoji: "❤️" },
  { text: "perfect", emoji: "✨" },
  { text: "solid", emoji: "💪" },
  { text: "mood", emoji: "😎" },
  { text: "vibes", emoji: "🎵" },
  { text: "that's it", emoji: "🎯" },
  { text: "yes please", emoji: "🙏" },
  { text: "down", emoji: "👇" },
  { text: "let's do it", emoji: "💫" },
  { text: "sounds good", emoji: "👂" },
  { text: "i'm in", emoji: "✋" },
  { text: "absolutely", emoji: "🙌" },
  { text: "for sure", emoji: "🤞" },
  { text: "this hits", emoji: "🎯" },
  { text: "goat", emoji: "🐐" },
  { text: "slaps", emoji: "👏" },
  { text: "banger", emoji: "🎸" },
  { text: "no cap", emoji: "🧢" },
  { text: "fr", emoji: "💯" },
  { text: "say less", emoji: "🤐" },
  { text: "period", emoji: "🔴" },
  { text: "that's the one", emoji: "👆" },
  { text: "this is it", emoji: "⭐" },
  { text: "perfect spot", emoji: "📍" },
  { text: "let's roll", emoji: "🎲" },
  { text: "i'm there", emoji: "📍" },
  { text: "count me in", emoji: "✌️" },
];
