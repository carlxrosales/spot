import { UserLocation } from "@/constants/location";

export interface Suggestion {
  id: string;
  name: string;
  address: string;
  rating: number;
  priceLevel?: number;
  photos: string[];
  types: string[];
  location: UserLocation;
  openingHours?: {
    opensAt?: string;
    closesAt?: string;
    weekdayText?: string[];
  };
  description?: string;
  distanceInKm?: number;
}

export interface SuggestionFeedback {
  text: string;
  emoji: string;
}
