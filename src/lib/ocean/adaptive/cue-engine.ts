// OCEAN Duet - Adaptive Cue Engine (V2-Ready)

import type {
  AdaptiveCue,
  AdaptiveSettings,
  AdaptiveStrategy,
  ConversationTurn,
  OceanTrait,
  StanceAdjustments,
} from "../types";
import { ADAPTIVE_STRATEGY_RULES } from "./strategies";

interface TraitDelta {
  trait: OceanTrait;
  delta: number;
  direction: "increasing" | "decreasing" | "stable";
}

/**
 * Compute adaptive cue based on detected signals
 */
export function computeAdaptiveCue(
  turns: ConversationTurn[],
  settings: AdaptiveSettings
): AdaptiveCue | undefined {
  if (!settings.enabled || turns.length < 2) {
    return undefined;
  }

  const windowSize = getWindowSize(settings.sensitivity);
  const recentTurns = turns.slice(-windowSize);

  // Detect trait deltas over the window
  const deltas = detectTraitDeltas(recentTurns);

  // Find the most significant delta
  const significantDelta = findSignificantDelta(deltas, settings.sensitivity);

  if (!significantDelta) {
    return undefined;
  }

  // Get strategy-specific rules
  const strategyRules = ADAPTIVE_STRATEGY_RULES[settings.strategy];

  // Compute stance adjustments
  const stanceAdjustments = computeStanceAdjustments(
    significantDelta,
    strategyRules
  );

  // Generate instructions and avoid list
  const { instructions, doNotDo } = generateInstructions(
    significantDelta,
    strategyRules
  );

  // Calculate confidence based on signal strength and consistency
  const confidence = calculateConfidence(significantDelta, recentTurns);

  return {
    stanceAdjustments,
    instructions,
    doNotDo,
    rationale: generateRationale(significantDelta, settings.strategy),
    confidence,
    trigger: {
      detectedTrait: significantDelta.trait,
      delta: significantDelta.delta,
      windowTurns: windowSize,
    },
  };
}

function getWindowSize(sensitivity: "low" | "medium" | "high"): number {
  switch (sensitivity) {
    case "low":
      return 4;
    case "medium":
      return 3;
    case "high":
      return 2;
  }
}

function detectTraitDeltas(turns: ConversationTurn[]): TraitDelta[] {
  if (turns.length < 2) return [];

  const traits: OceanTrait[] = [
    "openness",
    "conscientiousness",
    "extraversion",
    "agreeableness",
    "neuroticism",
  ];

  const firstTurn = turns[0];
  const lastTurn = turns[turns.length - 1];

  return traits.map((trait) => {
    const startValue = firstTurn.cumulativeTrajectory[trait];
    const endValue = lastTurn.cumulativeTrajectory[trait];
    const delta = endValue - startValue;

    return {
      trait,
      delta,
      direction:
        Math.abs(delta) < 2 ? "stable" : delta > 0 ? "increasing" : "decreasing",
    };
  });
}

function findSignificantDelta(
  deltas: TraitDelta[],
  sensitivity: "low" | "medium" | "high"
): TraitDelta | undefined {
  const threshold = sensitivity === "high" ? 3 : sensitivity === "medium" ? 5 : 8;

  // Sort by absolute delta, descending
  const sorted = [...deltas].sort(
    (a, b) => Math.abs(b.delta) - Math.abs(a.delta)
  );

  // Return the most significant if it exceeds threshold
  const most = sorted[0];
  if (most && Math.abs(most.delta) >= threshold) {
    return most;
  }

  return undefined;
}

function computeStanceAdjustments(
  delta: TraitDelta,
  rules: typeof ADAPTIVE_STRATEGY_RULES[AdaptiveStrategy]
): StanceAdjustments {
  const base: StanceAdjustments = {
    warmth: 0,
    structure: 0,
    pace: 0,
    autonomy: 0,
    directness: 0,
  };

  const rule = rules.traitResponses[delta.trait];
  if (!rule) return base;

  const isHigh = delta.delta > 0;
  const adjustments = isHigh ? rule.whenHigh : rule.whenLow;

  // Scale adjustments by delta magnitude (capped at ±3)
  const scale = Math.min(Math.abs(delta.delta) / 10, 1);

  return {
    warmth: Math.round(adjustments.warmth * scale * 3) / 3,
    structure: Math.round(adjustments.structure * scale * 3) / 3,
    pace: Math.round(adjustments.pace * scale * 3) / 3,
    autonomy: Math.round(adjustments.autonomy * scale * 3) / 3,
    directness: Math.round(adjustments.directness * scale * 3) / 3,
  };
}

function generateInstructions(
  delta: TraitDelta,
  rules: typeof ADAPTIVE_STRATEGY_RULES[AdaptiveStrategy]
): { instructions: string[]; doNotDo: string[] } {
  const rule = rules.traitResponses[delta.trait];
  if (!rule) {
    return { instructions: [], doNotDo: [] };
  }

  const isHigh = delta.delta > 0;
  return {
    instructions: isHigh ? rule.instructionsWhenHigh : rule.instructionsWhenLow,
    doNotDo: isHigh ? rule.avoidWhenHigh : rule.avoidWhenLow,
  };
}

function calculateConfidence(
  delta: TraitDelta,
  turns: ConversationTurn[]
): number {
  // Base confidence on delta magnitude
  const magnitudeConfidence = Math.min(Math.abs(delta.delta) / 15, 1);

  // Check consistency of signals across turns
  const traitSignals = turns.flatMap((t) =>
    t.traitSignals.filter((s) => s.trait === delta.trait)
  );
  const avgConfidence =
    traitSignals.length > 0
      ? traitSignals.reduce((sum, s) => sum + s.confidence, 0) / traitSignals.length
      : 0.5;

  // Combine factors
  return Math.round((magnitudeConfidence * 0.6 + avgConfidence * 0.4) * 100) / 100;
}

function generateRationale(
  delta: TraitDelta,
  strategy: AdaptiveStrategy
): string {
  const traitNames: Record<OceanTrait, string> = {
    openness: "Openness",
    conscientiousness: "Conscientiousness",
    extraversion: "Extraversion",
    agreeableness: "Agreeableness",
    neuroticism: "Neuroticism",
  };

  const strategyNames: Record<AdaptiveStrategy, string> = {
    clinical_empathy: "Clinical Empathy",
    motivational_interviewing: "Motivational Interviewing",
    conflict_deescalation: "Conflict De-escalation",
    coaching: "Coaching",
    neutral_professional: "Neutral Professional",
  };

  const direction = delta.delta > 0 ? "increased" : "decreased";
  const traitName = traitNames[delta.trait];
  const strategyName = strategyNames[strategy];

  return `${traitName} has ${direction} by ${Math.abs(delta.delta).toFixed(1)} points. Using ${strategyName} approach to adjust listener stance accordingly.`;
}
