import { ZonePrediction } from "../types.ts";
import { TrendingUp, Flame, Users, Zap } from "lucide-react";

interface ZoneCardProps {
  zone: ZonePrediction;
  rank: number;
  onClick?: () => void;
  key?: string | number;
}

export function ZoneCard({ zone, rank, onClick }: ZoneCardProps) {
  const isHigh = zone.demand_level === "HIGH";
  const isMedium = zone.demand_level === "MEDIUM";

  // Class styles based on demand level
  const borderStyle = isHigh
    ? "border-red-500/40 hover:border-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.1)]"
    : isMedium
    ? "border-accent/40 hover:border-accent shadow-[0_4px_12px_var(--accent-glow)]"
    : "border-border-card hover:border-slate-700";

  const badgeStyle = isHigh
    ? "bg-danger/10 text-danger border border-danger/30"
    : isMedium
    ? "bg-accent/10 text-accent border border-accent/20"
    : "bg-bg-primary text-text-secondary border border-border-card";

  const rankEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;

  return (
    <div
      id={`zone-card-${zone.zone_id}`}
      onClick={onClick}
      className={`card flex flex-col justify-between border cursor-pointer hover:-translate-y-[2px] transition-all duration-300 ${borderStyle} ${
        onClick ? "active:scale-[0.98]" : ""
      }`}
    >
      <div>
        {/* Row 1 — Rank, Name, Level */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg filter drop-shadow font-mono font-bold select-none">
              {rankEmoji}
            </span>
            <h4 className="font-display font-semibold text-text-primary tracking-tight text-[15px]">
              {zone.zone_name}
            </h4>
          </div>
          <span className={`badge shrink-0 ${badgeStyle}`}>
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isHigh ? "bg-danger" : isMedium ? "bg-accent" : "bg-text-secondary"
              }`}
            ></span>
            {zone.demand_level}
          </span>
        </div>

        {/* Row 2 — Metric items */}
        <div className="grid grid-cols-2 gap-2 mb-3 bg-bg-primary/55 rounded-lg p-2 border border-border-card">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-mono tracking-wider text-text-muted">
              Estimated Bookings
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <Zap size={13} className="text-accent" />
              <span className="text-xs font-semibold text-text-primary font-mono">
                ~{zone.predicted_rides_next_30min} trips
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-mono tracking-wider text-text-muted">
              Passengers Waiting
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <Flame size={13} className="text-danger" />
              <span className="text-xs font-semibold text-text-primary font-mono">
                +{Math.round(zone.intent_boost * 20)} riders
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 — Visual Mini Score Bar */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-text-secondary">
          <span>Passenger Crowdedness</span>
          <span className="text-text-primary font-bold">{Math.round(zone.total_score * 100)}%</span>
        </div>
        <div className="w-full bg-bg-primary rounded-full h-1.5 overflow-hidden">
          <div
            style={{ width: `${zone.total_score * 100}%` }}
            className={`h-full rounded-full ${
              isHigh ? "bg-danger" : isMedium ? "bg-accent" : "bg-text-secondary"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
}
