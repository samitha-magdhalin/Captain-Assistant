import { Router, Request, Response } from "express";
import { ZONES } from "../data/zones.ts";
import { hotspotModel } from "../context.ts";

const router = Router();

router.get("/earnings-estimate", (req: Request, res: Response) => {
  try {
    const hour = req.query.hour !== undefined ? parseInt(req.query.hour as string) : new Date().getHours();
    const zone_id = (req.query.zone_id as string) || "koramangala";
    const shiftHoursRemaining = req.query.shift_hours_remaining !== undefined 
      ? parseFloat(req.query.shift_hours_remaining as string) 
      : 4.0;

    const activeZone = ZONES.find((z) => z.id === zone_id) || ZONES[0];

    // Determine current window profile
    let label = "Regular Shift";
    let multiplier = 1.0;
    let start_time = `${hour}:00`;
    let end_time = `${(hour + 1) % 24}:00`;

    if (hour >= 8 && hour <= 10) {
      label = "Morning Peak";
      multiplier = 1.6;
    } else if (hour >= 12 && hour <= 14) {
      label = "Lunch Time";
      multiplier = 1.25;
    } else if (hour >= 18 && hour <= 21) {
      label = "Evening Peak";
      multiplier = 1.7;
    } else if (hour >= 21 || hour <= 2) {
      label = "Night Time";
      multiplier = 1.4;
    }

    // Bike/auto ride fares inside Bangalore average ₹80-₹150
    const avg_fare_current = Math.round((60 + activeZone.base_demand * 50) * multiplier);

    // Dynamic hourly estimation in INR (₹)
    const baseHourEarnings = 180; // base ₹180/hr
    const estimate_min = Math.round(baseHourEarnings * activeZone.base_demand * multiplier);
    const estimate_max = Math.round(estimate_min * 1.45);

    // Compile upcoming shift plan (one item per hour remaining)
    const shift_plan = [];
    const numSteps = Math.ceil(shiftHoursRemaining);
    let cumulativeMin = 0;
    let cumulativeMax = 0;

    for (let i = 0; i < numSteps; i++) {
      const futureHour = (hour + i) % 24;
      const hourStr = `${futureHour}:00 - ${(futureHour + 1) % 24}:00`;

      // Select recommended zone for this specific future hour slot
      // Find the zone with highest peak potential at this hour
      let bestZone = ZONES[0];
      let maxPeakScore = -1;

      for (const z of ZONES) {
        let isPeakHourSlot = false;
        for (const [start, end] of z.peak_hours) {
          if (futureHour >= start && futureHour <= end) {
            isPeakHourSlot = true;
            break;
          }
        }
        const score = z.base_demand * (isPeakHourSlot ? 1.6 : 1.0);
        if (score > maxPeakScore) {
          maxPeakScore = score;
          bestZone = z;
        }
      }

      // Est hourly earnings for this future zone
      const futureMin = Math.round(baseHourEarnings * bestZone.base_demand * (maxPeakScore > bestZone.base_demand ? 1.5 : 1.0));
      const futureMax = Math.round(futureMin * 1.4);

      cumulativeMin += futureMin;
      cumulativeMax += futureMax;

      shift_plan.push({
        hour_label: hourStr,
        zone_name: bestZone.name,
        demand_level: maxPeakScore > 0.8 ? "HIGH" as const : "MEDIUM" as const,
        estimated_earnings: `₹${futureMin} - ₹${futureMax}`
      });
    }

    const tips = [
      "Carry water and a raincoat. Rain can start suddenly in Indiranagar or Koramangala, meaning more people want quick rides!",
      "Fuel prices are the same today. Adani CNG at Silk Board has shorter lines between 2:00 PM and 4:00 PM.",
      "Tech parks in Whitefield see many people leaving work from 5:30 PM. Stand near Outer Ring Road to get bookings fast.",
      "BTM Layout students book lots of short rides. Working here helps you complete your daily bonus goals quickly.",
      "Silk Board flyover is jammed with traffic. Use back lanes to finish short trips faster."
    ];
    const tip = tips[Math.floor(Date.now() / 86400000) % tips.length]; // stable daily tip

    res.json({
      current_window: { start_time, end_time, multiplier, label },
      estimate_min,
      estimate_max,
      avg_fare_current,
      shift_plan,
      total_shift_estimate: { min: cumulativeMin, max: cumulativeMax },
      tip
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
