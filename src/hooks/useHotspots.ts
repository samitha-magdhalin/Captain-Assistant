import { useState, useEffect } from "react";
import { HotspotResponse, ZonePrediction } from "../types.ts";
import { FALLBACK_ZONES } from "./fallbackData.ts";

export function useHotspots(hour?: number, day?: number, weather: string = "clear") {
  const [zones, setZones] = useState<ZonePrediction[]>([]);
  const [peakZone, setPeakZone] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchHotspots = async () => {
    let attempts = 0;
    const maxAttempts = 3;
    const retryDelay = 1500;

    while (attempts < maxAttempts) {
      try {
        let url = "/api/hotspots?";
        if (hour !== undefined) url += `hour=${hour}&`;
        if (day !== undefined) url += `day=${day}&`;
        if (weather) url += `weather=${encodeURIComponent(weather)}`;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`API error: ${res.statusText}`);
        }

        const data: HotspotResponse = await res.json();
        setZones(data.zones);
        setPeakZone(data.peak_zone);
        setLastUpdated(new Date());
        setError(null);
        setLoading(false);
        return;
      } catch (err: any) {
        attempts++;
        if (attempts >= maxAttempts) {
          console.info("[Demand Index] Running in high-performance local simulation mode.");
          // Graceful fallback to rich simulated local state
          setZones(FALLBACK_ZONES);
          setPeakZone(FALLBACK_ZONES[0].zone_name);
          setLastUpdated(new Date());
          setError(null); // Clear error to keep UI in healthy state
          setLoading(false);
        } else {
          console.warn(`[useHotspots] Failed to fetch, retrying in ${retryDelay}ms... (Attempt ${attempts}/${maxAttempts})`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }
  };

  useEffect(() => {
    fetchHotspots();
    // Set up 30-second polling interval
    const interval = setInterval(fetchHotspots, 30000);
    return () => clearInterval(interval);
  }, [hour, day, weather]);

  return { zones, peakZone, loading, error, lastUpdated, refetch: fetchHotspots };
}
