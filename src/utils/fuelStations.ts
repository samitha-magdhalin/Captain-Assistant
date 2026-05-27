import { FuelStation } from "../types.ts";

export const NEARBY_FUEL_STATIONS: FuelStation[] = [
  {
    id: "fs-1",
    name: "IOCL Petrol & CNG Pump, Koramangala",
    brand: "IOCL",
    lat: 12.9315,
    lng: 77.6220,
    distance_km: 0.5,
    eta_mins: 2,
    fuels: {
      cng: { price: 82.00, available: true },
      petrol: { price: 103.44, available: true },
      diesel: { price: 88.96, available: true }
    },
    address: "80 Feet Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034",
    rating: 4.4,
    has_queue: "Medium"
  },
  {
    id: "fs-2",
    name: "HP Petrol Pump - Fuel Care, HSR Layout",
    brand: "HP",
    lat: 12.9248,
    lng: 77.6322,
    distance_km: 1.4,
    eta_mins: 5,
    fuels: {
      petrol: { price: 103.55, available: true },
      diesel: { price: 89.10, available: true }
    },
    address: "19th Main Rd, Sector 4, HSR Layout, Bengaluru, Karnataka 560102",
    rating: 4.2,
    has_queue: "Low"
  },
  {
    id: "fs-3",
    name: "Shell Fuel Station, Ejipura",
    brand: "Shell",
    lat: 12.9412,
    lng: 77.6288,
    distance_km: 0.8,
    eta_mins: 3,
    fuels: {
      petrol: { price: 109.20, available: true },
      diesel: { price: 94.50, available: true }
    },
    address: "Intermediate Ring Rd, Ejipura, Bengaluru, Karnataka 560047",
    rating: 4.7,
    has_queue: "Low"
  },
  {
    id: "fs-4",
    name: "BPCL CNG & Petrol Station, SG Palya",
    brand: "BPCL",
    lat: 12.9340,
    lng: 77.6080,
    distance_km: 1.8,
    eta_mins: 7,
    fuels: {
      cng: { price: 82.00, available: true },
      petrol: { price: 103.44, available: true },
      diesel: { price: 88.96, available: true }
    },
    address: "Tavarekere Main Rd, SG Palya, Bengaluru, Karnataka 560029",
    rating: 4.1,
    has_queue: "High"
  },
  {
    id: "fs-5",
    name: "Shell Select & Auto Fuel, ORR",
    brand: "Shell",
    lat: 12.9220,
    lng: 77.6210,
    distance_km: 1.5,
    eta_mins: 6,
    fuels: {
      petrol: { price: 109.20, available: true },
      diesel: { price: 94.50, available: true }
    },
    address: "Outer Ring Rd, Koramangala 1st Block, Bengaluru, Karnataka 560034",
    rating: 4.6,
    has_queue: "Low"
  },
  {
    id: "fs-6",
    name: "GAIL Gas CNG Station, HSR Layout",
    brand: "GAIL",
    lat: 12.9150,
    lng: 77.6385,
    distance_km: 2.7,
    eta_mins: 9,
    fuels: {
      cng: { price: 82.00, available: true }
    },
    address: "27th Main Rd, Sector 3, HSR Layout, Bengaluru, Karnataka 560102",
    rating: 4.5,
    has_queue: "Medium"
  }
];
