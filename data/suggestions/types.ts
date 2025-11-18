export interface Suggestion {
  id: string;
  name: string;
  address: string;
  rating: number;
  priceLevel?: number;
  photos: string[];
  types: string[];
  location: {
    lat: number;
    lng: number;
  };
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
