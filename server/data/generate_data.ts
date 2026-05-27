import * as fs from "fs";
import * as path from "path";
import { ZONES, Zone } from "./zones.ts";

// Helper to get raw hour and day weights
function getBaseZoneWeight(zone: Zone, hour: number, isWeekend: boolean, weather: 'clear' | 'cloudy' | 'rain'): number {
  let weight = zone.base_demand;

  // Check peak hours
  let inPeak = false;
  for (const [start, end] of zone.peak_hours) {
    if (hour >= start && hour <= end) {
      inPeak = true;
      break;
    }
  }

  if (inPeak) {
    weight *= 1.6;
  }

  // Weather impact
  if (weather === 'rain') {
    if (zone.type === 'commercial' || zone.type === 'nightlife') {
      weight *= 1.3;
    } else {
      weight *= 1.1;
    }
  } else if (weather === 'cloudy') {
    weight *= 1.05;
  }

  // Weekend multipliers
  if (isWeekend) {
    if (zone.type === 'residential' || zone.type === 'residential_tech') {
      weight *= 1.5;
    } else {
      weight *= zone.weekend_multiplier;
    }
  }

  return Math.min(1.0, Math.max(0.05, weight));
}

export function generateDataFiles() {
  const dataDir = path.resolve(process.cwd(), "server/data_storage");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const ridesPath = path.join(dataDir, "rides.csv");
  const historyPath = path.join(dataDir, "driver_history.json");

  // Check if they already exist
  if (fs.existsSync(ridesPath) && fs.existsSync(historyPath)) {
    console.log("[Data Generator] All synthetic files already exist in server/data_storage.");
    return;
  }

  console.log("[Data Generator] Creating synthetic Bengaluru ride dataset (10,000 rows)...");

  const weathers: ('clear' | 'cloudy' | 'rain')[] = ['clear', 'cloudy', 'rain'];
  const weatherWeights = [0.7, 0.2, 0.1]; // 70% clear, 20% cloudy, 10% rain

  // Weighted weather selection helper
  function randomWeather() {
    const r = Math.random();
    if (r < 0.7) return 'clear';
    if (r < 0.9) return 'cloudy';
    return 'rain';
  }

  const csvRows: string[] = [];
  csvRows.push("timestamp,driver_id,pickup_zone,dropoff_zone,fare,duration_mins,distance_km,hour,day_of_week,is_weekend,weather,demand_score");

  const startTime = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days ago

  for (let i = 0; i < 10000; i++) {
    // Distribute timestamps over the last 30 days
    const rowTime = startTime + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
    const date = new Date(rowTime);
    const hour = date.getHours();
    const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    const weather = randomWeather();

    // Select pickup zone based on peak weights
    const zoneWeights = ZONES.map((z) => ({
      zone: z,
      w: getBaseZoneWeight(z, hour, isWeekend, weather)
    }));

    const totalZoneWeight = zoneWeights.reduce((sum, item) => sum + item.w, 0);
    let rZone = Math.random() * totalZoneWeight;
    let pickupZone: Zone = ZONES[0];

    for (const item of zoneWeights) {
      rZone -= item.w;
      if (rZone <= 0) {
        pickupZone = item.zone;
        break;
      }
    }

    // Select dropoff zone (must be different)
    const candidates = ZONES.filter((z) => z.id !== pickupZone.id);
    const dropoffZone = candidates[Math.floor(Math.random() * candidates.length)];

    // Distance in km (e.g., Koramangala to Indiranagar is ~5-8km)
    // Add noise
    const latDiff = Math.abs(pickupZone.lat - dropoffZone.lat);
    const lngDiff = Math.abs(pickupZone.lng - dropoffZone.lng);
    const directDist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // simple km conversion
    const distKm = parseFloat(Math.max(1.2, directDist * (1.1 + Math.random() * 0.4)).toFixed(2));

    // Ride duration (average 18 km/h in traffic)
    const durationMins = Math.ceil((distKm / 18) * 60 + Math.random() * 8);

    // Demand score
    const demandBase = getBaseZoneWeight(pickupZone, hour, isWeekend, weather);
    const demandScore = parseFloat(Math.min(1.0, demandBase * (0.8 + Math.random() * 0.4)).toFixed(3));

    // Fare = base 30 + (distance_km * 12) + (demand_score * 20)
    const randDriver = `DRIVER_${String(100 + Math.floor(Math.random() * 300))}`;
    const fare = Math.round(30 + distKm * 12 + demandScore * 20);

    csvRows.push(
      `${date.toISOString()},${randDriver},${pickupZone.id},${dropoffZone.id},${fare},${durationMins},${distKm},${hour},${dayOfWeek},${isWeekend ? 1 : 0},${weather},${demandScore}`
    );
  }

  fs.writeFileSync(ridesPath, csvRows.join("\n"), "utf-8");
  console.log(`[Data Generator] Successfully created ${ridesPath}`);

  // Generate 500 transitions for DRIVER_001 history
  console.log("[Data Generator] Creating 500 orders of transition history for DRIVER_001...");
  const driverHistory: { pickup_zone: string; dropoff_zone: string; hour: number }[] = [];

  for (let i = 0; i < 500; i++) {
    const hour = Math.floor(Math.random() * 24);
    let pickup = "";
    let dropoff = "";

    // Realistic patterns with 10% random noise
    if (Math.random() < 0.1) {
      // Noise component
      pickup = ZONES[Math.floor(Math.random() * ZONES.length)].id;
      dropoff = ZONES.filter((z) => z.id !== pickup)[Math.floor(Math.random() * (ZONES.length - 1))].id;
    } else {
      if (hour >= 6 && hour <= 10) {
        // Morning (6-10am): Electronic City → Koramangala → Whitefield → Marathahalli loop
        const loop = ["electronic_city", "koramangala", "whitefield", "marathahalli"];
        const idx = Math.floor(Math.random() * loop.length);
        pickup = loop[idx];
        dropoff = loop[(idx + 1) % loop.length];
      } else if (hour >= 11 && hour <= 14) {
        // Afternoon (11am-2pm): MG Road → Indiranagar → Koramangala loop
        const loop = ["mg_road", "indiranagar", "koramangala"];
        const idx = Math.floor(Math.random() * loop.length);
        pickup = loop[idx];
        dropoff = loop[(idx + 1) % loop.length];
      } else if (hour >= 17 && hour <= 21) {
        // Evening (5-9pm): BTM Layout → Silk Board → Koramangala → Indiranagar loop
        const loop = ["btm_layout", "silk_board", "koramangala", "indiranagar"];
        const idx = Math.floor(Math.random() * loop.length);
        pickup = loop[idx];
        dropoff = loop[(idx + 1) % loop.length];
      } else {
        // Night (9pm+): Indiranagar → MG Road → Koramangala loop
        const loop = ["indiranagar", "mg_road", "koramangala"];
        const idx = Math.floor(Math.random() * loop.length);
        pickup = loop[idx];
        dropoff = loop[(idx + 1) % loop.length];
      }
    }

    driverHistory.push({
      pickup_zone: pickup,
      dropoff_zone: dropoff,
      hour
    });
  }

  fs.writeFileSync(historyPath, JSON.stringify(driverHistory, null, 2), "utf-8");
  console.log(`[Data Generator] Successfully created ${historyPath}`);
}
