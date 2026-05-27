interface LiveBadgeProps {
  connected?: boolean;
}

export function LiveBadge({ connected = true }: LiveBadgeProps) {
  return (
    <div className={`flex items-center px-3 py-1 bg-bg-card rounded-full border select-none ${connected ? "border-success/20" : "border-danger/20"}`}>
      <span className={`status-dot w-2 h-2 rounded-full inline-block mr-2 ${connected ? "pulse bg-success shadow-[0_0_8px_var(--success)]" : "bg-danger shadow-[0_0_8px_var(--danger)]"}`}></span>
      <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider font-mono ${connected ? "text-success" : "text-danger"}`}>
        {connected ? "LIVE IN BENGALURU" : "NO CONNECTION"}
      </span>
    </div>
  );
}

