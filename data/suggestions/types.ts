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
