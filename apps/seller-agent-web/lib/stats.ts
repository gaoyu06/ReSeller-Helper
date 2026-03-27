import { endOfMonth, endOfToday, startOfMonth, startOfToday } from "date-fns";

export function getStatsRange() {
  return {
    today: {
      start: startOfToday(),
      end: endOfToday(),
    },
    month: {
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
    },
  };
}
