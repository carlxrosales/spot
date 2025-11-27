import { Question, SpontyChoice } from "@/data/survey";
import { LocationCoordinates } from "@/data/types";
import { generateEmbedding, generateQuery } from "@/services/gemini";
import {
  PHOTO_MAX_HEIGHT_PX,
  PHOTO_MAX_WIDTH_PX,
  places,
} from "@/services/places";
import { suggestPlaces } from "@/services/supabase";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Represents a place suggestion from Google Places API.
 *
 * @see https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places
 */
export interface Suggestion {
  /** Unique identifier from Google Places API (Place.id) */
  id: string;

  /** Display name of the place (Place.displayName) */
  name: string;

  /** Formatted address string (Place.formattedAddress) */
  address: string;

  /** Rating value from 0-5 (Place.rating) */
  rating: number;

  /** Price level indicator: 0-4, where 0 is free and 4 is most expensive (Place.priceLevel) */
  priceLevel?: number;

  /** Array of photo resource names/URLs (Place.photos.map(photo => photo.name)) */
  photos: string[];

  /** Array of place type tags/categories (Place.types) */
  tags: string[];

  /** Latitude coordinate (Place.geometry.location.lat) */
  lat: number;

  /** Longitude coordinate (Place.geometry.location.lng) */
  lng: number;

  /**
   * Array of weekday opening hours descriptions (Place.currentOpeningHours.weekdayDescriptions)
   * Format: ["Monday: 9:00 AM - 5:00 PM", "Tuesday: 9:00 AM - 5:00 PM", ...]
   * Note: Should be refetched every 7 days at midnight to ensure accuracy
   */
  openingHours?: string[];

  /**
   * AI-generated description combining Place.generativeSummary and Place.reviewSummary
   * Provides a human-readable summary of the place
   */
  description?: string;

  /** Google Maps share URI (Place.googleMapsLinks.shareUri) */
  shareLink?: string;

  /** Google Maps review URI (Place.googleMapsLinks.reviewUri) */
  reviewsLink?: string;

  // Client-side fields

  /** Distance from user's location in kilometers, calculated using Haversine formula */
  distanceInKm?: number;

  /** Opening time for today in "HH:MM AM/PM" format, extracted from openingHours */
  opensAt?: string;

  /** Closing time for today in "HH:MM AM/PM" format, extracted from openingHours */
  closesAt?: string;

  /**
   * Array of photo URIs fetched from Google Places API photo media endpoint
   * These are short-lived URIs that can be used to render photos
   * @see https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places.photos/getMedia
   */
  photoUris?: string[];
}

/**
 * Represents the feedback text displayed when the user selects or skips a suggestion.
 * Used to provide visual and textual feedback during the swipe interaction.
 */
export interface SuggestionFeedback {
  /** The feedback message text */
  text: string;

  /** The emoji associated with the feedback */
  emoji: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default minimum distance in kilometers for filtering place suggestions.
 */
export const DEFAULT_MIN_DISTANCE_IN_KM: number = 0;

/**
 * Default maximum distance in kilometers for filtering place suggestions.
 */
export const DEFAULT_MAX_DISTANCE_IN_KM: number = 25;

/**
 * Available distance filter options in kilometers.
 * Used for distance-based filtering of place suggestions.
 */
export const DISTANCE_OPTIONS = [
  5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250,
] as const;
export const LAST_DISTANCE_OPTION =
  DISTANCE_OPTIONS[DISTANCE_OPTIONS.length - 1];

/**
 * Collection of complete question-answer flows for random selection when Sponty is the only answer.
 * Each entry contains 6-7 question-answer pairs that form a natural flow.
 */
export const SPONTY_QA_FLOWS: Array<
  Array<{ question: string; answer: string }>
> = [
  // Flow 1: Casual Asian lunch
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What cuisine you craving?", answer: "asian" },
    { question: "What meal?", answer: "lunch" },
    { question: "What's the vibe?", answer: "casual" },
    { question: "How many people?", answer: "solo" },
    { question: "What's the price range?", answer: "affordable" },
  ],
  // Flow 2: Cozy coffee shop for work
  [
    { question: "What's your vibe rn?", answer: "work" },
    { question: "What type of place?", answer: "cafe" },
    { question: "What drink?", answer: "coffee" },
    { question: "What's the vibe?", answer: "cozy" },
    { question: "What's the setting?", answer: "quiet" },
    { question: "How many people?", answer: "solo" },
  ],
  // Flow 3: Date night Italian dinner
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What cuisine you craving?", answer: "italian" },
    { question: "What meal?", answer: "dinner" },
    { question: "What's the occasion?", answer: "date-night" },
    { question: "What's the vibe?", answer: "romantic" },
    { question: "What's the price range?", answer: "upscale" },
    { question: "What's the setting?", answer: "intimate" },
  ],
  // Flow 4: Brunch spot
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What meal?", answer: "brunch" },
    { question: "What cuisine you craving?", answer: "american" },
    { question: "What's the vibe?", answer: "trendy" },
    { question: "How many people?", answer: "group" },
    { question: "What's the price range?", answer: "casual" },
  ],
  // Flow 5: Solo sushi dinner
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What cuisine you craving?", answer: "japanese" },
    { question: "What you want?", answer: "sushi" },
    { question: "What meal?", answer: "dinner" },
    { question: "How many people?", answer: "solo" },
    { question: "What's the price range?", answer: "upscale" },
  ],
  // Flow 6: Study session at cafe
  [
    { question: "What's your vibe rn?", answer: "work" },
    { question: "What's the occasion?", answer: "study" },
    { question: "What type of place?", answer: "cafe" },
    { question: "What drink?", answer: "coffee" },
    { question: "What's the vibe?", answer: "quiet" },
    { question: "What's the setting?", answer: "indoor" },
  ],
  // Flow 7: Family-friendly Mexican
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What cuisine you craving?", answer: "mexican" },
    { question: "What you want?", answer: "tacos" },
    { question: "What's the occasion?", answer: "family-friendly" },
    { question: "How many people?", answer: "group" },
    { question: "What's the price range?", answer: "affordable" },
  ],
  // Flow 8: Business lunch
  [
    { question: "What's your vibe rn?", answer: "work" },
    { question: "What's the occasion?", answer: "business" },
    { question: "What meal?", answer: "lunch" },
    { question: "What cuisine you craving?", answer: "american" },
    { question: "What's the vibe?", answer: "quiet" },
    { question: "What's the price range?", answer: "upscale" },
  ],
  // Flow 9: Ramen craving
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What cuisine you craving?", answer: "japanese" },
    { question: "What you want?", answer: "ramen" },
    { question: "What meal?", answer: "dinner" },
    { question: "What's the vibe?", answer: "cozy" },
    { question: "What's the price range?", answer: "affordable" },
  ],
  // Flow 10: Korean BBQ group
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What cuisine you craving?", answer: "korean" },
    { question: "What meal?", answer: "dinner" },
    { question: "How many people?", answer: "group" },
    { question: "What's the vibe?", answer: "loud" },
    { question: "What's the price range?", answer: "casual" },
  ],
  // Flow 11: Morning coffee run
  [
    { question: "What's your vibe rn?", answer: "drink" },
    { question: "What drink?", answer: "coffee" },
    { question: "What type of place?", answer: "cafe" },
    { question: "What meal?", answer: "breakfast" },
    { question: "How many people?", answer: "solo" },
    { question: "What's the vibe?", answer: "quick" },
  ],
  // Flow 12: Thai dinner date
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What cuisine you craving?", answer: "thai" },
    { question: "What meal?", answer: "dinner" },
    { question: "What's the occasion?", answer: "date-night" },
    { question: "What's the vibe?", answer: "romantic" },
    { question: "What's the price range?", answer: "upscale" },
  ],
  // Flow 13: Pizza night
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What you want?", answer: "pizza" },
    { question: "What meal?", answer: "dinner" },
    { question: "What cuisine you craving?", answer: "italian" },
    { question: "How many people?", answer: "group" },
    { question: "What's the price range?", answer: "casual" },
  ],
  // Flow 14: Tea time study
  [
    { question: "What's your vibe rn?", answer: "work" },
    { question: "What's the occasion?", answer: "study" },
    { question: "What drink?", answer: "tea" },
    { question: "What type of place?", answer: "cafe" },
    { question: "What's the vibe?", answer: "quiet" },
    { question: "How many people?", answer: "solo" },
  ],
  // Flow 15: Seafood dinner
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What you want?", answer: "seafood" },
    { question: "What meal?", answer: "dinner" },
    { question: "What cuisine you craving?", answer: "mediterranean" },
    { question: "What's the vibe?", answer: "upscale" },
    { question: "What's the price range?", answer: "fine-dining" },
  ],
  // Flow 16: Burger joint
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What you want?", answer: "burger" },
    { question: "What meal?", answer: "lunch" },
    { question: "What cuisine you craving?", answer: "american" },
    { question: "What's the price range?", answer: "fast-casual" },
    { question: "How many people?", answer: "solo" },
  ],
  // Flow 17: Vietnamese noodles
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What cuisine you craving?", answer: "vietnamese" },
    { question: "What you want?", answer: "noodles" },
    { question: "What meal?", answer: "lunch" },
    { question: "What's the vibe?", answer: "casual" },
    { question: "What's the price range?", answer: "affordable" },
  ],
  // Flow 18: Indian dinner
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What cuisine you craving?", answer: "indian" },
    { question: "What meal?", answer: "dinner" },
    { question: "How many people?", answer: "group" },
    { question: "What's the vibe?", answer: "spicy" },
    { question: "What's the price range?", answer: "casual" },
  ],
  // Flow 19: French bistro
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What cuisine you craving?", answer: "french" },
    { question: "What meal?", answer: "dinner" },
    { question: "What's the vibe?", answer: "romantic" },
    { question: "What's the price range?", answer: "upscale" },
    { question: "What's the setting?", answer: "intimate" },
  ],
  // Flow 20: Bakery breakfast
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What type of place?", answer: "bakery" },
    { question: "What meal?", answer: "breakfast" },
    { question: "What drink?", answer: "coffee" },
    { question: "How many people?", answer: "solo" },
    { question: "What's the vibe?", answer: "cozy" },
  ],
  // Flow 21: Meeting spot
  [
    { question: "What's your vibe rn?", answer: "work" },
    { question: "What's the occasion?", answer: "meeting" },
    { question: "What type of place?", answer: "cafe" },
    { question: "What's the vibe?", answer: "quiet" },
    { question: "What's the setting?", answer: "spacious" },
    { question: "How many people?", answer: "group" },
  ],
  // Flow 22: Dessert spot
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What meal?", answer: "dessert" },
    { question: "What type of place?", answer: "bakery" },
    { question: "What's the vibe?", answer: "sweet" },
    { question: "How many people?", answer: "group" },
    { question: "What's the price range?", answer: "affordable" },
  ],
  // Flow 23: Hipster cafe
  [
    { question: "What's your vibe rn?", answer: "hangout" },
    { question: "What type of place?", answer: "cafe" },
    { question: "What's the vibe?", answer: "hipster" },
    { question: "What drink?", answer: "coffee" },
    { question: "What's the setting?", answer: "trendy" },
    { question: "How many people?", answer: "solo" },
  ],
  // Flow 24: Modern restaurant
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What type of place?", answer: "restaurant" },
    { question: "What's the vibe?", answer: "modern" },
    { question: "What meal?", answer: "dinner" },
    { question: "What's the price range?", answer: "upscale" },
    { question: "What's the setting?", answer: "trendy" },
  ],
  // Flow 25: Traditional spot
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What type of place?", answer: "restaurant" },
    { question: "What's the vibe?", answer: "traditional" },
    { question: "What cuisine you craving?", answer: "american" },
    { question: "What meal?", answer: "dinner" },
    { question: "What's the price range?", answer: "casual" },
  ],
  // Flow 26: Budget-friendly meal
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What's the price range?", answer: "budget-friendly" },
    { question: "What meal?", answer: "lunch" },
    { question: "What cuisine you craving?", answer: "asian" },
    { question: "What's the vibe?", answer: "casual" },
    { question: "How many people?", answer: "solo" },
  ],
  // Flow 27: Fine dining experience
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What's the price range?", answer: "fine-dining" },
    { question: "What meal?", answer: "dinner" },
    { question: "What's the occasion?", answer: "date-night" },
    { question: "What's the vibe?", answer: "romantic" },
    { question: "What's the setting?", answer: "intimate" },
  ],
  // Flow 28: Fast casual lunch
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What's the price range?", answer: "fast-casual" },
    { question: "What meal?", answer: "lunch" },
    { question: "What cuisine you craving?", answer: "american" },
    { question: "How many people?", answer: "solo" },
    { question: "What's the vibe?", answer: "quick" },
  ],
  // Flow 29: Outdoor dining
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What's the setting?", answer: "outdoor" },
    { question: "What meal?", answer: "dinner" },
    { question: "What cuisine you craving?", answer: "mediterranean" },
    { question: "What's the vibe?", answer: "chill" },
    { question: "How many people?", answer: "group" },
  ],
  // Flow 30: Indoor cozy spot
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What's the setting?", answer: "indoor" },
    { question: "What's the vibe?", answer: "cozy" },
    { question: "What type of place?", answer: "cafe" },
    { question: "What meal?", answer: "breakfast" },
    { question: "How many people?", answer: "solo" },
  ],
  // Flow 31: Spacious group dinner
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What's the setting?", answer: "spacious" },
    { question: "How many people?", answer: "group" },
    { question: "What meal?", answer: "dinner" },
    { question: "What cuisine you craving?", answer: "american" },
    { question: "What's the price range?", answer: "casual" },
  ],
  // Flow 32: Vegetarian options
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "Dietary preferences?", answer: "vegetarian" },
    { question: "What cuisine you craving?", answer: "indian" },
    { question: "What meal?", answer: "dinner" },
    { question: "What's the vibe?", answer: "healthy" },
    { question: "What's the price range?", answer: "affordable" },
  ],
  // Flow 33: Vegan cafe
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "Dietary preferences?", answer: "vegan" },
    { question: "What type of place?", answer: "cafe" },
    { question: "What meal?", answer: "brunch" },
    { question: "What's the vibe?", answer: "healthy" },
    { question: "What's the price range?", answer: "affordable" },
  ],
  // Flow 34: Morning meeting
  [
    { question: "What's your vibe rn?", answer: "work" },
    { question: "What's the occasion?", answer: "meeting" },
    { question: "What type of place?", answer: "cafe" },
    { question: "What meal?", answer: "breakfast" },
    { question: "What's the vibe?", answer: "quiet" },
    { question: "How many people?", answer: "group" },
  ],
  // Flow 35: Weekend brunch group
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What meal?", answer: "brunch" },
    { question: "How many people?", answer: "group" },
    { question: "What cuisine you craving?", answer: "american" },
    { question: "What's the vibe?", answer: "trendy" },
    { question: "What's the price range?", answer: "casual" },
  ],
  // Flow 36: Solo dinner
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What meal?", answer: "dinner" },
    { question: "How many people?", answer: "solo" },
    { question: "What cuisine you craving?", answer: "japanese" },
    { question: "What's the vibe?", answer: "cozy" },
    { question: "What's the price range?", answer: "affordable" },
  ],
  // Flow 37: Afternoon tea
  [
    { question: "What's your vibe rn?", answer: "drink" },
    { question: "What drink?", answer: "tea" },
    { question: "What type of place?", answer: "cafe" },
    { question: "What's the vibe?", answer: "chill" },
    { question: "How many people?", answer: "solo" },
    { question: "What's the setting?", answer: "indoor" },
  ],
  // Flow 38: Quiet work session
  [
    { question: "What's your vibe rn?", answer: "work" },
    { question: "What's the occasion?", answer: "study" },
    { question: "What type of place?", answer: "cafe" },
    { question: "What's the vibe?", answer: "quiet" },
    { question: "What's the setting?", answer: "indoor" },
    { question: "How many people?", answer: "solo" },
  ],
  // Flow 39: Casual group lunch
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What meal?", answer: "lunch" },
    { question: "How many people?", answer: "group" },
    { question: "What cuisine you craving?", answer: "mexican" },
    { question: "What's the vibe?", answer: "casual" },
    { question: "What's the price range?", answer: "affordable" },
  ],
  // Flow 40: Upscale date
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What's the occasion?", answer: "date-night" },
    { question: "What's the price range?", answer: "upscale" },
    { question: "What meal?", answer: "dinner" },
    { question: "What cuisine you craving?", answer: "french" },
    { question: "What's the vibe?", answer: "romantic" },
    { question: "What's the setting?", answer: "intimate" },
  ],
  // Flow 41: Quick solo lunch
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What meal?", answer: "lunch" },
    { question: "How many people?", answer: "solo" },
    { question: "What's the price range?", answer: "fast-casual" },
    { question: "What cuisine you craving?", answer: "asian" },
    { question: "What's the vibe?", answer: "quick" },
  ],
  // Flow 49: Family dinner
  [
    { question: "What's your vibe rn?", answer: "eat" },
    { question: "What's the occasion?", answer: "family-friendly" },
    { question: "How many people?", answer: "group" },
    { question: "What meal?", answer: "dinner" },
    { question: "What cuisine you craving?", answer: "american" },
    { question: "What's the price range?", answer: "casual" },
  ],
];

/**
 * Minimum number of suggestions to display.
 */
export const MINIMUM_SUGGESTIONS_COUNT = 12;

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

export const savedForLaterFeedbacks: SuggestionFeedback[] = [
  { text: "saved", emoji: "🔖" },
  { text: "bookmarked", emoji: "📌" },
  { text: "for later", emoji: "⏰" },
  { text: "on deck", emoji: "🃏" },
  { text: "locked in", emoji: "🔒" },
  { text: "noted", emoji: "📝" },
];

// ============================================================================
// UTILITIES
// ============================================================================

const usedSkipFeedbackIndices = new Set<number>();
const usedSelectFeedbackIndices = new Set<number>();
const usedSavedForLaterFeedbackIndices = new Set<number>();
const usedSpontyFlowIndices = new Set<number>();

/**
 * Gets a random skip feedback message that hasn't been used recently.
 * Tracks used indices and resets when all feedbacks have been used.
 *
 * @returns A random SuggestionFeedback object for skip actions
 */
export const getRandomUnusedSkipFeedback = (): SuggestionFeedback => {
  if (usedSkipFeedbackIndices.size >= suggestionSkipFeedbacks.length) {
    usedSkipFeedbackIndices.clear();
  }

  const availableIndices = suggestionSkipFeedbacks
    .map((_, index) => index)
    .filter((index) => !usedSkipFeedbackIndices.has(index));

  const randomIndex =
    availableIndices[Math.floor(Math.random() * availableIndices.length)];

  usedSkipFeedbackIndices.add(randomIndex);

  return suggestionSkipFeedbacks[randomIndex];
};

/**
 * Gets a random select feedback message that hasn't been used recently.
 * Tracks used indices and resets when all feedbacks have been used.
 *
 * @returns A random SuggestionFeedback object for select actions
 */
export const getRandomUnusedSelectFeedback = (): SuggestionFeedback => {
  if (usedSelectFeedbackIndices.size >= suggestionSelectFeedbacks.length) {
    usedSelectFeedbackIndices.clear();
  }

  const availableIndices = suggestionSelectFeedbacks
    .map((_, index) => index)
    .filter((index) => !usedSelectFeedbackIndices.has(index));

  const randomIndex =
    availableIndices[Math.floor(Math.random() * availableIndices.length)];

  usedSelectFeedbackIndices.add(randomIndex);

  return suggestionSelectFeedbacks[randomIndex];
};

/**
 * Gets a random saved for later feedback message that hasn't been used recently.
 * Tracks used indices and resets when all feedbacks have been used.
 *
 * @returns A random SuggestionFeedback object for saved for later actions
 */
export const getRandomSavedForLaterFeedback = (): SuggestionFeedback => {
  if (usedSavedForLaterFeedbackIndices.size >= savedForLaterFeedbacks.length) {
    usedSavedForLaterFeedbackIndices.clear();
  }

  const availableIndices = savedForLaterFeedbacks
    .map((_, index) => index)
    .filter((index) => !usedSavedForLaterFeedbackIndices.has(index));

  const randomIndex =
    availableIndices[Math.floor(Math.random() * availableIndices.length)];

  usedSavedForLaterFeedbackIndices.add(randomIndex);

  return savedForLaterFeedbacks[randomIndex];
};

/**
 * Gets a random complete question-answer flow from the SPONTY_QA_FLOWS pool.
 * Tracks used indices and prioritizes unused flows before reusing.
 * Each flow contains 6-7 question-answer pairs that form a natural conversation.
 *
 * @returns An object containing arrays of questions and answers from the selected flow
 */
const getRandomSpontyQAFlow = (): {
  questions: Question[];
  answers: string[];
} => {
  if (usedSpontyFlowIndices.size >= SPONTY_QA_FLOWS.length) {
    usedSpontyFlowIndices.clear();
  }

  const availableIndices = SPONTY_QA_FLOWS.map((_, index) => index).filter(
    (index) => !usedSpontyFlowIndices.has(index)
  );

  const randomIndex =
    availableIndices[Math.floor(Math.random() * availableIndices.length)];

  usedSpontyFlowIndices.add(randomIndex);

  const selectedFlow = SPONTY_QA_FLOWS[randomIndex];

  const questions: Question[] = selectedFlow.map((pair) => ({
    question: pair.question,
    choices: [],
    feedback: { emoji: "", label: "" },
    isLast: false,
  }));

  const answers = selectedFlow.map((pair) => pair.answer);

  return { questions, answers };
};

/**
 * Extracts the opening time for today from weekday opening hours descriptions.
 *
 * @param weekdayText - Array of weekday opening hours in format ["Monday: 9:00 AM - 5:00 PM", ...] or ["Monday: 2:00 - 11:00 PM", ...] or ["Monday: Open 24 hours"] or ["Monday: Closed"]
 * @returns Opening time string in "HH:MM AM/PM" format, or empty string if not found or for special cases (24 hours, closed)
 */
export const getOpeningTimeForToday = (weekdayText: string[]): string => {
  const today = new Date().getDay();
  const dayMap: { [key: number]: number } = {
    0: 6,
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
  };
  const dayIndex = dayMap[today];
  const todaySchedule = weekdayText[dayIndex];
  if (!todaySchedule) return "";

  if (/open\s+24\s+hours/i.test(todaySchedule)) return "";
  if (/closed/i.test(todaySchedule)) return "";

  const matchWithAMPM = todaySchedule.match(
    /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[-–]/
  );
  if (matchWithAMPM) return matchWithAMPM[1];

  const matchWithoutAMPM = todaySchedule.match(
    /(\d{1,2}:\d{2})\s*[-–]\s*\d{1,2}:\d{2}\s*(AM|PM)/i
  );
  if (matchWithoutAMPM) {
    return `${matchWithoutAMPM[1]} ${matchWithoutAMPM[2]}`;
  }

  return "";
};

/**
 * Extracts the closing time for today from weekday opening hours descriptions.
 *
 * @param weekdayText - Array of weekday opening hours in format ["Monday: 9:00 AM - 5:00 PM", ...] or ["Monday: 2:00 - 11:00 PM", ...] or ["Monday: Open 24 hours"] or ["Monday: Closed"]
 * @returns Closing time string in "HH:MM AM/PM" format, or empty string if not found or for special cases (24 hours, closed)
 */
export const getClosingTimeForToday = (weekdayText: string[]): string => {
  const today = new Date().getDay();
  const dayMap: { [key: number]: number } = {
    0: 6,
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
  };
  const dayIndex = dayMap[today];
  const todaySchedule = weekdayText[dayIndex];
  if (!todaySchedule) return "";

  if (/open\s+24\s+hours/i.test(todaySchedule)) return "";
  if (/closed/i.test(todaySchedule)) return "";

  const match = todaySchedule.match(/[-–]\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
  return match ? match[1] : "";
};

/**
 * Gets the full opening hours range for today from weekday opening hours descriptions.
 *
 * @param weekdayText - Array of weekday opening hours in format ["Monday: 9:00 AM - 5:00 PM", ...] or ["Monday: 2:00 - 11:00 PM", ...] or ["Monday: Open 24 hours"] or ["Monday: Closed"]
 * @returns Opening hours string in "HH:MM AM/PM - HH:MM AM/PM" format, "Open 24 hours", "Closed", or empty string if not found
 */
export const getOpeningHoursForToday = (weekdayText: string[]): string => {
  const today = new Date().getDay();
  const dayMap: { [key: number]: number } = {
    0: 6,
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
  };
  const dayIndex = dayMap[today];
  const todaySchedule = weekdayText[dayIndex];
  if (!todaySchedule) return "";

  if (/open\s+24\s+hours/i.test(todaySchedule)) return "Open 24 hours";
  if (/closed/i.test(todaySchedule)) return "Closed";

  const matchWithBothAMPM = todaySchedule.match(
    /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[-–]\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i
  );
  if (matchWithBothAMPM) {
    return `${matchWithBothAMPM[1]} - ${matchWithBothAMPM[2]}`;
  }

  const matchWithSecondAMPM = todaySchedule.match(
    /(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2}\s*(AM|PM))/i
  );
  if (matchWithSecondAMPM) {
    return `${matchWithSecondAMPM[1]} ${matchWithSecondAMPM[3]} - ${matchWithSecondAMPM[2]}`;
  }

  return "";
};

/**
 * Calculates a countdown string until a target time.
 * Returns time remaining in "Xh Ym" or "Ym" format.
 *
 * @param timeString - Time string in "HH:MM AM/PM" format
 * @returns Countdown string (e.g., "2h 30m" or "45m"), or empty string if invalid
 */
export const getCountdown = (timeString: string): string => {
  if (!timeString) return "";

  const now = new Date();
  const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return "";

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  const targetTime = new Date();
  targetTime.setHours(hours, minutes, 0, 0);

  if (targetTime < now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const diffMs = targetTime.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  }
  return `${diffMinutes}m`;
};

/**
 * Determines if a place is currently open based on opening and closing times.
 * Handles cases where closing time is on the next day (e.g., bars open until 2 AM).
 *
 * @param opensAt - Opening time in "HH:MM AM/PM" format (optional)
 * @param closesAt - Closing time in "HH:MM AM/PM" format (optional)
 * @returns true if the place is currently open, false otherwise. Returns true if times are not provided.
 */
export const isCurrentlyOpen = (
  opensAt?: string,
  closesAt?: string
): boolean => {
  if (!opensAt || !closesAt) return true;

  const now = new Date();

  const parseTime = (timeString: string): Date => {
    const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return now;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    return time;
  };

  const openTime = parseTime(opensAt);
  const closeTime = parseTime(closesAt);

  if (closeTime < openTime) {
    closeTime.setDate(closeTime.getDate() + 1);
  }

  if (now < openTime) {
    return false;
  }

  if (now > closeTime) {
    return false;
  }

  return true;
};

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula.
 *
 * @param userLat - User's latitude in decimal degrees
 * @param userLng - User's longitude in decimal degrees
 * @param targetLat - Target location's latitude in decimal degrees
 * @param targetLng - Target location's longitude in decimal degrees
 * @returns Distance in kilometers, rounded to 1 decimal place
 *
 * @see https://en.wikipedia.org/wiki/Haversine_formula
 */
export const getDistanceInKm = (
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number
): number => {
  const R = 6371;
  const dLat = ((targetLat - userLat) * Math.PI) / 180;
  const dLng = ((targetLng - userLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLat * Math.PI) / 180) *
      Math.cos((targetLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Generates place suggestions based on user survey questions, answers and location.
 * Computes additional fields like opening/closing times.
 * Photo URIs are loaded separately in the context.
 *
 * @param questions - Array of survey questions that were asked
 * @param answers - Array of user answers from the survey
 * @param userLocation - User's current location coordinates
 * @param filterOpenNow - Whether to filter for places open now
 * @param filterCity - City name to filter by (optional)
 * @param maxDistanceKm - Maximum distance in kilometers to filter by (optional)
 * @returns Promise resolving to an array of Suggestion objects with computed fields
 * @throws Error if suggestion generation fails after all retry attempts
 */
export const generateSuggestions = async (
  questions: Question[],
  answers: string[],
  userLocation: LocationCoordinates,
  filterOpenNow: boolean = false,
  filterCity?: string | null,
  maxDistanceKm?: number | null
): Promise<Suggestion[]> => {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      let query: string;
      if (answers.length === 1 && answers[0] === SpontyChoice.value) {
        const { questions: spontyQuestions, answers: spontyAnswers } =
          getRandomSpontyQAFlow();
        query = await generateQuery(spontyQuestions, spontyAnswers);
      } else if (answers.length === 1 && answers[0] !== SpontyChoice.value) {
        query = answers[0];
      } else {
        query = await generateQuery(questions, answers);
      }
      const embeddings = await generateEmbedding(query);

      const suggestions: Suggestion[] = await suggestPlaces({
        queryEmbedding: embeddings,
        filterOpenNow,
        filterCity,
        userLocation,
        maxDistanceKm,
      });

      const suggestionsWithComputedFields = suggestions.map(
        (suggestion: Suggestion) => {
          if (suggestion.openingHours) {
            const opensAt = getOpeningTimeForToday(suggestion.openingHours);
            const closesAt = getClosingTimeForToday(suggestion.openingHours);
            return {
              ...suggestion,
              opensAt,
              closesAt,
            };
          }

          return suggestion;
        }
      );

      return suggestionsWithComputedFields;
    } catch {
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1))
        );
      }
    }
  }

  throw new Error("yikes! suggestion generation failed fr");
};

/**
 * Loads the first photo URI for a suggestion.
 *
 * @param suggestion - The suggestion to load the first photo for
 * @returns Promise resolving to the first photo URI, or undefined if no photos or loading fails
 */
export const loadFirstPhotoForSuggestion = async (
  suggestion: Suggestion
): Promise<string | undefined> => {
  if (suggestion.photos.length === 0) {
    return undefined;
  }

  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const firstPhotoUri = await places.getPhotoUri({
        photoName: suggestion.photos[0],
        maxWidthPx: PHOTO_MAX_WIDTH_PX,
        maxHeightPx: PHOTO_MAX_HEIGHT_PX,
      });

      return firstPhotoUri;
    } catch {
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1))
        );
      }
    }
  }

  return undefined;
};

/**
 * Loads a specific photo URI by its resource name.
 * This supports loading photos in any order, including going back in the carousel.
 *
 * @param photoName - Photo resource name in format: places/{placeId}/photos/{photo_reference}
 * @returns Promise resolving to the photo URI, or undefined if loading fails
 */
export const loadPhotoByName = async (
  photoName: string
): Promise<string | undefined> => {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const photoUri = await places.getPhotoUri({
        photoName,
        maxWidthPx: PHOTO_MAX_WIDTH_PX,
        maxHeightPx: PHOTO_MAX_HEIGHT_PX,
      });
      return photoUri;
    } catch {
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1))
        );
      }
    }
  }

  return undefined;
};

/**
 * Loads the first photo URI for the current suggestion and preloads the first photo for the next one.
 * This is used for lazy loading photos as the user navigates through suggestions.
 * Includes retry logic (up to 3 attempts) for reliability.
 *
 * @param suggestions - Array of suggestions
 * @param currentIndex - Index of the current suggestion
 * @param photoUrisMap - Map of suggestion IDs to their photo maps (photo name -> photo URI)
 * @returns Promise resolving to a map of loaded photo URIs (suggestion ID -> photo name -> photo URI)
 */
export const loadFirstPhotoForCurrentAndNextSuggestions = async (
  suggestions: Suggestion[],
  currentIndex: number,
  photoUrisMap: Map<string, Map<string, string>>
): Promise<Map<string, Map<string, string>>> => {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const updatedMap = new Map(photoUrisMap);
      const currentSuggestion = suggestions[currentIndex];
      const nextSuggestion = suggestions[currentIndex + 1];

      const loadPromises: Promise<void>[] = [];

      if (currentSuggestion && currentSuggestion.photos.length > 0) {
        const currentPhotoMap = updatedMap.get(currentSuggestion.id);
        const firstPhotoName = currentSuggestion.photos[0];
        if (!currentPhotoMap || !currentPhotoMap.has(firstPhotoName)) {
          loadPromises.push(
            loadFirstPhotoForSuggestion(currentSuggestion).then((photoUri) => {
              if (photoUri) {
                const photoMap = new Map<string, string>();
                photoMap.set(firstPhotoName, photoUri);
                updatedMap.set(currentSuggestion.id, photoMap);
              }
            })
          );
        }
      }

      if (nextSuggestion && nextSuggestion.photos.length > 0) {
        const nextPhotoMap = updatedMap.get(nextSuggestion.id);
        const firstPhotoName = nextSuggestion.photos[0];
        if (!nextPhotoMap || !nextPhotoMap.has(firstPhotoName)) {
          loadPromises.push(
            loadFirstPhotoForSuggestion(nextSuggestion).then((photoUri) => {
              if (photoUri) {
                const photoMap = new Map<string, string>();
                photoMap.set(firstPhotoName, photoUri);
                updatedMap.set(nextSuggestion.id, photoMap);
              }
            })
          );
        }
      }

      await Promise.all(loadPromises);
      return updatedMap;
    } catch {
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1))
        );
      }
    }
  }

  return photoUrisMap;
};
