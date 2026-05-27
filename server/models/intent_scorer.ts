export interface IntentEvent {
  id: string;
  zone_id: string;
  event_type: 'app_open' | 'price_check' | 'route_preview' | 'booking_attempt';
  timestamp: number;
}

export class IntentScorer {
  public static EVENT_WEIGHTS = {
    app_open: 0.3,
    price_check: 0.6,
    route_preview: 0.8,
    booking_attempt: 1.0
  };

  private events: IntentEvent[] = [];

  constructor() {}

  public add_event(zone_id: string, event_type: keyof typeof IntentScorer.EVENT_WEIGHTS, timestamp: number = Date.now()) {
    const id = Math.random().toString(36).substring(2, 9);
    this.events.push({
      id,
      zone_id,
      event_type,
      timestamp
    });
  }

  public get_all_events(): IntentEvent[] {
    return this.events;
  }

  public get_zone_score(zone_id: string): number {
    const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
    const recentEvents = this.events.filter(
      (e) => e.zone_id === zone_id && e.timestamp >= fiveMinsAgo
    );

    let score = 0;
    for (const event of recentEvents) {
      const weight = IntentScorer.EVENT_WEIGHTS[event.event_type] || 0;
      // Exponential time decay to give higher status to hotter recent events
      const minsDiff = (Date.now() - event.timestamp) / (60 * 1000);
      const decay = Math.max(0, 1 - minsDiff / 5); // decay to 0 over 5 mins
      score += weight * decay;
    }

    return score;
  }

  public get_all_scores(): Record<string, number> {
    const scores: Record<string, number> = {};
    const zoneIds = new Set(this.events.map((e) => e.zone_id));
    for (const zone_id of zoneIds) {
      scores[zone_id] = this.get_zone_score(zone_id);
    }
    return scores;
  }

  public get_demand_boost(zone_id: string): number {
    const score = this.get_zone_score(zone_id);
    // Convert intent score to a demand multiplier limit at 0.5 boost
    const boost = Math.min(0.5, score * 0.05);
    return parseFloat(boost.toFixed(3));
  }

  public cleanup_old_events() {
    const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
    const initialCount = this.events.length;
    this.events = this.events.filter((e) => e.timestamp >= fiveMinsAgo);
    console.log(`[IntentScorer] Old events cleanup. Preserved ${this.events.length} of ${initialCount} events.`);
  }
}
