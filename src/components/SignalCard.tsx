import { useState, useEffect } from "react";
import { IntentSignal } from "../types.ts";
import { Smartphone, IndianRupee, MapPin, Loader2, Compass } from "lucide-react";
import { formatDistance } from "../utils/formatters.ts";

interface SignalCardProps {
  signal: IntentSignal;
  isNew?: boolean;
  key?: string | number;
}

export function SignalCard({ signal, isNew = false }: SignalCardProps) {
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  // Auto increment ticks for "X seconds ago" live label
  useEffect(() => {
    const updateTime = () => {
      const elapsed = Math.max(0, Math.floor((Date.now() - signal.timestamp) / 1000));
      setSecondsAgo(elapsed);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [signal.timestamp]);

  // Styling based on event type
  let icon = <Smartphone size={15} />;
  let iconBg = "bg-sky-500/10 text-sky-400 border-sky-500/20";
  let label = "App Open";
  let desc = "Customer looking for nearby bikes on the map";
  let impactColor = "bg-sky-400";
 
  if (signal.event_type === "price_check") {
    icon = <IndianRupee size={15} />;
    iconBg = "bg-accent/10 text-accent border-accent/20";
    label = "Price Check";
    desc = "Customer looking at trip fare";
    impactColor = "bg-accent";
  } else if (signal.event_type === "route_preview") {
    icon = <MapPin size={15} />;
    iconBg = "bg-orange-500/10 text-orange-400 border-orange-500/20";
    label = "Route Preview";
    desc = "Customer viewing route to destination";
    impactColor = "bg-orange-400";
  } else if (signal.event_type === "booking_attempt") {
    icon = <Compass size={15} className="animate-spin-slow" />;
    iconBg = "bg-red-500/10 text-red-400 border-red-500/20";
    label = "Booking Attempt";
    desc = "Customer pressed booking; searching for a Captain";
    impactColor = "bg-red-500";
  }

  let borderLeftColor = "border-l-2 border-sky-500";
  if (signal.event_type === "price_check") {
    borderLeftColor = "border-l-2 border-accent";
  } else if (signal.event_type === "route_preview") {
    borderLeftColor = "border-l-2 border-orange-500";
  } else if (signal.event_type === "booking_attempt") {
    borderLeftColor = "border-l-2 border-red-500";
  }

  const animationClass = isNew ? "animate-slide-in-top" : "";

  return (
    <div
      id={`signal-card-${signal.id}`}
      className={`card flex flex-col md:flex-row md:items-center justify-between gap-3 border border-border-card overflow-hidden ${borderLeftColor} ${animationClass} transition-all duration-300 hover:border-slate-700`}
    >
      <div className="flex items-start gap-3">
        {/* Metric Label Icon */}
        <div className={`mt-0.5 border h-8 w-8 rounded-lg flex items-center justify-center font-bold ${iconBg}`}>
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-text-primary font-semibold text-sm tracking-tight">{label}</span>
            <span className="text-text-muted text-[10px]">•</span>
            <span className="text-accent font-semibold text-xs tracking-tight font-mono">
              {signal.zone_name}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">{desc}</p>
          <div className="text-[10px] font-mono text-text-muted mt-1 select-none">
            📍 Passenger Location
          </div>
        </div>
      </div>

      {/* Right impact calculations */}
      <div className="flex flex-col md:items-end justify-center shrink-0 border-t border-border-card/60 pt-2 md:pt-0 md:border-none">
        <span className="text-[10px] font-mono uppercase text-text-muted">
          {secondsAgo === 0 ? "just now" : `${secondsAgo}s ago`}
        </span>
        <div className="flex items-center gap-2 mt-1 md:mt-2">
          <div className="w-16 bg-bg-primary rounded-full h-1.5 overflow-hidden">
            <div
              style={{ width: `${(signal.demand_impact / 2.5) * 100}%` }}
              className={`h-full rounded-full ${impactColor}`}
            ></div>
          </div>
          <span className="font-mono text-xs font-bold text-text-primary shrink-0">
            +{signal.demand_impact} activity
          </span>
        </div>
      </div>
    </div>
  );
}
