export interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'tech_office' | 'nightlife' | 'commercial' | 'highway' | 'residential' | 'residential_tech' | 'IT_corridor';
  base_demand: number;
  peak_hours: [number, number][];
  weekend_multiplier: number;
}

export const ZONES: Zone[] = [
  {
    id: "koramangala",
    name: "Koramangala",
    lat: 12.9352,
    lng: 77.6245,
    type: "tech_office",
    base_demand: 0.8,
    peak_hours: [[8, 10], [18, 21]],
    weekend_multiplier: 1.2
  },
  {
    id: "indiranagar",
    name: "Indiranagar",
    lat: 12.9784,
    lng: 77.6408,
    type: "nightlife",
    base_demand: 0.7,
    peak_hours: [[19, 23], [8, 10]],
    weekend_multiplier: 1.4
  },
  {
    id: "whitefield",
    name: "Whitefield",
    lat: 12.9698,
    lng: 77.7499,
    type: "IT_corridor",
    base_demand: 0.75,
    peak_hours: [[8, 10], [17, 20]],
    weekend_multiplier: 1.0
  },
  {
    id: "mg_road",
    name: "MG Road",
    lat: 12.9757,
    lng: 77.6011,
    type: "commercial",
    base_demand: 0.65,
    peak_hours: [[12, 14], [18, 21]],
    weekend_multiplier: 1.3
  },
  {
    id: "hebbal",
    name: "Hebbal",
    lat: 13.0353,
    lng: 77.5975,
    type: "highway",
    base_demand: 0.5,
    peak_hours: [[7, 9], [17, 19]],
    weekend_multiplier: 1.1
  },
  {
    id: "btm_layout",
    name: "BTM Layout",
    lat: 12.9166,
    lng: 77.6101,
    type: "residential_tech",
    base_demand: 0.7,
    peak_hours: [[8, 10], [19, 21]],
    weekend_multiplier: 1.3
  },
  {
    id: "jp_nagar",
    name: "JP Nagar",
    lat: 12.9102,
    lng: 77.5847,
    type: "residential",
    base_demand: 0.45,
    peak_hours: [[9, 11], [16, 19]],
    weekend_multiplier: 1.5
  },
  {
    id: "marathahalli",
    name: "Marathahalli",
    lat: 12.9591,
    lng: 77.6974,
    type: "IT_corridor",
    base_demand: 0.75,
    peak_hours: [[8, 10], [18, 20]],
    weekend_multiplier: 1.1
  },
  {
    id: "silk_board",
    name: "Silk Board",
    lat: 12.9176,
    lng: 77.6228,
    type: "highway",
    base_demand: 0.8,
    peak_hours: [[8, 10], [17, 20]],
    weekend_multiplier: 1.1
  },
  {
    id: "electronic_city",
    name: "Electronic City",
    lat: 12.8445,
    lng: 77.6602,
    type: "tech_office",
    base_demand: 0.6,
    peak_hours: [[8, 10], [17, 19]],
    weekend_multiplier: 1.0
  }
];
