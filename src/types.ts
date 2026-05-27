export interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  base_demand: number;
  peak_hours: [number, number][];
  weekend_multiplier: number;
}

export interface ZonePrediction {
  zone_id: string;
  zone_name: string;
  lat: number;
  lng: number;
  demand_score: number;
  demand_level: 'LOW' | 'MEDIUM' | 'HIGH';
  predicted_rides_next_30min: number;
  intent_boost: number;
  total_score: number;
  
  // Real-time Geospatial Simulation Parameters
  traffic_state?: {
    congestion_level: 'NONE' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'BLOCKED';
    speed_kmph: number;
    delay_multiplier: number;
    incident_active: boolean;
    incident_type?: string;
    road_name: string;
  };
  weather_metrics?: {
    type: string;
    rain_intensity_pct: number;
    waterlogging_risk: 'NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL';
    demand_multiplier: number;
    fare_multiplier: number;
    safety_advisory: string | null;
  };
  demand_factors?: {
    surge_reason: string;
    expected_wait_mins: number;
    rider_intent_strength: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    destination_hotspot_name: string;
  };
  active_event?: {
    name: string;
    description: string;
    surge_intensity: number;
    type: string;
    expected_riders_count: number;
  } | null;
  captain_density?: {
    competing_count: number;
    saturation_pct: number;
    status: 'OPTIMAL' | 'CROWDED' | 'OVERSATURATED';
  };
  confidence_metrics?: {
    reliability_pct: number;
    stability_rating: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  dispatch_intelligence?: {
    recommended_action: string;
    expected_yield_multiplier: number;
    opportunity_cost_pct: number;
  };
}

export interface HotspotResponse {
  zones: ZonePrediction[];
  generated_at: string;
  peak_zone: string;
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

export interface RecommendedAction {
  zone_name: string;
  action: string;
  reasoning: string;
}

export interface PredictNextResponse {
  predictions: TransitionPrediction[];
  recommended: RecommendedAction;
  updated_at: string;
}

export interface IntentSignal {
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

export interface SignalsSummary {
  total_last_5min: number;
  by_zone: {
    zone_id: string;
    zone_name: string;
    count: number;
    dominant_type: string;
    score: number;
  }[];
  hottest_zone: string;
  recent_events: IntentSignal[];
}

export interface EarningsEstimateResponse {
  current_window: {
    start_time: string;
    end_time: string;
    multiplier: number;
    label: string;
  };
  estimate_min: number;
  estimate_max: number;
  avg_fare_current: number;
  shift_plan: {
    hour_label: string;
    zone_name: string;
    demand_level: 'LOW' | 'MEDIUM' | 'HIGH';
    estimated_earnings: string;
  }[];
  total_shift_estimate: { min: number; max: number };
  tip: string;
}

export interface FuelStation {
  id: string;
  name: string;
  brand: 'IOCL' | 'HP' | 'Shell' | 'BPCL' | 'GAIL';
  lat: number;
  lng: number;
  distance_km: number;
  eta_mins: number;
  fuels: {
    cng?: { price: number; available: boolean };
    petrol?: { price: number; available: boolean };
    diesel?: { price: number; available: boolean };
  };
  address: string;
  rating: number;
  has_queue: 'Low' | 'Medium' | 'High';
}

export interface SimEvent {
  timeLabel: string;
  message: string;
  type: 'weather' | 'traffic' | 'demand' | 'competition' | 'system';
}

export type CaptainProfile = 'aggressive' | 'conservative' | 'eco' | 'airport';

