import { Router, Request, Response } from "express";
import { markovPredictor, hotspotModel, intentScorer } from "../context.ts";
import { ZONES } from "../data/zones.ts";
import { GoogleGenAI } from "@google/genai";

const router = Router();

// Lazy initialization of Gemini client to prevent crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Dynamic localized Bengaluru driver advisor fallback engine
function generateLocalCoaching(
  zoneId: string,
  zoneName: string,
  timeLabel: string,
  confidence: number,
  distance: number,
  isWeekend: boolean,
  hour: number
): { action: string; reasoning: string } {
  const normId = String(zoneId || "").toLowerCase();
  let action = `Go to ${zoneName}`;
  let reasoning = `During ${timeLabel}, there is a ${confidence}% chance of getting a ride in ${zoneName} (${distance}km away).`;

  if (normId.includes("koramangala")) {
    action = "Go to Sony World Junction";
    reasoning = `Many office workers are leaving near Wipro Park. Use the back streets to avoid heavy traffic on main roads and get rides faster.`;
  } else if (normId.includes("indiranagar")) {
    action = isWeekend ? "Wait near 100ft Road Cafes" : "Go to Indiranagar Metro Station";
    reasoning = isWeekend 
      ? `Lots of people are out near 100 Feet Road restaurants. Stand near there to get quick, good bookings.`
      : `People are leaving the metro station now and want rapid bike rides. Many bookings are waiting.`;
  } else if (normId.includes("whitefield")) {
    action = "Stand near ITPL Gate 3";
    reasoning = `Office workers are leaving shift now. Use back-roads to avoid major traffic jams on main lanes.`;
  } else if (normId.includes("mg_road") || normId.includes("mg road")) {
    action = "Wait at Brigade Road Corner";
    reasoning = `Many people are coming out of MG Road Metro and offices. Excellent spot for quick and easy short rides.`;
  } else if (normId.includes("hebbal")) {
    action = "Stay near Esteem Mall Junction";
    reasoning = `People leaving buses and the Hebbal flyover need local rides. Lots of steady travel requests are coming in.`;
  } else if (normId.includes("btm")) {
    action = "Go to BTM 2nd Stage Hub";
    reasoning = `Students and young workers are booking dinner rides near PG buildings. Great place to get quick consecutive bookings.`;
  } else if (normId.includes("jp_nagar") || normId.includes("jp nagar")) {
    action = "Go to JP Nagar Metro Exit";
    reasoning = `Metro riders are facing bus delays. Stand near the main apartments for regular, easy bookings.`;
  } else if (normId.includes("marathahalli")) {
    action = "Go near Marathahalli Bridge";
    reasoning = `Many people are leaving offices and movie halls near here. Wait by the bridge to get longer, high-paying bookings.`;
  } else if (normId.includes("silk_board") || normId.includes("silk board")) {
    action = "Bypass main road at Silk Board";
    reasoning = `Heavy traffic jam at Silk Board. Commuters want bike-taxis to escape the crawl quickly.`;
  } else if (normId.includes("electronic")) {
    action = "Wait near Infosys Gate 1";
    reasoning = `Workers are heading home towards the tollway. Great spot to catch longer, higher-paying trips.`;
  }

  return { action, reasoning };
}

router.get("/predict-next", async (req: Request, res: Response) => {
  try {
    const currentZoneId = (req.query.current_zone as string) || "koramangala";
    const driverId = (req.query.driver_id as string) || "DRIVER_001";

    const currentZone = ZONES.find((z) => z.id === currentZoneId) || ZONES[0];

    // Compute transition probabilities from Markov Predictor
    const predictions = markovPredictor.predict(currentZone.id, currentZone.lat, currentZone.lng);

    // Grab top prediction zone
    const topPredicted = predictions[0] || {
      zone_name: "Indiranagar",
      zone_id: "indiranagar",
      confidence_pct: 75,
      distance_km: 3.2
    };

    // Calculate dynamic features for recommended reasoning
    const hour = new Date().getHours();
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    const timeLabel = hour >= 7 && hour <= 11 ? "Morning Peak" : hour >= 17 && hour <= 21 ? "Evening Peak" : "Regular Hours";

    // Standard rule-based fallback (highly localized to Bengaluru)
    const localCoaching = generateLocalCoaching(
      topPredicted.zone_id || topPredicted.zone_name,
      topPredicted.zone_name,
      timeLabel,
      topPredicted.confidence_pct,
      topPredicted.distance_km,
      isWeekend,
      hour
    );

    let recommended = {
      zone_name: topPredicted.zone_name,
      action: localCoaching.action,
      reasoning: localCoaching.reasoning
    };

    // Use Gemini for a high-quality recommendations if API key is present!
    const client = getGeminiClient();
    if (client) {
      try {
        const prompt = `You are a real-time smart advisor for bike taxi and auto drivers in Bengaluru.
Provide a hyper-targeted 2-sentence driver recommendation. Use extremely simple, clear, and basic words. Do not use complex technical terms, jargon, or fancy vocabulary.
Here is the context:
- Driver location: ${currentZone.name}
- Top predicted next demand zone based on historical order patterns: ${topPredicted.zone_name} (Distance: ${topPredicted.distance_km} km)
- Current hour of day: ${hour}:00
- Operational Peak: ${timeLabel}
- Is Weekend: ${isWeekend}

Generate a JSON object matching this schema:
{
  "zone_name": "${topPredicted.zone_name}",
  "action": "Brief action (keep under 7 simple words)",
  "reasoning": "A 2-sentence simple advice of why to move to ${topPredicted.zone_name}, mentioning Bangalore specific driver insights in extremely plain, simple language."
}`;

        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.7
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          if (parsed.action && parsed.reasoning) {
            recommended = {
              zone_name: parsed.zone_name || topPredicted.zone_name,
              action: parsed.action,
              reasoning: parsed.reasoning
            };
          }
        }
      } catch (geminiErr: any) {
        const errorMsg = geminiErr && typeof geminiErr === "object" ? JSON.stringify(geminiErr) : String(geminiErr);
        if (errorMsg.includes("PERMISSION_DENIED") || errorMsg.includes("403") || errorMsg.includes("denied access")) {
          // Suppress verbose stack trace logs to console for restricted key or permission errors
          console.log(`[Predictions Router] Gemini API: project restricted or permission denied (403). Using high-quality Bengaluru dynamic rule advisor.`);
        } else if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("quota") || errorMsg.includes("Quota exceeded")) {
          // Suppress verbose billing or quota limit warning logs
          console.log(`[Predictions Router] Gemini API: quota limit exceeded or rate limited (429). Using high-quality Bengaluru dynamic rule advisor.`);
        } else {
          console.warn("[Predictions Router] Gemini API call skipped or failed. Using dynamic fallback:", geminiErr);
        }
      }
    }

    res.json({
      predictions,
      recommended,
      updated_at: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
