import { HotspotModel } from "./models/hotspot_model.ts";
import { MarkovPredictor } from "./models/markov_predictor.ts";
import { IntentScorer } from "./models/intent_scorer.ts";

export const hotspotModel = new HotspotModel();
export const markovPredictor = new MarkovPredictor();
export const intentScorer = new IntentScorer();
