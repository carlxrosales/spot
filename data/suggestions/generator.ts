import { LocationCoordinates } from "@/data/location";
import { getPhotoUris } from "@/services/places";
import { DEFAULT_MAX_DISTANCE_IN_KM } from "./constants";
import { Suggestion } from "./types";
import {
  getClosingTimeForToday,
  getDistanceInKm,
  getOpeningTimeForToday,
} from "./utils";

/**
 * Generates place suggestions based on user survey answers and location.
 * Computes additional fields like distance, opening/closing times, and photo URIs.
 *
 * @param answers - Array of user answers from the survey
 * @param userLocation - User's current location coordinates
 * @param maxDistanceInKm - Maximum distance in kilometers for filtering (default: DEFAULT_MAX_DISTANCE_IN_KM)
 * @returns Promise resolving to an array of Suggestion objects with computed fields
 */
export const generateSuggestions = async (
  answers: string[],
  userLocation: LocationCoordinates,
  maxDistanceInKm: number = DEFAULT_MAX_DISTANCE_IN_KM
): Promise<Suggestion[]> => {
  const dummyData: Suggestion[] = [
    {
      id: "1",
      name: "The Coffee House",
      address: "123 Main St, San Francisco, CA",
      rating: 4.5,
      priceLevel: 2,
      photos: [
        "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800",
      ],
      tags: ["cafe", "coffee_shop", "establishment"],
      lat: 37.7749,
      lng: -122.4194,
      openingHours: [
        "Monday: 7:00 AM - 8:00 PM",
        "Tuesday: 7:00 AM - 8:00 PM",
        "Wednesday: 7:00 AM - 8:00 PM",
        "Thursday: 7:00 AM - 8:00 PM",
        "Friday: 7:00 AM - 9:00 PM",
        "Saturday: 8:00 AM - 9:00 PM",
        "Sunday: 8:00 AM - 7:00 PM",
      ],
      description: "Cozy neighborhood cafe with great pastries and coffee",
    },
    {
      id: "2",
      name: "Bella Italia",
      address: "456 Market St, San Francisco, CA",
      rating: 4.8,
      priceLevel: 3,
      photos: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
      ],
      tags: ["restaurant", "italian", "establishment"],
      lat: 37.7849,
      lng: -122.4094,
      openingHours: [
        "Monday: 5:00 PM - 10:00 PM",
        "Tuesday: 5:00 PM - 10:00 PM",
        "Wednesday: 5:00 PM - 10:00 PM",
        "Thursday: 5:00 PM - 10:00 PM",
        "Friday: 5:00 PM - 11:00 PM",
        "Saturday: 5:00 PM - 11:00 PM",
        "Sunday: 5:00 PM - 9:00 PM",
      ],
      description: "Authentic Italian cuisine in a romantic setting",
    },
    {
      id: "3",
      name: "Green Leaf Bistro",
      address: "789 Valencia St, San Francisco, CA",
      rating: 4.3,
      priceLevel: 2,
      photos: [
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
      ],
      tags: ["restaurant", "vegetarian", "establishment"],
      lat: 37.7649,
      lng: -122.4294,
      openingHours: [
        "Monday: 11:00 AM - 9:00 PM",
        "Tuesday: 11:00 AM - 9:00 PM",
        "Wednesday: 11:00 AM - 9:00 PM",
        "Thursday: 11:00 AM - 9:00 PM",
        "Friday: 11:00 AM - 10:00 PM",
        "Saturday: 10:00 AM - 10:00 PM",
        "Sunday: 10:00 AM - 8:00 PM",
      ],
      description: "Fresh, healthy vegetarian and vegan options",
    },
    {
      id: "4",
      name: "Sunset Brewery",
      address: "321 Castro St, San Francisco, CA",
      rating: 4.6,
      priceLevel: 2,
      photos: [
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800",
        "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800",
      ],
      tags: ["bar", "brewery", "establishment"],
      lat: 37.7549,
      lng: -122.4394,
      openingHours: [
        "Monday: 4:00 PM - 12:00 AM",
        "Tuesday: 4:00 PM - 12:00 AM",
        "Wednesday: 4:00 PM - 12:00 AM",
        "Thursday: 4:00 PM - 12:00 AM",
        "Friday: 3:00 PM - 1:00 AM",
        "Saturday: 12:00 PM - 1:00 AM",
        "Sunday: 12:00 PM - 11:00 PM",
      ],
      description: "Local craft beers and pub food",
    },
    {
      id: "5",
      name: "Morning Glory Cafe",
      address: "654 Mission St, San Francisco, CA",
      rating: 4.4,
      priceLevel: 1,
      photos: [
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
        "https://images.unsplash.com/photo-1509042239860-f550c710c120?w=800",
      ],
      tags: ["cafe", "breakfast", "establishment"],
      lat: 37.7849,
      lng: -122.4094,
      openingHours: [
        "Monday: 6:00 AM - 3:00 PM",
        "Tuesday: 6:00 AM - 3:00 PM",
        "Wednesday: 6:00 AM - 3:00 PM",
        "Thursday: 6:00 AM - 3:00 PM",
        "Friday: 6:00 AM - 3:00 PM",
        "Saturday: 7:00 AM - 4:00 PM",
        "Sunday: 7:00 AM - 4:00 PM",
      ],
      description: "Best breakfast spot in the neighborhood",
    },
  ];

  const suggestionsWithComputedFields = await Promise.all(
    dummyData.map(async (suggestion) => {
      const distanceInKm = getDistanceInKm(
        userLocation.lat,
        userLocation.lng,
        suggestion.lat,
        suggestion.lng
      );

      const photoUris =
        suggestion.photos.length > 0
          ? await getPhotoUris(suggestion.photos)
          : undefined;

      if (suggestion.openingHours) {
        const opensAt = getOpeningTimeForToday(suggestion.openingHours);
        const closesAt = getClosingTimeForToday(suggestion.openingHours);
        return {
          ...suggestion,
          distanceInKm,
          opensAt,
          closesAt,
          photoUris,
        };
      }

      return {
        ...suggestion,
        distanceInKm,
        photoUris,
      };
    })
  );

  return suggestionsWithComputedFields;
};
