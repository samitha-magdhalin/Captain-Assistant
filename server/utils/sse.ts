import { ZONES, Zone } from "../data/zones.ts";
import { IntentScorer } from "../models/intent_scorer.ts";

export interface IntentEventData {
  id: string;
  zone_id: string;
  zone_name: string;
  event_type: 'app_open' | 'price_check' | 'route_preview' | 'booking_attempt';
  lat: number;
  lng: number;
  timestamp: number;
  weight: number;
  demand_impact: number;
}

export function generate_intent_event(): IntentEventData {
  const id = Math.random().toString(36).substring(2, 9);
  
  // 1. Pick zone weighted by base_demand
  const totalBaseDemand = ZONES.reduce((sum, z) => sum + z.base_demand, 0);
  let rZone = Math.random() * totalBaseDemand;
  let selectedZone: Zone = ZONES[0];

  for (const zone of ZONES) {
    rZone -= zone.base_demand;
    if (rZone <= 0) {
      selectedZone = zone;
      break;
    }
  }

  // 2. Pick event_type weighted: app_open (40%), price_check (35%), route_preview (15%), booking_attempt (10%)
  const rEvent = Math.random();
  let event_type: IntentEventData['event_type'] = 'app_open';
  
  if (rEvent < 0.40) {
    event_type = 'app_open';
  } else if (rEvent < 0.75) {
    event_type = 'price_check';
  } else if (rEvent < 0.90) {
    event_type = 'route_preview';
  } else {
    event_type = 'booking_attempt';
  }

  // 3. Add dispersion around zone coordinates (adds realistic spatial variance within ~500m)
  const latDisp = (Math.random() - 0.5) * 0.006;
  const lngDisp = (Math.random() - 0.5) * 0.006;
  const lat = parseFloat((selectedZone.lat + latDisp).toFixed(6));
  const lng = parseFloat((selectedZone.lng + lngDisp).toFixed(6));

  const weight = IntentScorer.EVENT_WEIGHTS[event_type] || 0.3;
  // Demand impact: higher events have higher visual impact
  const demand_impact = parseFloat((weight * 2.5).toFixed(1));

  return {
    id,
    zone_id: selectedZone.id,
    zone_name: selectedZone.name,
    event_type,
    lat,
    lng,
    timestamp: Date.now(),
    weight,
    demand_impact
  };
}
