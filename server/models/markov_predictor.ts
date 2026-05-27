import { ZONES, Zone } from "../data/zones.ts";
import { haversine } from "../utils/distance.ts";

export interface Transition {
  fromZone: string;
  toZone: string;
}

export interface TransitionPrediction {
  zone_id: string;
  zone_name: string;
  lat: number;
  lng: number;
  probability: number;
  confidence_pct: number;
  distance_km: number;
  eta_mins: number;
  direction: string;
}

export class MarkovPredictor {
  // transitionMatrix[fromZone][toZone] = count
  private transitionMatrix: Record<string, Record<string, number>> = {};
  
  constructor() {
    this.initMatrix();
  }

  // Set up all zones in the matrix
  private initMatrix() {
    for (const z1 of ZONES) {
      this.transitionMatrix[z1.id] = {};
      for (const z2 of ZONES) {
        this.transitionMatrix[z1.id][z2.id] = 0; // initialize with 0 transitions
      }
    }
  }

  // Train with transition sequences
  public train(order_sequence: { pickup_zone: string; dropoff_zone: string }[]) {
    this.initMatrix(); // reset

    for (const order of order_sequence) {
      const from = order.pickup_zone;
      const to = order.dropoff_zone;
      
      if (this.transitionMatrix[from] && this.transitionMatrix[from][to] !== undefined) {
        this.transitionMatrix[from][to]++;
      }
    }
  }

  /**
   * Predict top 3 next zone transitions given current zone
   */
  public predict(current_zone_id: string, current_lat: number = 12.9352, current_lng: number = 77.6245): TransitionPrediction[] {
    const row = this.transitionMatrix[current_zone_id] || {};
    let totalTransitions = 0;

    for (const target_id in row) {
      totalTransitions += row[target_id];
    }

    const predictions: { zone_id: string; probability: number }[] = [];

    // If no transitions trained yet, provide uniform logic or base_demand logic
    if (totalTransitions === 0) {
      const others = ZONES.filter((z) => z.id !== current_zone_id);
      const totalDemand = others.reduce((acc, z) => acc + z.base_demand, 0);
      for (const z of others) {
        predictions.push({
          zone_id: z.id,
          probability: z.base_demand / totalDemand
        });
      }
    } else {
      for (const target_id in row) {
        if (target_id === current_zone_id) continue; // standard transition is to other zones
        const count = row[target_id];
        predictions.push({
          zone_id: target_id,
          probability: count / totalTransitions
        });
      }
    }

    // Sort descending by probability
    predictions.sort((a, b) => b.probability - a.probability);

    // Filter top 3 and calculate distance, direction and eta
    const results: TransitionPrediction[] = [];
    const top3 = predictions.slice(0, 3);
    const sumTopProb = top3.reduce((acc, p) => acc + p.probability, 0);

    for (const p of top3) {
      const targetZone = ZONES.find((z) => z.id === p.zone_id)!;
      const dist = haversine(current_lat, current_lng, targetZone.lat, targetZone.lng);
      const eta = this.get_countdown(dist);
      const directionStr = this.get_direction(current_lat, current_lng, targetZone.lat, targetZone.lng);

      // Confidence percent of this transition among top predictions
      const confidence_pct = sumTopProb > 0 
        ? Math.round((p.probability / sumTopProb) * 100)
        : Math.round(p.probability * 100);

      results.push({
        zone_id: targetZone.id,
        zone_name: targetZone.name,
        lat: targetZone.lat,
        lng: targetZone.lng,
        probability: parseFloat(p.probability.toFixed(3)),
        confidence_pct,
        distance_km: parseFloat(dist.toFixed(1)),
        eta_mins: eta,
        direction: directionStr
      });
    }

    return results;
  }

  public get_countdown(distance_km: number): number {
    // estimated minutes to position (speed: 25km/h avg)
    return Math.ceil((distance_km / 25) * 60);
  }

  public get_direction(from_lat: number, from_lng: number, to_lat: number, to_lng: number): string {
    const theta = Math.atan2(to_lng - from_lng, to_lat - from_lat);
    let bearing = (theta * 180) / Math.PI;
    if (bearing < 0) bearing += 360;

    const directions = [
      "North",
      "North-East",
      "East",
      "South-East",
      "South",
      "South-West",
      "West",
      "North-West"
    ];
    
    // Divide 360 by 8 to get increments of 45 deg, offset half-increment
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  }
}
