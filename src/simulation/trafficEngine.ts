/**
 * Bengaluru Traffic & Congestion Simulation Engine
 * Simulates real-time speed modifiers, delay parameters, and ETA multipliers.
 */
export interface TrafficState {
  congestionLevel: 'NONE' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'BLOCKED';
  speedKmph: number;
  delayMultiplier: number;
  incidentActive: boolean;
  incidentType?: string;
  roadName: string;
}

export function getTrafficState(
  zoneId: string,
  hour: number,
  isWeekend: boolean,
  hasRain: boolean
): TrafficState {
  let baseSpeed = 40; // km/h base speed
  let speedKmph = baseSpeed;
  let incidentActive = false;
  let incidentType: string | undefined;
  
  // Specific bottleneck indicators in Bengaluru
  const roadNames: Record<string, string> = {
    silk_board: "Outer Ring Road (Silk Board Junction)",
    marathahalli: "Marathahalli Bridge Underpass",
    electronic_city: "Hosur Road Flyover / Expressway",
    hebbal: "Hebbal Flyover (Outer Ring)",
    koramangala: "Koramangala 80 Feet Road",
    indiranagar: "100 Feet Road Indiranagar",
    whitefield: "ITPL Main Road",
    mg_road: "MG Road Metro Corridor",
    jp_nagar: "JP Nagar 15th Cross Road",
    btm_layout: "BTM Layout 29th Main Road",
  };

  const roadName = roadNames[zoneId] || `${zoneId.charAt(0).toUpperCase() + zoneId.slice(1)} Arterial Road`;

  // Base speed adjustments by road type / area
  if (zoneId === "silk_board" || zoneId === "marathahalli" || zoneId === "whitefield") {
    baseSpeed = 30; // Congested by default
  } else if (zoneId === "hebbal" || zoneId === "electronic_city") {
    baseSpeed = 55; // Expressway/Highway segments
  }

  // Multiplier calculations based on hours
  let congestionMultiplier = 1.0;
  const isMorningPeak = hour >= 8 && hour <= 11;
  const isEveningPeak = hour >= 17 && hour <= 21;

  if (isWeekend) {
    if (isEveningPeak && (zoneId === "indiranagar" || zoneId === "koramangala" || zoneId === "mg_road")) {
      congestionMultiplier = 0.55; // High weekend nightlife congestion
    } else if (hour >= 11 && hour <= 15) {
      congestionMultiplier = 0.8; // Leisure/shopping traffic
    } else {
      congestionMultiplier = 0.95; // Relatively clear
    }
  } else {
    // Weekday peak traffic
    if (isMorningPeak) {
      if (zoneId === "silk_board" || zoneId === "marathahalli" || zoneId === "whitefield" || zoneId === "electronic_city") {
        congestionMultiplier = 0.4; // High office gridlock
      } else {
        congestionMultiplier = 0.65;
      }
    } else if (isEveningPeak) {
      if (zoneId === "silk_board" || zoneId === "marathahalli" || zoneId === "whitefield" || zoneId === "hebbal") {
        congestionMultiplier = 0.35; // Peak exit block
      } else {
        congestionMultiplier = 0.55;
      }
    } else if (hour >= 13 && hour <= 15) {
      congestionMultiplier = 0.85; // Off-peak afternoon
    } else if (hour >= 0 && hour <= 5) {
      congestionMultiplier = 1.25; // Quiet night dispatch
    }
  }

  // Rain increases congestion significantly (waterlogged underpasses)
  if (hasRain) {
    congestionMultiplier *= 0.65;
    
    // Waterlogging incidents
    if (Math.random() < 0.25 && (zoneId === "silk_board" || zoneId === "marathahalli" || zoneId === "whitefield")) {
      incidentActive = true;
      incidentType = "Underpass Waterlogging";
    }
  }

  // Random micro-incidents (broken down BMTC bus, metro construction) to elevate simulation realism
  if (!incidentActive && Math.random() < 0.1) {
    incidentActive = true;
    const incidents = ["Broken Down BMTC Bus", "Metro Construction Lane Encroachment", "Active Minor Collision"];
    incidentType = incidents[Math.floor(Math.random() * incidents.length)];
    congestionMultiplier *= 0.75;
  }

  // Calculate final speeds bounded realistically
  speedKmph = Math.max(6, Math.min(75, Math.round(baseSpeed * congestionMultiplier)));
  const delayMultiplier = parseFloat((1 / (speedKmph / baseSpeed)).toFixed(2));

  // Determine levels
  let congestionLevel: 'NONE' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'BLOCKED' = 'NONE';
  if (speedKmph < 10) {
    congestionLevel = 'BLOCKED';
  } else if (speedKmph < 18) {
    congestionLevel = 'HEAVY';
  } else if (speedKmph < 28) {
    congestionLevel = 'MODERATE';
  } else if (speedKmph < 38) {
    congestionLevel = 'LIGHT';
  } else {
    congestionLevel = 'NONE';
  }

  return {
    congestionLevel,
    speedKmph,
    delayMultiplier,
    incidentActive,
    incidentType,
    roadName,
  };
}

export function computeCTAandETA(
  originalEtaMins: number,
  trafficState: TrafficState
): { finalEta: number; delayLabel: string } {
  const finalMinutes = Math.max(3, Math.round(originalEtaMins * trafficState.delayMultiplier));
  const diffMins = finalMinutes - originalEtaMins;
  
  let delayLabel = "Fast Moving";
  if (diffMins > 10) {
    delayLabel = `Heavy Jam (+${diffMins}m)`;
  } else if (diffMins > 4) {
    delayLabel = `Moderate Slowdown (+${diffMins}m)`;
  } else if (diffMins > 0) {
    delayLabel = `Light Slowdown (+${diffMins}m)`;
  } else if (diffMins < 0) {
    delayLabel = "Express Clearance";
  }

  return {
    finalEta: finalMinutes,
    delayLabel,
  };
}
