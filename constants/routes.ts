/**
 * Application route paths.
 * Defines all navigation routes used in the app.
 */
export const Routes = {
  survey: "/",
  suggestions: "/suggestions",
  customInput: "/custom-input",
  lazyMode: "/lazy-mode",
  areaSearch: "/area-search",
  area: "/area/[area]",
  mySpots: "/my-spots",
  recommendations: "/recommendations/[code]",
  recos: "/recos/[code]",
} as const;
