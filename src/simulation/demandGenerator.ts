/**
 * Dynamic Mobility Demand Simulation Engine
 * Models cyclic passenger behaviors, boarding queues, and tech park surges.
 */

export interface DemandFactors {
  baseWeight: number;
  surgeReason: string;
  expectedWaitMins: number;
  riderIntentStrength: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  destinationHotspotName: string;
}

export function simulateZoneDemand(
  zoneId: string,
  zoneType: string,
  hour: number,
  isWeekend: boolean,
  isHoliday: boolean = false
): DemandFactors {
  let baseWeight = 0.5;
  let surgeReason = "Regular Transit Intervals";
  let riderIntentStrength: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  let destinationHotspotName = "Local Radial Commute";
  
  const isMorningWorkGate = hour >= 8 && hour <= 10;
  const isLunchHour = hour >= 12 && hour <= 14;
  const isEveningWorkHome = hour >= 17 && hour <= 19;
  const isNightlifeHours = hour >= 20 && hour <= 23;
  const isMidnightHours = hour >= 0 && hour <= 4;

  // Type-wise behavior simulations matching Bengaluru patterns
  switch (zoneType) {
    case 'tech_office':
    case 'IT_corridor':
      if (isMorningWorkGate) {
        baseWeight = isWeekend ? 0.2 : 0.95;
        surgeReason = "Corporate Morning Check-in";
        riderIntentStrength = 'CRITICAL';
        destinationHotspotName = "Indiranagar Core / Outer Ring Road";
      } else if (isEveningWorkHome) {
        baseWeight = isWeekend ? 0.35 : 0.98;
        surgeReason = "Tech Park Evening Dismissals";
        riderIntentStrength = 'CRITICAL';
        destinationHotspotName = "BTM Layout / JP Nagar Residences";
      } else if (isLunchHour) {
        baseWeight = isWeekend ? 0.15 : 0.65;
        surgeReason = "Lunch Hour Relocation Requests";
        riderIntentStrength = 'MEDIUM';
        destinationHotspotName = "Commercial Food Courts";
      } else {
        baseWeight = 0.3; // Low general requests
      }
      break;

    case 'nightlife':
      if (isNightlifeHours) {
        baseWeight = isWeekend ? 0.98 : 0.6;
        surgeReason = isWeekend ? "Pub Crowd Weekend Egress" : "Weekday Diner Homebound";
        riderIntentStrength = isWeekend ? 'CRITICAL' : 'HIGH';
        destinationHotspotName = "Tech Suburbs & Housing Blocks";
      } else if (isWeekend && hour >= 16 && hour <= 20) {
        baseWeight = 0.85;
        surgeReason = "Weekend Pub & Social Ingress";
        riderIntentStrength = 'HIGH';
        destinationHotspotName = "Brewery Districts";
      } else if (isMorningWorkGate) {
        baseWeight = 0.45;
        surgeReason = "Leisure Quarter Commuters";
        riderIntentStrength = 'MEDIUM';
        destinationHotspotName = "Tech Campuses";
      } else {
        baseWeight = 0.25;
      }
      break;

    case 'commercial':
      if (hour >= 11 && hour <= 16) {
        baseWeight = isWeekend ? 0.85 : 0.6;
        surgeReason = "Commercial Market Rush";
        riderIntentStrength = 'HIGH';
        destinationHotspotName = "HSR / Koramangala Hubs";
      } else if (isEveningWorkHome) {
        baseWeight = 0.75;
        surgeReason = "Shopping Area Exit Surge";
        riderIntentStrength = 'HIGH';
        destinationHotspotName = "Regional Metro Stations";
      } else {
        baseWeight = 0.4;
      }
      break;

    case 'highway':
      // Hebbal / Silk Board (Intersections with Airport Bus, Intercity travel)
      if (isMorningWorkGate || isEveningWorkHome) {
        baseWeight = 0.88;
        surgeReason = "Transit Corridor Bottle-Neck Aggregation";
        riderIntentStrength = 'HIGH';
        destinationHotspotName = "Kempegowda International Airport (BLR)";
      } else if (isMidnightHours) {
        baseWeight = 0.6; // Intercity bus arrivals
        surgeReason = "Intercity Late Sleeper Bus Arrivals";
        riderIntentStrength = 'HIGH';
        destinationHotspotName = "CBD / Major Tech Suburbs";
      } else {
        baseWeight = 0.5;
      }
      break;

    case 'residential':
    case 'residential_tech':
      if (isMorningWorkGate) {
        baseWeight = isWeekend ? 0.3 : 0.9;
        surgeReason = "Residential Office Influx Departure";
        riderIntentStrength = 'CRITICAL';
        destinationHotspotName = "Manyata Tech Park / ITPL Bellandur";
      } else if (isEveningWorkHome) {
        baseWeight = isWeekend ? 0.5 : 0.4;
        surgeReason = "Residential Return Quiet Hour";
        riderIntentStrength = 'LOW';
        destinationHotspotName = "Local Grocery/Hospitals";
      } else if (isWeekend && isNightlifeHours) {
        baseWeight = 0.75;
        surgeReason = "Weekend Dinner Outbound Commute";
        riderIntentStrength = 'HIGH';
        destinationHotspotName = "Indiranagar 100ft Rd Bars";
      } else {
        baseWeight = 0.35;
      }
      break;

    default:
      baseWeight = 0.5;
  }

  // Factor holiday modifiers
  if (isHoliday) {
    if (zoneType === 'tech_office' || zoneType === 'IT_corridor') {
      baseWeight *= 0.15; // tech parks deserted
      surgeReason = "National / Corporate Solitary Hour";
    } else if (zoneType === 'nightlife' || zoneType === 'commercial') {
      baseWeight *= 1.35; // leisure spikes
      surgeReason = "Public Holiday Social Gatherings";
    }
  }

  baseWeight = Math.min(1.0, Math.max(0.05, baseWeight));

  // Simulating typical captain queue wait duration in minutes
  // Higher demand/surges = shorter captain lookup delay because riders book instantly.
  // Wait to pick passenger drops down to 1.5 - 4 mins when surge is critical
  const expectedWaitMins = Math.max(1.5, parseFloat((15 - (baseWeight * 12) + (Math.random() * 2 - 1)).toFixed(1)));

  return {
    baseWeight,
    surgeReason,
    expectedWaitMins,
    riderIntentStrength,
    destinationHotspotName,
  };
}
