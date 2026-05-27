import { ZonePrediction, TransitionPrediction, RecommendedAction, EarningsEstimateResponse } from "../types.ts";
import { formatINR, formatDistance, formatETA, formatShiftDuration } from "../utils/formatters.ts";
import { ConfidenceBar } from "../components/ConfidenceBar.tsx";
import { ZoneCard } from "../components/ZoneCard.tsx";
import { EarningsTrendChart } from "../components/EarningsTrendChart.tsx";
import { TrendingUp, Landmark, ShieldCheck, ArrowRight, Compass, Navigation2, Sparkles, Clock, Calendar, ShieldAlert, Award } from "lucide-react";

interface DashboardProps {
  zones: ZonePrediction[];
  predictions: TransitionPrediction[];
  recommended: RecommendedAction | null;
  estimate: EarningsEstimateResponse | null;
  shiftDuration: number;
  todayEarnings: number;
  rideCount: number;
  onTabChange: (tab: 'map' | 'dashboard' | 'signals') => void;
  loading: boolean;
}

export function Dashboard({
  zones,
  predictions,
  recommended,
  estimate,
  shiftDuration,
  todayEarnings,
  rideCount,
  onTabChange,
  loading
}: DashboardProps) {
  // Sort zones descending by score for rankings
  const rankedZones = [...zones].sort((a, b) => b.total_score - a.total_score).slice(0, 3);
  
  const heroPrediction = predictions[0];
  const secondaryPredictions = predictions.slice(1, 3);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-24 max-w-6xl mx-auto font-sans animate-fade-in select-none">
      
      {/* Top Banner Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-card/60 pb-5">
        <div>
          <span className="text-[10px] tracking-widest font-mono text-accent uppercase font-bold">CAPTAIN GUIDE</span>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-text-primary tracking-tight mt-1">
            Rides & Earnings Helper
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-sans">
            See where passengers are waiting and how to make more money today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {estimate && (
            <div className="badge bg-success/10 text-success border border-success/20 py-1.5 px-3 rounded-lg font-mono text-xs font-bold shadow-sm">
              ✨ SURGE PRICE ACTIVE (+{(estimate.current_window.multiplier * 100 - 100).toFixed(0)}%)
            </div>
          )}
        </div>
      </div>

      {/* Main 12-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT SIDEBAR COLUMN: QUICK METRICS & SHIFT PLANNING (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-6">
          
          {/* Quick Metrics HUD Panel */}
          <div className="card bg-bg-card/90 border border-border-card p-5 relative overflow-hidden flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border-card/40 pb-3">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-bold">
                MY DAILY TRIP SUMMARY
              </span>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/40"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                <span className="text-[9px] font-mono text-success uppercase font-bold">LIVE</span>
              </div>
            </div>

            {/* Shift metrics list list */}
            <div className="flex flex-col gap-3.5">
              
              {/* Working Clock */}
              <div className="flex items-center justify-between bg-bg-primary/50 p-2.5 rounded-xl border border-border-card/30">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-accent/10 rounded-lg text-accent">
                    <Clock size={15} />
                  </div>
                  <div>
                    <span className="text-[9px] text-text-muted font-mono uppercase block leading-none">WORK TIME TODAY</span>
                    <span className="text-sm font-bold font-mono text-text-primary mt-1 block leading-none">
                      {formatShiftDuration(shiftDuration)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Today Earnings Accrued */}
              <div className="flex items-center justify-between bg-success/5 p-2.5 rounded-xl border border-success/15">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-success/10 rounded-lg text-success">
                    <Landmark size={15} />
                  </div>
                  <div>
                    <span className="text-[9px] text-success/80 font-mono uppercase block leading-none">MY EARNINGS TODAY</span>
                    <span className="text-sm font-extrabold font-mono text-success mt-1 block leading-none">
                      {formatINR(todayEarnings)}
                    </span>
                  </div>
                </div>
                <div className="badge bg-success/10 text-success border border-success/20 text-[9px]">
                  EARNED
                </div>
              </div>

              {/* Ride Total counts */}
              <div className="flex items-center justify-between bg-bg-primary/50 p-2.5 rounded-xl border border-border-card/30">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-accent/10 rounded-lg text-accent">
                    <Award size={15} />
                  </div>
                  <div>
                    <span className="text-[9px] text-text-muted font-mono uppercase block leading-none">COMPLETED RIDES</span>
                    <span className="text-sm font-bold font-mono text-text-primary mt-1 block leading-none">
                      {rideCount} Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Commission Ratio HUD */}
              <div className="flex items-center justify-between bg-bg-primary/50 p-2.5 rounded-xl border border-border-card/30">
                <span className="text-[10px] font-mono text-text-muted uppercase">PLATFORMcommission</span>
                <span className="badge bg-accent/10 text-accent border border-accent/20 text-[9px] font-bold">
                  15% fee already deducted
                </span>
              </div>

            </div>
          </div>

          {/* Earnings range estimator stats indicator panel */}
          {estimate && (
            <div className="card bg-bg-card/90 border border-border-card p-5 flex flex-col gap-3">
              <div>
                <span className="text-[10px] font-mono text-text-muted uppercase block leading-none">CURRENT SHIFT TIME SLOT</span>
                <p className="text-xs font-bold font-mono text-success mt-1 uppercase leading-none">
                  {estimate.current_window.label}
                </p>
              </div>

              {/* Big central figure range */}
              <div className="bg-bg-primary/60 rounded-2xl px-4 py-5 border border-border-card text-center relative overflow-hidden shadow-sm">
                <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-accent/5 rounded-full blur-xl pointer-events-none"></div>
                <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider block">EXPECTED HOURLY PAY</span>
                <div className="text-2xl font-display font-extrabold text-accent mt-1 tracking-tight">
                  ₹{estimate.estimate_min} — ₹{estimate.estimate_max} <span className="text-xs text-text-secondary font-mono font-normal">/hour</span>
                </div>
                <span className="text-[9px] font-mono text-text-muted block mt-1.5 leading-tight">
                  Based on traffic and how busy it is right now
                </span>
              </div>

              {/* Surging indicator */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-text-secondary mb-1 leading-none">
                  <span>Extra Surge Rate</span>
                  <span className="text-success font-bold">+{(estimate.current_window.multiplier * 100 - 100).toFixed(0)}% Surge</span>
                </div>
                <div className="h-2 w-full bg-bg-primary rounded-full overflow-hidden border border-border-card p-[1px]">
                  <div
                    style={{ width: `${Math.min(100, estimate.current_window.multiplier * 60)}%` }}
                    className="h-full bg-success rounded-full transition-all"
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* 4-Hour shift timeline selector planner */}
          {estimate && (
            <div className="card bg-bg-card/90 border border-border-card p-4">
              <span className="text-[10px] font-mono text-text-muted font-bold uppercase tracking-wider block mb-4">
                🎯 4-HOUR RIDE PLAN
              </span>
              
              <div className="flex flex-col gap-3 relative">
                {/* Vertical Timeline wire thread anchor */}
                <div className="absolute left-2.5 top-2.5 bottom-3.5 w-[1px] bg-border-card/80"></div>

                {estimate.shift_plan.map((slot, index) => {
                  const isHigh = slot.demand_level === "HIGH";
                  const demandBadge = isHigh
                    ? "bg-danger/10 text-danger border border-danger/20"
                    : "bg-accent/10 text-accent border border-accent/20";

                  return (
                    <div key={index} className="flex items-start gap-3.5 text-xs font-mono pl-5 relative mt-0.5">
                      {/* Node Circle */}
                      <span className={`absolute left-2 top-2 h-1.5 w-1.5 rounded-full ring-4 ring-bg-card ${
                        isHigh ? "bg-danger" : "bg-accent"
                      }`}></span>

                      <div className="flex-1 bg-bg-primary/20 hover:bg-bg-primary/45 border border-border-card/65 px-3 py-2.5 rounded-xl flex items-center justify-between transition-all">
                        <div className="min-w-0 pr-2">
                          <p className="text-[9px] text-text-muted font-bold leading-none uppercase">{slot.hour_label}</p>
                          <p className="text-[12.5px] font-semibold text-text-primary tracking-tight mt-1 truncate leading-none">
                            {slot.zone_name}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`badge px-1.5 py-0.5 text-[8.5px] leading-none font-bold scale-90 block transform origin-right ${demandBadge}`}>
                            {slot.demand_level}
                          </span>
                          <p className="text-[11.5px] font-bold text-success mt-1 leading-none">{slot.estimated_earnings}/hour</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: SCROLLABLE PRIMARY FORECAST & RECOMMENDATIONS FEED (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6 lg:max-h-[85vh] lg:overflow-y-auto pr-1">
          
          {/* Shift Trend Tracker Chart */}
          <EarningsTrendChart 
            shiftDuration={shiftDuration}
            todayEarnings={todayEarnings}
            estimate={estimate}
          />
          
          {/* Hero Relocation Target */}
          <div className="card relative overflow-hidden border border-accent/20 bg-bg-card/75 shadow-[0_8px_32px_var(--accent-glow)]">
            {/* Ambient accent background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent blur-3xl rounded-full opacity-10"></div>
            
            {/* Tag Badge */}
            <div className="flex items-center justify-between border-b border-border-card/40 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent/60 opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-accent">
                  BUSIEST AREA RIGHT NOW
                </span>
              </div>
              <div className="badge bg-accent/10 border border-accent/20 text-accent text-[9px] px-2 py-0.5 font-mono">
                MANY PASSENGERS LOOKING FOR RIDES
              </div>
            </div>

            {heroPrediction ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-text-muted uppercase">Best area to go to</span>
                    <h2 className="text-3xl font-display font-extrabold text-text-primary tracking-tight mt-0.5">
                      {heroPrediction.zone_name}
                    </h2>
                    <p className="text-xs text-text-secondary mt-1">
                      Lots of passengers here. Driving to this area will help you get a ride quickly.
                    </p>
                  </div>

                  <button
                    onClick={() => onTabChange("map")}
                    className="btn-primary flex items-center justify-center gap-2 self-start md:self-center shrink-0 w-full md:w-auto"
                  >
                    <Navigation2 size={15} className="rotate-45 text-slate-950" />
                    <span className="text-slate-950 font-bold font-mono text-xs uppercase tracking-wider">Show Route on Map</span>
                  </button>
                </div>

                {/* Info Pills Row */}
                <div className="grid grid-cols-3 gap-3 bg-bg-primary/60 border border-border-card/60 p-3 rounded-xl font-mono text-xs">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-text-muted uppercase mb-1">Which direction</span>
                    <span className="font-bold text-text-primary flex items-center gap-1.5 break-all">
                      <Compass size={13} className="text-accent" />
                      {heroPrediction.direction}
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-border-card/50 pl-3">
                    <span className="text-[9px] text-text-muted uppercase mb-1">How far</span>
                    <span className="font-bold text-text-primary break-all">
                      {formatDistance(heroPrediction.distance_km)} away
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-border-card/50 pl-3">
                    <span className="text-[9px] text-text-muted uppercase mb-1">Time to reach</span>
                    <span className="font-bold text-success break-all">
                      ETA {formatETA(heroPrediction.eta_mins)}
                    </span>
                  </div>
                </div>

                {/* Confidence Range Bar */}
                <div className="bg-bg-primary/30 p-4 rounded-xl border border-border-card/30 mt-1">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-text-secondary">Expected chance of getting a ride</span>
                    <span className="font-bold text-accent">{heroPrediction.confidence_pct}% Chance</span>
                  </div>
                  <ConfidenceBar value={heroPrediction.confidence_pct} />
                </div>

                {/* AI Rationale Block */}
                {recommended && (
                  <div className="bg-success/5 border border-success/15 rounded-xl p-4 flex items-start gap-3 mt-1">
                    <div className="p-2 bg-success/10 rounded-lg text-success shrink-0">
                      <Sparkles size={16} className="animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-success uppercase tracking-wider font-mono">
                        Simple Captain Tip
                      </p>
                      <p className="text-xs leading-relaxed text-text-secondary mt-1">
                        {recommended.reasoning}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-text-muted font-mono py-16 text-center">
                Finding best nearby ride areas...
              </div>
            )}
          </div>

          {/* Secondary Sub-forecast list */}
          {secondaryPredictions.length > 0 && (
            <div className="card bg-bg-card/90 border border-border-card/60 p-5">
              <div className="flex items-center justify-between mb-3 border-b border-border-card/40 pb-3">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider font-bold block">
                  OTHER BUSY AREAS CLOSE BY
                </span>
                <span className="text-[10px] font-mono text-text-muted font-bold">Sorted by driving time</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {secondaryPredictions.map((pred) => (
                  <div
                    key={pred.zone_id}
                    onClick={() => onTabChange("map")}
                    className="flex items-center justify-between text-xs font-mono bg-bg-primary/40 hover:bg-bg-card-hover/90 rounded-xl p-3 border border-border-card hover:border-accent/40 transition-all cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-text-primary text-sm">{pred.zone_name}</p>
                      <span className="text-[10px] text-text-muted mt-0.5 block">{pred.direction} • {formatDistance(pred.distance_km)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-success font-bold block">{pred.confidence_pct}% Chance</span>
                      <span className="text-[10px] text-text-muted block mt-0.5">ETA: {formatETA(pred.eta_mins)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Row of ranked hot spots */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-danger animate-ping" />
                <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">
                  TOP BUSY SPOTS IN BENGALURU TODAY
                </span>
              </div>
              <span className="text-[10px] font-mono text-text-muted block">Updated details</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {rankedZones.map((zone, idx) => (
                <ZoneCard
                  key={zone.zone_id}
                  zone={zone}
                  rank={idx + 1}
                  onClick={() => onTabChange("map")}
                />
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
