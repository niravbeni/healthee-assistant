// OCEAN Duet - Analysis Prompts

import type { Participant, OceanProfile } from "../types";
import { OCEAN_LABELS, OCEAN_DESCRIPTIONS } from "../constants";

export function buildAnalysisPrompt(params: {
  dialogue: string;
  actions: string[];
  participant: Participant;
  conversationContext: string;
  previousTrajectory: OceanProfile;
}): string {
  const { dialogue, actions, participant, conversationContext, previousTrajectory } = params;

  const actionsText = actions.length > 0 ? `\nNon-verbal actions: ${actions.join(", ")}` : "";

  const traitDescriptions = Object.entries(OCEAN_LABELS)
    .map(([trait, label]) => {
      const desc = OCEAN_DESCRIPTIONS[trait as keyof typeof OCEAN_DESCRIPTIONS];
      return `- ${label} (${trait}): High = ${desc.high}. Low = ${desc.low}.`;
    })
    .join("\n");

  return `Analyze the following dialogue for OCEAN personality trait signals.

SPEAKER: ${participant.name} (${participant.role})
BASELINE PERSONALITY:
- Openness: ${participant.ocean.openness}/100
- Conscientiousness: ${participant.ocean.conscientiousness}/100
- Extraversion: ${participant.ocean.extraversion}/100
- Agreeableness: ${participant.ocean.agreeableness}/100
- Neuroticism: ${participant.ocean.neuroticism}/100

PREVIOUS TRAJECTORY (last turn):
- Openness: ${previousTrajectory.openness.toFixed(1)}
- Conscientiousness: ${previousTrajectory.conscientiousness.toFixed(1)}
- Extraversion: ${previousTrajectory.extraversion.toFixed(1)}
- Agreeableness: ${previousTrajectory.agreeableness.toFixed(1)}
- Neuroticism: ${previousTrajectory.neuroticism.toFixed(1)}

RECENT CONVERSATION CONTEXT:
${conversationContext}

DIALOGUE TO ANALYZE:
"${dialogue}"${actionsText}

TRAIT REFERENCE:
${traitDescriptions}

Analyze this dialogue and identify:
1. Specific text spans that signal OCEAN traits (with start/end character indices)
2. Overall sentiment of the turn
3. Updated cumulative trajectory scores (should move gradually from previous, staying within 0-100)

Respond with ONLY a JSON object in this exact format:
{
  "traitSignals": [
    {
      "trait": "openness" | "conscientiousness" | "extraversion" | "agreeableness" | "neuroticism",
      "startIndex": number,
      "endIndex": number,
      "value": number between -1 (low trait) and 1 (high trait),
      "confidence": number between 0 and 1,
      "rationale": "Brief explanation"
    }
  ],
  "sentiment": "positive" | "neutral" | "negative",
  "cumulativeTrajectory": {
    "openness": number 0-100,
    "conscientiousness": number 0-100,
    "extraversion": number 0-100,
    "agreeableness": number 0-100,
    "neuroticism": number 0-100
  }
}

Guidelines:
- Only include traitSignals for clearly observable signals (2-5 signals typical)
- startIndex/endIndex should be exact character positions in the dialogue string
- value: use negative for low-trait signals, positive for high-trait signals
- cumulativeTrajectory should move gradually (typically ±1-5 points per turn)
- Consider non-verbal actions as additional trait signals`;
}
