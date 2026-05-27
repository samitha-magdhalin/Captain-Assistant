import { IntentSignal } from "../types.ts";
import { SignalCard } from "../components/SignalCard.tsx";
import { Circle, Radio, BatteryCharging } from "lucide-react";
import { useState } from "react";

interface SignalsProps {
  signals: IntentSignal[];
  recentCount: number;
  hottestZone: string;
  connected: boolean;
  byZoneStats: {
    zone_id: string;
    zone_name: string;
    count: number;
    dominant_type: string;
    score: number;
  }[];
}

export function Signals({
  signals,
  recentCount,
  hottestZone,
  connected,
  byZoneStats
}: SignalsProps) {
  const viewableSignals = signals.slice(0, 20); // render top 20

  // Compute stats based on the last 5 minutes of local data to draw the pure CSS bar chart
  const maxZoneCount = Math.max(...byZoneStats.map((z) => z.count), 1);

  // Dominant color utility
  const getColorByDominantType = (type: string) => {
    switch (type) {
      case "price_check":
        return "bg-accent shadow-[0_0_8px_var(--accent-glow-strong)]";
      case "route_preview":
        return "bg-warning shadow-[0_0_8px_var(--accent-glow-strong)]";
      case "booking_attempt":
        return "bg-danger shadow-[0_0_8px_var(--accent-glow-strong)]";
      default:
        return "bg-info shadow-[0_0_8px_var(--accent-glow-strong)]";
    }
  };

  const getLabelByDominantType = (type: string) => {
    switch (type) {
      case "price_check": return "Price Checks";
      case "route_preview": return "Previews";
      case "booking_attempt": return "Bookings";
      default: return "App Opens";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-24 max-w-3xl mx-auto font-sans animate-fade-in select-none">
      
      {/* Title block */}
      <div className="border-b border-border-card/60 pb-4">
        <span className="text-[10px] tracking-widest font-mono text-accent uppercase font-bold">LIVE CUSTOMERS</span>
        <h1 className="text-2xl font-display font-extrabold text-text-primary tracking-tight mt-1">
          Riders Looking for Trips
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          See what nearby passengers are doing on their phones right now to find booking hotspots early.
        </p>
      </div>

      {/* Top summary card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch select-none">
        
        {/* Metric 1 - Total Counter */}
        <div className="card bg-bg-card/90 flex flex-col justify-between py-4 px-5 border-border-card">
          <div>
            <span className="text-[10px] uppercase font-mono text-text-muted tracking-wider block">PASSENGERS LOOKING FOR RIDES</span>
            <div className="text-4xl font-mono font-extrabold text-text-primary mt-1 leading-none tracking-tight">
              {recentCount}
            </div>
          </div>
          <span className="text-[10px] text-text-secondary font-mono mt-2 leading-none block">
            In the last 5 minutes
          </span>
        </div>

        {/* Metric 2 - Live Indicator */}
        <div className="card bg-bg-card/90 flex flex-col justify-between py-4 px-5 border-border-card">
          <div>
            <span className="text-[10px] uppercase font-mono text-text-muted tracking-wider block">LIVE UPDATES</span>
            <div className="flex items-center gap-2 mt-2 leading-none">
              <span className="relative flex h-3 w-3">
                {connected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger/40 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${connected ? "bg-danger" : "bg-text-secondary"}`}></span>
              </span>
              <span className="text-sm font-semibold text-text-primary uppercase font-mono">
                {connected ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-text-secondary font-mono mt-2 leading-none block">
            {connected ? "Connected to live passenger data" : "Connecting..."}
          </span>
        </div>

        {/* Metric 3 - Hottest zone */}
        <div className="card bg-bg-card/90 flex flex-col justify-between py-4 px-5 border-border-card">
          <div>
            <span className="text-[10px] uppercase font-mono text-text-muted tracking-wider block">MAIN BOOKING AREA NOW</span>
            <div className="text-base font-bold text-accent truncate mt-1 leading-tight flex items-center gap-1.5 font-display uppercase">
              <span>🔥</span>
              <span>{hottestZone}</span>
            </div>
          </div>
          <span className="text-[10px] text-text-secondary font-mono mt-2 leading-none block font-semibold">
            Most active area right now
          </span>
        </div>

      </div>

      {/* Legend row (horizontal scroll) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-none border-b border-border-card select-none text-[11px] font-mono text-text-secondary">
        <span className="text-text-muted shrink-0 font-bold uppercase text-[9px] mr-1">WHAT RIDERS ARE DOING:</span>
        <div className="flex items-center gap-1 shrink-0 bg-info/10 border border-info/20 rounded-full px-2.5 py-0.5 text-info font-bold">
          <Circle size={8} className="fill-info border-none" />
          <span>Opened App</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 bg-accent/10 border border-accent/25 rounded-full px-2.5 py-0.5 text-accent font-bold">
          <Circle size={8} className="fill-accent border-none" />
          <span>Checking Price</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 bg-warning/10 border border-warning/20 rounded-full px-2.5 py-0.5 text-warning font-bold">
          <Circle size={8} className="fill-warning border-none" />
          <span>Looking at Routes</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 bg-danger/10 border border-danger/20 rounded-full px-2.5 py-0.5 text-danger font-bold">
          <Circle size={8} className="fill-danger animate-pulse border-none" />
          <span>Trying to Book</span>
        </div>
      </div>

      {/* Live feed */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between pointer-events-none mb-1">
          <span className="text-[10px] font-mono text-text-muted font-bold tracking-wider uppercase">LIVE CUSTOMER ACTIVITY</span>
          <span className="text-[10px] font-mono text-text-muted">Real-time activity</span>
        </div>

        <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
          {viewableSignals.length > 0 ? (
            viewableSignals.map((sig, index) => (
              <SignalCard key={sig.id} signal={sig} isNew={index === 0 && signals.length > 5} />
            ))
          ) : (
            <div className="card text-center py-16 border-border-card bg-bg-card/40 text-text-muted text-xs font-mono flex flex-col items-center justify-center gap-3 select-none">
              <Radio size={24} className="animate-pulse text-text-muted" />
              <span>Getting live details...</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom zone summary (Pure CSS chart) */}
      <div className="card bg-bg-card/90 flex flex-col gap-3">
        <div>
          <span className="text-[10px] font-mono text-text-muted font-bold tracking-wider uppercase">PASSENGERS BY REGION</span>
          <p className="text-xs text-text-secondary mt-0.5 font-mono">
            Total passenger count in each area
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          {[...byZoneStats]
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map((stat) => {
            const pct = Math.round((stat.count / maxZoneCount) * 100);
            const colorClass = getColorByDominantType(stat.dominant_type);
            const dominantLabel = getLabelByDominantType(stat.dominant_type);

            return (
              <div key={stat.zone_id} className="flex flex-col gap-1.5 font-mono text-xs">
                {/* Information row */}
                <div className="flex items-center justify-between text-text-secondary">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary font-sans text-sm">{stat.zone_name}</span>
                    <span className="text-[9px] bg-bg-primary px-2 py-0.5 rounded border border-border-card text-text-muted font-mono font-bold uppercase">
                      Main Action: {dominantLabel}
                    </span>
                  </div>
                  <b className="text-text-primary text-sm">{stat.count} actions</b>
                </div>

                {/* CSS Bar Layer */}
                <div className="w-full bg-bg-primary rounded-full h-3 overflow-hidden border border-border-card p-0.5 flex items-center">
                  {stat.count > 0 ? (
                    <div
                      style={{ width: `${Math.max(6, pct)}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                    />
                  ) : (
                    <span className="text-[9px] text-text-muted ml-2">No active actions recorded</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
