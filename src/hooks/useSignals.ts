import { useState, useEffect, useRef } from "react";
import { IntentSignal } from "../types.ts";

export function useSignals() {
  const [signals, setSignals] = useState<IntentSignal[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [recentCount, setRecentCount] = useState<number>(0);
  const [hottestZone, setHottestZone] = useState<string>("Koramangala");
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      console.log("[useSignals] Connecting to SSE signals feed...");
      const es = new EventSource("/api/intent-signals/stream");
      eventSourceRef.current = es;

      es.onopen = () => {
        setConnected(true);
        console.log("[useSignals] Connected to signal stream.");
      };

      es.onmessage = (event) => {
        try {
          const signal: IntentSignal = JSON.parse(event.data);
          
          setSignals((prev) => {
            const updated = [signal, ...prev];
            return updated.slice(0, 50); // Keep max 50 signals
          });
        } catch (err) {
          console.error("[useSignals] Error parsing incoming signal:", err);
        }
      };

      es.onerror = (err) => {
        console.error("[useSignals] Stream socket error:", err);
        setConnected(false);
        es.close();

        // Retry connection in 3 seconds
        setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Compute stats on signals: total last 5 minutes & hottest zone
  useEffect(() => {
    const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
    const active = signals.filter((s) => s.timestamp >= fiveMinsAgo);
    setRecentCount(active.length);

    // Group to count hottest zone
    const counts: Record<string, number> = {};
    for (const s of active) {
      counts[s.zone_name] = (counts[s.zone_name] || 0) + 1;
    }

    let maxCount = -1;
    let hotZone = hottestZone;
    for (const zName in counts) {
      if (counts[zName] > maxCount) {
        maxCount = counts[zName];
        hotZone = zName;
      }
    }
    setHottestZone(hotZone);
  }, [signals]);

  return { signals, recentCount, hottestZone, connected };
}
