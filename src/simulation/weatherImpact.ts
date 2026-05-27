/**
 * Weather Simulation Impact Model
 * Calculates precipitation conditions and their numeric impact on dispatch efficiency.
 */
export type WeatherType = 'clear' | 'cloudy' | 'rain' | 'thunderstorm';

export interface WeatherMetrics {
  type: WeatherType;
  rainIntensityPct: number; // 0 to 100
  waterloggingRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL';
  demandMultiplier: number;
  fareMultiplier: number;
  safetyAdvisory: string | null;
  cancellationProbabilityPct: number;
  autoTractionModifier: number; // For two-wheelers (Captains)
}

export function getWeatherImpact(weatherType: string, hour: number): WeatherMetrics {
  const normType = weatherType.toLowerCase() as WeatherType;
  
  let rainIntensityPct = 0;
  let waterloggingRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL' = 'NONE';
  let demandMultiplier = 1.0;
  let fareMultiplier = 1.0;
  let safetyAdvisory: string | null = null;
  let cancellationProbabilityPct = 8; // base rider cancellation
  let autoTractionModifier = 1.0;

  switch (normType) {
    case 'rain':
      rainIntensityPct = 65;
      waterloggingRisk = 'MEDIUM';
      demandMultiplier = 1.35; // 35% surge in ride requests due to zero autos available
      fareMultiplier = 1.25; // standard rain fare multiplier
      cancellationProbabilityPct = 22; // higher cancellations due to matching friction
      autoTractionModifier = 0.82; // wet road grip reduction
      safetyAdvisory = "Wet tarmac active. Ensure helmet visor is clear & maintain 20m braking gap.";
      break;
    case 'thunderstorm':
      rainIntensityPct = 95;
      waterloggingRisk = 'CRITICAL';
      demandMultiplier = 1.65; // massive desperation surge
      fareMultiplier = 1.5; // extreme surge limit
      cancellationProbabilityPct = 40; // match failures, high cancellations
      autoTractionModifier = 0.65; // hazardous grip
      safetyAdvisory = "Water congestion high. Underpasses flooded. Seek shelter immediately if lightning flashes.";
      break;
    case 'cloudy':
      rainIntensityPct = 10;
      waterloggingRisk = 'NONE';
      demandMultiplier = 1.08; // slightly higher booking attempts (heat relief)
      fareMultiplier = 1.02;
      autoTractionModifier = 0.98;
      cancellationProbabilityPct = 10;
      break;
    case 'clear':
    default:
      rainIntensityPct = 0;
      waterloggingRisk = 'NONE';
      demandMultiplier = 1.0;
      fareMultiplier = 1.0;
      autoTractionModifier = 1.0;
      cancellationProbabilityPct = 6;
      break;
  }

  // Slightly reduce rider demand during midnight thunderstorms (people stay inside)
  if ((normType === 'rain' || normType === 'thunderstorm') && (hour >= 23 || hour <= 5)) {
    demandMultiplier = Math.max(0.7, demandMultiplier * 0.7);
  }

  return {
    type: normType,
    rainIntensityPct,
    waterloggingRisk,
    demandMultiplier: parseFloat(demandMultiplier.toFixed(2)),
    fareMultiplier: parseFloat(fareMultiplier.toFixed(2)),
    safetyAdvisory,
    cancellationProbabilityPct,
    autoTractionModifier,
  };
}
