import {
  suggestionSelectFeedbacks,
  suggestionSkipFeedbacks,
} from "./constants";
import { SuggestionFeedback } from "./types";

const usedSkipFeedbackIndices = new Set<number>();
const usedSelectFeedbackIndices = new Set<number>();

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

const getOpeningTimeForToday = (weekdayText: string[]): string => {
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
  const match = todaySchedule.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-/);
  return match ? match[1] : "";
};

const getClosingTimeForToday = (weekdayText: string[]): string => {
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
  const match = todaySchedule.match(/-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/);
  return match ? match[1] : "";
};

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
  const match = todaySchedule.match(
    /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/
  );
  return match ? `${match[1]} - ${match[2]}` : "";
};

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

export { getClosingTimeForToday, getOpeningTimeForToday };
