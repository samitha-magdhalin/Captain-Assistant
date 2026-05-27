import { motion } from "motion/react";

interface ConfidenceBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  animated?: boolean;
}

export function ConfidenceBar({
  value,
  showLabel = true,
  animated = true
}: ConfidenceBarProps) {
  // Constrain value
  const pct = Math.max(0, Math.min(100, value));

  // Determine color theme
  let colorClass = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]";
  let textClass = "text-red-400";
  
  if (pct >= 70) {
    colorClass = "bg-success shadow-[0_0_8px_var(--accent-glow-strong)]";
    textClass = "text-success";
  } else if (pct >= 40) {
    colorClass = "bg-accent shadow-[0_0_8px_var(--accent-glow)]";
    textClass = "text-accent";
  }

  return (
    <div className="w-full flex items-center gap-3">
      <div className="flex-1 bg-gray-950/80 rounded-full h-2 overflow-hidden border border-gray-800">
        {animated ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
          />
        ) : (
          <div
            style={{ width: `${pct}%` }}
            className={`h-full rounded-full ${colorClass}`}
          />
        )}
      </div>
      {showLabel && (
        <span className={`font-mono text-xs font-bold text-right min-w-[36px] ${textClass}`}>
          {pct}%
        </span>
      )}
    </div>
  );
}
