import { Router, Request, Response } from "express";
import { intentScorer } from "../context.ts";
import { generate_intent_event, IntentEventData } from "../utils/sse.ts";
import { ZONES } from "../data/zones.ts";

const router = Router();

// Store a list of the last 100 events globally on the server so that the "summary" endpoint has historic records!
const sseHistory: IntentEventData[] = [];

// Helper to push to history and intent scorer
export function recordSignalEvent(event: IntentEventData) {
  sseHistory.push(event);
  if (sseHistory.length > 200) {
    sseHistory.shift(); // keep sliding window
  }
  // Feed into the IntentScorer model
  intentScorer.add_event(event.zone_id, event.event_type, event.timestamp);
}

// 1. SSE Connection stream endpoint
router.get("/intent-signals/stream", (req: Request, res: Response) => {
  // Set up SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // Establish the stream

  console.log("[Signals SSE] New driver signal client connected.");

  // Generate initial events quickly to pre-populate map
  for (let i = 0; i < 5; i++) {
    const event = generate_intent_event();
    // backdate them slightly
    event.timestamp = Date.now() - (4 - i) * 60 * 1000;
    recordSignalEvent(event);
  }

  // Set up periodic generator every 2 to 4 seconds
  let timerId: NodeJS.Timeout | null = null;
  
  const sendEvent = () => {
    try {
      const event = generate_intent_event();
      recordSignalEvent(event);

      // Write SSE format
      res.write(`data: ${JSON.stringify(event)}\n\n`);
      
      // Schedule next event with random interval of 2-4 seconds
      const nextDelay = Math.floor(Math.random() * 2000) + 2000;
      timerId = setTimeout(sendEvent, nextDelay);
    } catch (err) {
      console.error("[Signals SSE] Error writing to stream:", err);
    }
  };

  // Start the stream
  sendEvent();

  // Clean up on connection close
  req.on("close", () => {
    if (timerId) {
      clearTimeout(timerId);
    }
    console.log("[Signals SSE] Client disconnected from signal stream.");
  });
});

// 2. Summary stats for last 5 minutes
router.get("/intent-signals/summary", (req: Request, res: Response) => {
  try {
    const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
    const recentEvents = sseHistory.filter((e) => e.timestamp >= fiveMinsAgo);

    // Group events by zone
    const zoneMap: Record<string, { count: number; types: Record<string, number> }> = {};

    for (const z of ZONES) {
      zoneMap[z.id] = { count: 0, types: { app_open: 0, price_check: 0, route_preview: 0, booking_attempt: 0 } };
    }

    for (const event of recentEvents) {
      if (!zoneMap[event.zone_id]) {
        zoneMap[event.zone_id] = { count: 0, types: { app_open: 0, price_check: 0, route_preview: 0, booking_attempt: 0 } };
      }
      zoneMap[event.zone_id].count++;
      zoneMap[event.zone_id].types[event.event_type] = (zoneMap[event.zone_id].types[event.event_type] || 0) + 1;
    }

    const by_zone = ZONES.map((zone) => {
      const zData = zoneMap[zone.id];
      // Determine dominant event type
      let dominant_type = "app_open";
      let maxCount = -1;
      for (const t in zData.types) {
        if (zData.types[t] > maxCount) {
          maxCount = zData.types[t];
          dominant_type = t;
        }
      }

      const score = intentScorer.get_zone_score(zone.id);

      return {
        zone_id: zone.id,
        zone_name: zone.name,
        count: zData.count,
        dominant_type,
        score: parseFloat(score.toFixed(2))
      };
    }).sort((a, b) => b.count - a.count);

    // Identify Hottest Zone
    const hottest_zone = by_zone[0]?.zone_name || "Koramangala";

    // Grab the last 20 events in reverse order (newest first)
    const recent_events = [...sseHistory].reverse().slice(0, 20);

    res.json({
      total_last_5min: recentEvents.length,
      by_zone,
      hottest_zone,
      recent_events
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
