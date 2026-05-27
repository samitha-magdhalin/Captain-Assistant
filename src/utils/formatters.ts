/**
 * Format string/number to INR currency symbol
 */
export function formatINR(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(val);
}

/**
 * Format distance value nicely
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Format minutes into clean hours/mins ETA
 */
export function formatETA(mins: number): string {
  if (mins < 1) return "Immediate";
  if (mins < 60) return `${mins} mins`;
  const hrs = Math.floor(mins / 60);
  const remaining = mins % 60;
  return `${hrs}h ${remaining}m`;
}

/**
 * Formats seconds into HH:MM:SS shift timer
 */
export function formatShiftDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((val) => String(val).padStart(2, "0")).join(":");
}
