/**
 * Real-world Temporary Event Surge Simulator
 * Simulates random or scheduled urban happenings causing massive temporary hotspots.
 */
export interface ActiveEvent {
  id: string;
  name: string;
  description: string;
  zoneId: string; // The zone affected
  surgeIntensity: number; // multiplier factor (e.g., 1.45 for 45% uplift)
  durationHours: number;
  radiusKm: number;
  expectedRidersCount: number;
  type: 'CONCERT' | 'SPORTS' | 'EXPO' | 'DISRUPTION' | 'WEATHER';
}

export const SIMULATED_EVENTS: ActiveEvent[] = [
  {
    id: "ipl_match",
    name: "IPL Cricket Match: RCB vs KKR",
    description: "RCB match concluding at M. Chinnaswamy Stadium. Large crowd exiting stadium grounds looking for Captains.",
    zoneId: "mg_road",
    surgeIntensity: 1.65,
    durationHours: 3,
    radiusKm: 1.8,
    expectedRidersCount: 3500,
    type: "SPORTS"
  },
  {
    id: "tech_summit",
    name: "Bengaluru Global Tech Summit",
    description: "Annual Tech Expo at ITPL Whitefield. High density of business professionals booking route previews to airport/CBD.",
    zoneId: "whitefield",
    surgeIntensity: 1.4,
    durationHours: 8,
    radiusKm: 2.2,
    expectedRidersCount: 1800,
    type: "EXPO"
  },
  {
    id: "metro_breakdown",
    name: "Purple Line Metro Signal Interruption",
    description: "Technical signal lag at Indiranagar Metro Station. Commuters spill onto road looking for rapid Auto/Bike transit.",
    zoneId: "indiranagar",
    surgeIntensity: 1.85,
    durationHours: 2,
    radiusKm: 1.2,
    expectedRidersCount: 2200,
    type: "DISRUPTION"
  },
  {
    id: "sunday_brunch",
    name: "Indiranagar Weekend Club Nightlife",
    description: "Massive footfall at 100ft Road Breweries. Riders returning home facing extremely low driver supply.",
    zoneId: "indiranagar",
    surgeIntensity: 1.5,
    durationHours: 4,
    radiusKm: 1.5,
    expectedRidersCount: 2000,
    type: "CONCERT"
  },
  {
    id: "silkboard_blockage",
    name: "Silk Board Underpass Construction Jam",
    description: "Heavy concrete girder installation blocking central lanes. Extreme delay on normal bike routes.",
    zoneId: "silk_board",
    surgeIntensity: 1.3,
    durationHours: 5,
    radiusKm: 1.0,
    expectedRidersCount: 800,
    type: "DISRUPTION"
  }
];

export function getActiveEventForZone(zoneId: string, currentHour: number): ActiveEvent | null {
  // We active events based on simulated hourly matching to make the dashboard dynamic
  for (const event of SIMULATED_EVENTS) {
    if (event.zoneId !== zoneId) continue;

    // Map events dynamically to hours to make the simulation feel alive:
    if (event.id === "ipl_match" && currentHour >= 20 && currentHour <= 23) {
      return event;
    }
    if (event.id === "tech_summit" && currentHour >= 9 && currentHour <= 17) {
      return event;
    }
    if (event.id === "metro_breakdown" && (currentHour === 8 || currentHour === 9 || currentHour === 18 || currentHour === 19)) {
      // 10% chance of random disruption during prime commute
      return event;
    }
    if (event.id === "sunday_brunch" && currentHour >= 19 && currentHour <= 23) {
      return event;
    }
  }
  return null;
}
