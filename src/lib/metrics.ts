import type { Guest } from "@/lib/models";

export interface GuestMetrics {
  realPeople: number;
  confirmed: number;
  declined: number;
  pending: number;
  key: number;
  plusOnes: number;
}

export function getGuestMetrics(guests: Guest[]): GuestMetrics {
  return guests.reduce<GuestMetrics>(
    (metrics, guest) => {
      if (guest.attendingPeatonal === true) {
        metrics.confirmed += 1;
        metrics.realPeople += 1;
        if (guest.hasPlusOne) {
          metrics.plusOnes += 1;
          metrics.realPeople += 1;
        }
      } else if (guest.attendingPeatonal === false) {
        metrics.declined += 1;
      } else {
        metrics.pending += 1;
      }

      if (guest.attendingKey === "yes") metrics.key += 1;
      return metrics;
    },
    { realPeople: 0, confirmed: 0, declined: 0, pending: 0, key: 0, plusOnes: 0 },
  );
}

export function formatGuestNumber(value: number): string {
  return `#${String(value).padStart(3, "0")}`;
}
