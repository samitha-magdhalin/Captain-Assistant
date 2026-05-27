import { Router, Request, Response } from "express";
import { hotspotModel, intentScorer } from "../context.ts";

const router = Router();

router.get("/hotspots", (req: Request, res: Response) => {
  try {
    const hour = req.query.hour !== undefined ? parseInt(req.query.hour as string) : new Date().getHours();
    const day = req.query.day !== undefined ? parseInt(req.query.day as string) : new Date().getDay();
    const weather = (req.query.weather as string) || "clear";
    const isWeekend = day === 0 || day === 6;

    // Get real-time intent boosts from IntentScorer
    const intentScores = intentScorer.get_all_scores();
    const intentBoosts: Record<string, number> = {};
    for (const zone_id in intentScores) {
      intentBoosts[zone_id] = intentScorer.get_demand_boost(zone_id);
    }

    // Predict all zones demand scores
    const zonesPredictions = hotspotModel.predict_all_zones(hour, day, isWeekend, weather, intentBoosts);

    // Identify Peak Zone
    let maxScore = -1;
    let peakZoneName = "Koramangala";
    for (const zp of zonesPredictions) {
      if (zp.total_score > maxScore) {
        maxScore = zp.total_score;
        peakZoneName = zp.zone_name;
      }
    }

    res.json({
      zones: zonesPredictions,
      generated_at: new Date().toISOString(),
      peak_zone: peakZoneName
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
