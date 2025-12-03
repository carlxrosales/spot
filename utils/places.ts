/**
 * Utility functions for working with place data, including opening hours,
 * time calculations, and distance calculations.
 */

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

