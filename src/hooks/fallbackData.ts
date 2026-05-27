import { ZonePrediction, TransitionPrediction, EarningsEstimateResponse } from "../types.ts";

export const FALLBACK_ZONES: ZonePrediction[] = [
  {
    zone_id: "koramangala",
    zone_name: "Koramangala",
    lat: 12.9352,
    lng: 77.6245,
    demand_score: 9.2,
    demand_level: "HIGH",
    predicted_rides_next_30min: 42,
    intent_boost: 0.8,
    total_score: 10.0
  },
  {
    zone_id: "indiranagar",
    zone_name: "Indiranagar",
    lat: 12.9718,
    lng: 77.6411,
    demand_score: 8.7,
    demand_level: "HIGH",
    predicted_rides_next_30min: 36,
    intent_boost: 0.5,
    total_score: 9.2
  },
  {
    zone_id: "whitefield",
    zone_name: "Whitefield",
    lat: 12.9698,
    lng: 77.7500,
    demand_score: 7.9,
    demand_level: "HIGH",
    predicted_rides_next_30min: 28,
    intent_boost: 0.3,
    total_score: 8.2
  },
  {
    zone_id: "mg_road",
    zone_name: "MG Road",
    lat: 12.9733,
    lng: 77.6085,
    demand_score: 7.5,
    demand_level: "MEDIUM",
    predicted_rides_next_30min: 22,
    intent_boost: 0.2,
    total_score: 7.7
  },
  {
    zone_id: "electronic_city",
    zone_name: "Electronic City",
    lat: 12.8452,
    lng: 77.6602,
    demand_score: 6.8,
    demand_level: "MEDIUM",
    predicted_rides_next_30min: 18,
    intent_boost: 0.4,
    total_score: 7.2
  },
  {
    zone_id: "hsr_layout",
    zone_name: "HSR Layout",
    lat: 12.9116,
    lng: 77.6388,
    demand_score: 8.1,
    demand_level: "HIGH",
    predicted_rides_next_30min: 31,
    intent_boost: 0.4,
    total_score: 8.5
  },
  {
    zone_id: "marathahalli",
    zone_name: "Marathahalli",
    lat: 12.9562,
    lng: 77.7019,
    demand_score: 7.2,
    demand_level: "MEDIUM",
    predicted_rides_next_30min: 19,
    intent_boost: 0.2,
    total_score: 7.4
  }
];

export const FALLBACK_PREDICTIONS: TransitionPrediction[] = [
  {
    zone_id: "indiranagar",
    zone_name: "Indiranagar",
    lat: 12.9718,
    lng: 77.6411,
    probability: 0.45,
    confidence_pct: 78,
    distance_km: 4.8,
    eta_mins: 12,
    direction: "North-East"
  },
  {
    zone_id: "hsr_layout",
    zone_name: "HSR Layout",
    lat: 12.9116,
    lng: 77.6388,
    probability: 0.32,
    confidence_pct: 64,
    distance_km: 2.9,
    eta_mins: 8,
    direction: "South"
  },
  {
    zone_id: "mg_road",
    zone_name: "MG Road",
    lat: 12.9733,
    lng: 77.6085,
    probability: 0.18,
    confidence_pct: 42,
    distance_km: 5.2,
    eta_mins: 15,
    direction: "North-West"
  }
];

export const FALLBACK_RECOMMENDED = {
  zone_name: "Indiranagar",
  action: "Wait near 100ft Road Cafes",
  reasoning: "High smartphone app openings recorded near Indiranagar restaurants. Expect multiple high-fare bookings over the next 15 minutes as cafes and retail stores report increased guest footfalls."
};

export const FALLBACK_EARNINGS: EarningsEstimateResponse = {
  current_window: {
    start_time: "14:00",
    end_time: "15:00",
    multiplier: 1.3,
    label: "Mid-Day Surge"
  },
  estimate_min: 180,
  estimate_max: 270,
  avg_fare_current: 125,
  shift_plan: [
    { hour_label: "14:00 - 15:00", zone_name: "Koramangala", demand_level: "HIGH", estimated_earnings: "₹180 - ₹270" },
    { hour_label: "15:00 - 16:00", zone_name: "HSR Layout", demand_level: "MEDIUM", estimated_earnings: "₹140 - ₹190" },
    { hour_label: "16:00 - 17:00", zone_name: "Indiranagar", demand_level: "HIGH", estimated_earnings: "₹220 - ₹290" },
    { hour_label: "17:00 - 18:00", zone_name: "Indiranagar", demand_level: "HIGH", estimated_earnings: "₹250 - ₹340" }
  ],
  total_shift_estimate: { min: 790, max: 1090 },
  tip: "Position yourself near major IT parks where lunch crowds are departing to double your hourly conversion rate."
};
