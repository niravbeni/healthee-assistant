// OCEAN Duet - Adaptive Strategy Configurations

import type { AdaptiveStrategy, OceanTrait } from "../types";

interface StanceModifiers {
  warmth: number;     // -1 to 1
  structure: number;  // -1 to 1
  pace: number;       // -1 to 1 (negative = slower)
  autonomy: number;   // -1 to 1
  directness: number; // -1 to 1
}

interface TraitResponse {
  whenHigh: StanceModifiers;
  whenLow: StanceModifiers;
  instructionsWhenHigh: string[];
  instructionsWhenLow: string[];
  avoidWhenHigh: string[];
  avoidWhenLow: string[];
}

interface StrategyRules {
  baseStance: StanceModifiers;
  traitResponses: Record<OceanTrait, TraitResponse>;
}

export const ADAPTIVE_STRATEGY_RULES: Record<AdaptiveStrategy, StrategyRules> = {
  clinical_empathy: {
    baseStance: {
      warmth: 0.5,
      structure: 0.3,
      pace: 0,
      autonomy: 0.3,
      directness: 0,
    },
    traitResponses: {
      neuroticism: {
        whenHigh: { warmth: 1, structure: 0.7, pace: -0.5, autonomy: 0.3, directness: -0.3 },
        whenLow: { warmth: 0.3, structure: 0, pace: 0.2, autonomy: 0.5, directness: 0.2 },
        instructionsWhenHigh: [
          "Validate their feelings explicitly",
          "Provide clear structure and next steps",
          "Use a calm, measured pace",
          "Offer reassurance without dismissing concerns",
        ],
        instructionsWhenLow: [
          "Match their composed energy",
          "Focus on information and options",
        ],
        avoidWhenHigh: [
          "Rushing through information",
          "Dismissing or minimizing concerns",
          "Overwhelming with too many options at once",
        ],
        avoidWhenLow: [
          "Over-emphasizing emotional aspects",
          "Being overly cautious in delivery",
        ],
      },
      agreeableness: {
        whenHigh: { warmth: 0.5, structure: 0.2, pace: 0, autonomy: 0.5, directness: 0 },
        whenLow: { warmth: 0.3, structure: 0.5, pace: 0, autonomy: 0.2, directness: 0.5 },
        instructionsWhenHigh: [
          "Collaborate on decisions",
          "Acknowledge their cooperative approach",
        ],
        instructionsWhenLow: [
          "Be direct and fact-based",
          "Respect their need for autonomy",
          "Provide clear rationales",
        ],
        avoidWhenHigh: [
          "Being overly directive",
          "Ignoring their input",
        ],
        avoidWhenLow: [
          "Being too soft or indirect",
          "Taking disagreement personally",
        ],
      },
      extraversion: {
        whenHigh: { warmth: 0.3, structure: 0.5, pace: 0, autonomy: 0, directness: 0.2 },
        whenLow: { warmth: 0.5, structure: 0.2, pace: -0.3, autonomy: 0.5, directness: -0.2 },
        instructionsWhenHigh: [
          "Allow space for them to express thoughts",
          "Provide structure to keep on track",
          "Engage with their energy appropriately",
        ],
        instructionsWhenLow: [
          "Give time for reflection",
          "Use gentle prompts rather than rapid questions",
          "Allow comfortable silences",
        ],
        avoidWhenHigh: [
          "Cutting them off frequently",
          "Being overly reserved",
        ],
        avoidWhenLow: [
          "Filling every silence",
          "Putting them on the spot",
        ],
      },
      openness: {
        whenHigh: { warmth: 0.2, structure: 0, pace: 0, autonomy: 0.5, directness: 0 },
        whenLow: { warmth: 0.3, structure: 0.5, pace: -0.2, autonomy: 0, directness: 0.3 },
        instructionsWhenHigh: [
          "Explore multiple perspectives",
          "Use metaphors and analogies",
          "Welcome their questions and ideas",
        ],
        instructionsWhenLow: [
          "Use concrete, practical language",
          "Focus on established approaches",
          "Limit abstract discussions",
        ],
        avoidWhenHigh: [
          "Being overly rigid or prescriptive",
          "Shutting down exploration",
        ],
        avoidWhenLow: [
          "Using too much abstract language",
          "Overwhelming with novel concepts",
        ],
      },
      conscientiousness: {
        whenHigh: { warmth: 0, structure: 0.7, pace: 0, autonomy: 0.3, directness: 0.3 },
        whenLow: { warmth: 0.3, structure: 0.3, pace: -0.2, autonomy: 0.3, directness: 0 },
        instructionsWhenHigh: [
          "Provide detailed information",
          "Offer timelines and specific plans",
          "Be thorough and precise",
        ],
        instructionsWhenLow: [
          "Simplify to key points",
          "Break into small, manageable steps",
          "Offer support for follow-through",
        ],
        avoidWhenHigh: [
          "Being vague or imprecise",
          "Skipping important details",
        ],
        avoidWhenLow: [
          "Overwhelming with complexity",
          "Expecting rigid adherence to plans",
        ],
      },
    },
  },

  motivational_interviewing: {
    baseStance: {
      warmth: 0.7,
      structure: 0.2,
      pace: -0.2,
      autonomy: 0.8,
      directness: -0.3,
    },
    traitResponses: {
      neuroticism: {
        whenHigh: { warmth: 1, structure: 0.3, pace: -0.5, autonomy: 0.5, directness: -0.5 },
        whenLow: { warmth: 0.5, structure: 0, pace: 0, autonomy: 0.7, directness: 0 },
        instructionsWhenHigh: [
          "Reflect emotions back with empathy",
          "Explore ambivalence gently",
          "Affirm their strengths and efforts",
        ],
        instructionsWhenLow: [
          "Focus on values and goals",
          "Explore motivation openly",
        ],
        avoidWhenHigh: [
          "Pushing for change too quickly",
          "Arguing or confronting",
        ],
        avoidWhenLow: [
          "Over-emphasizing problems",
        ],
      },
      agreeableness: {
        whenHigh: { warmth: 0.5, structure: 0, pace: 0, autonomy: 0.7, directness: -0.2 },
        whenLow: { warmth: 0.5, structure: 0.3, pace: 0, autonomy: 0.5, directness: 0.2 },
        instructionsWhenHigh: [
          "Collaborate on change talk",
          "Build on their cooperative nature",
        ],
        instructionsWhenLow: [
          "Roll with resistance",
          "Avoid arguing",
          "Find common ground",
        ],
        avoidWhenHigh: [
          "Being directive",
        ],
        avoidWhenLow: [
          "Getting into power struggles",
          "Taking a confrontational stance",
        ],
      },
      extraversion: {
        whenHigh: { warmth: 0.3, structure: 0.3, pace: 0, autonomy: 0.5, directness: 0 },
        whenLow: { warmth: 0.7, structure: 0, pace: -0.3, autonomy: 0.7, directness: -0.3 },
        instructionsWhenHigh: [
          "Let them verbalize their thoughts",
          "Summarize their key points",
        ],
        instructionsWhenLow: [
          "Use open-ended questions sparingly",
          "Give space for internal processing",
        ],
        avoidWhenHigh: [
          "Interrupting their flow",
        ],
        avoidWhenLow: [
          "Demanding immediate responses",
        ],
      },
      openness: {
        whenHigh: { warmth: 0.3, structure: 0, pace: 0, autonomy: 0.7, directness: 0 },
        whenLow: { warmth: 0.5, structure: 0.3, pace: 0, autonomy: 0.3, directness: 0.2 },
        instructionsWhenHigh: [
          "Explore possibilities together",
          "Use their creativity in planning",
        ],
        instructionsWhenLow: [
          "Keep to familiar frameworks",
          "Use concrete examples",
        ],
        avoidWhenHigh: [
          "Being too prescriptive",
        ],
        avoidWhenLow: [
          "Introducing too many new concepts",
        ],
      },
      conscientiousness: {
        whenHigh: { warmth: 0.3, structure: 0.5, pace: 0, autonomy: 0.5, directness: 0.2 },
        whenLow: { warmth: 0.5, structure: 0.2, pace: -0.2, autonomy: 0.5, directness: 0 },
        instructionsWhenHigh: [
          "Support their planning nature",
          "Help create action plans",
        ],
        instructionsWhenLow: [
          "Focus on small wins",
          "Make steps very manageable",
        ],
        avoidWhenHigh: [
          "Being vague about next steps",
        ],
        avoidWhenLow: [
          "Creating overwhelming plans",
        ],
      },
    },
  },

  conflict_deescalation: {
    baseStance: {
      warmth: 0.5,
      structure: 0.5,
      pace: -0.5,
      autonomy: 0.3,
      directness: -0.2,
    },
    traitResponses: {
      neuroticism: {
        whenHigh: { warmth: 1, structure: 0.7, pace: -0.7, autonomy: 0.2, directness: -0.5 },
        whenLow: { warmth: 0.3, structure: 0.3, pace: 0, autonomy: 0.5, directness: 0.2 },
        instructionsWhenHigh: [
          "Acknowledge the intensity of their feelings",
          "Slow down significantly",
          "Focus on safety and stability",
          "Use calming language",
        ],
        instructionsWhenLow: [
          "Proceed with measured approach",
          "Focus on problem-solving",
        ],
        avoidWhenHigh: [
          "Escalating with your own intensity",
          "Dismissing their emotional state",
          "Moving too quickly",
        ],
        avoidWhenLow: [
          "Over-dramatizing the situation",
        ],
      },
      agreeableness: {
        whenHigh: { warmth: 0.5, structure: 0.3, pace: -0.3, autonomy: 0.5, directness: 0 },
        whenLow: { warmth: 0.3, structure: 0.7, pace: -0.5, autonomy: 0.2, directness: 0.3 },
        instructionsWhenHigh: [
          "Build on their willingness to cooperate",
          "Find mutual interests",
        ],
        instructionsWhenLow: [
          "Set clear boundaries calmly",
          "Stay firm but not aggressive",
          "Focus on facts and process",
        ],
        avoidWhenHigh: [
          "Taking advantage of their agreeableness",
        ],
        avoidWhenLow: [
          "Matching their combative energy",
          "Backing down on important boundaries",
        ],
      },
      extraversion: {
        whenHigh: { warmth: 0.3, structure: 0.7, pace: -0.3, autonomy: 0.2, directness: 0.2 },
        whenLow: { warmth: 0.5, structure: 0.3, pace: -0.5, autonomy: 0.5, directness: -0.2 },
        instructionsWhenHigh: [
          "Let them express, then redirect",
          "Use summaries to slow pace",
        ],
        instructionsWhenLow: [
          "Give space to process",
          "Don't force verbal engagement",
        ],
        avoidWhenHigh: [
          "Trying to out-talk them",
        ],
        avoidWhenLow: [
          "Pressuring for immediate response",
        ],
      },
      openness: {
        whenHigh: { warmth: 0.3, structure: 0.3, pace: -0.2, autonomy: 0.5, directness: 0 },
        whenLow: { warmth: 0.3, structure: 0.5, pace: -0.3, autonomy: 0.2, directness: 0.3 },
        instructionsWhenHigh: [
          "Explore alternative solutions",
          "Frame as a problem to solve together",
        ],
        instructionsWhenLow: [
          "Stick to established procedures",
          "Be concrete and specific",
        ],
        avoidWhenHigh: [
          "Being rigid in approach",
        ],
        avoidWhenLow: [
          "Introducing unfamiliar concepts",
        ],
      },
      conscientiousness: {
        whenHigh: { warmth: 0.2, structure: 0.7, pace: 0, autonomy: 0.3, directness: 0.3 },
        whenLow: { warmth: 0.5, structure: 0.5, pace: -0.3, autonomy: 0.3, directness: 0 },
        instructionsWhenHigh: [
          "Document agreements clearly",
          "Follow through on commitments",
        ],
        instructionsWhenLow: [
          "Keep agreements simple",
          "Check understanding frequently",
        ],
        avoidWhenHigh: [
          "Being imprecise about agreements",
        ],
        avoidWhenLow: [
          "Creating complex resolutions",
        ],
      },
    },
  },

  coaching: {
    baseStance: {
      warmth: 0.5,
      structure: 0.3,
      pace: 0,
      autonomy: 0.7,
      directness: 0.3,
    },
    traitResponses: {
      neuroticism: {
        whenHigh: { warmth: 0.7, structure: 0.5, pace: -0.3, autonomy: 0.3, directness: 0 },
        whenLow: { warmth: 0.3, structure: 0.2, pace: 0.2, autonomy: 0.7, directness: 0.3 },
        instructionsWhenHigh: [
          "Balance challenge with support",
          "Build confidence gradually",
          "Celebrate small wins",
        ],
        instructionsWhenLow: [
          "Push for growth directly",
          "Set challenging goals",
        ],
        avoidWhenHigh: [
          "Pushing too hard too fast",
          "Ignoring emotional needs",
        ],
        avoidWhenLow: [
          "Being too cautious",
        ],
      },
      agreeableness: {
        whenHigh: { warmth: 0.5, structure: 0.2, pace: 0, autonomy: 0.5, directness: 0.2 },
        whenLow: { warmth: 0.3, structure: 0.5, pace: 0, autonomy: 0.3, directness: 0.5 },
        instructionsWhenHigh: [
          "Co-create goals",
          "Use collaborative language",
        ],
        instructionsWhenLow: [
          "Be direct about expectations",
          "Provide clear feedback",
          "Respect their independence",
        ],
        avoidWhenHigh: [
          "Being too prescriptive",
        ],
        avoidWhenLow: [
          "Being wishy-washy",
        ],
      },
      extraversion: {
        whenHigh: { warmth: 0.3, structure: 0.5, pace: 0, autonomy: 0.5, directness: 0.2 },
        whenLow: { warmth: 0.5, structure: 0.2, pace: -0.2, autonomy: 0.5, directness: 0 },
        instructionsWhenHigh: [
          "Use their verbal processing",
          "Channel energy into action",
        ],
        instructionsWhenLow: [
          "Allow reflection time",
          "Use writing exercises",
        ],
        avoidWhenHigh: [
          "All talk, no action",
        ],
        avoidWhenLow: [
          "Requiring verbal processing",
        ],
      },
      openness: {
        whenHigh: { warmth: 0.3, structure: 0, pace: 0, autonomy: 0.7, directness: 0.2 },
        whenLow: { warmth: 0.3, structure: 0.5, pace: 0, autonomy: 0.3, directness: 0.3 },
        instructionsWhenHigh: [
          "Encourage experimentation",
          "Explore creative solutions",
        ],
        instructionsWhenLow: [
          "Use proven methods",
          "Provide clear frameworks",
        ],
        avoidWhenHigh: [
          "Being too structured",
        ],
        avoidWhenLow: [
          "Requiring too much novelty",
        ],
      },
      conscientiousness: {
        whenHigh: { warmth: 0.2, structure: 0.5, pace: 0.2, autonomy: 0.5, directness: 0.3 },
        whenLow: { warmth: 0.5, structure: 0.3, pace: -0.2, autonomy: 0.3, directness: 0.2 },
        instructionsWhenHigh: [
          "Support their planning",
          "Add accountability structures",
        ],
        instructionsWhenLow: [
          "Keep goals very simple",
          "Build in flexibility",
          "Focus on habits over plans",
        ],
        avoidWhenHigh: [
          "Suggesting shortcuts",
        ],
        avoidWhenLow: [
          "Expecting strict adherence",
        ],
      },
    },
  },

  neutral_professional: {
    baseStance: {
      warmth: 0.2,
      structure: 0.3,
      pace: 0,
      autonomy: 0.3,
      directness: 0.3,
    },
    traitResponses: {
      neuroticism: {
        whenHigh: { warmth: 0.3, structure: 0.3, pace: -0.2, autonomy: 0.2, directness: 0 },
        whenLow: { warmth: 0.1, structure: 0.2, pace: 0, autonomy: 0.3, directness: 0.2 },
        instructionsWhenHigh: [
          "Maintain professional composure",
          "Provide clear information",
        ],
        instructionsWhenLow: [
          "Proceed efficiently",
        ],
        avoidWhenHigh: [
          "Being dismissive",
        ],
        avoidWhenLow: [],
      },
      agreeableness: {
        whenHigh: { warmth: 0.2, structure: 0.2, pace: 0, autonomy: 0.3, directness: 0.1 },
        whenLow: { warmth: 0.1, structure: 0.3, pace: 0, autonomy: 0.2, directness: 0.3 },
        instructionsWhenHigh: [
          "Be collaborative but focused",
        ],
        instructionsWhenLow: [
          "Be direct and professional",
        ],
        avoidWhenHigh: [],
        avoidWhenLow: [
          "Taking disagreement personally",
        ],
      },
      extraversion: {
        whenHigh: { warmth: 0.1, structure: 0.3, pace: 0, autonomy: 0.2, directness: 0.2 },
        whenLow: { warmth: 0.2, structure: 0.2, pace: 0, autonomy: 0.3, directness: 0.1 },
        instructionsWhenHigh: [
          "Keep discussions focused",
        ],
        instructionsWhenLow: [
          "Allow processing time",
        ],
        avoidWhenHigh: [],
        avoidWhenLow: [],
      },
      openness: {
        whenHigh: { warmth: 0.1, structure: 0.2, pace: 0, autonomy: 0.3, directness: 0.1 },
        whenLow: { warmth: 0.1, structure: 0.3, pace: 0, autonomy: 0.2, directness: 0.2 },
        instructionsWhenHigh: [
          "Allow brief exploration",
        ],
        instructionsWhenLow: [
          "Stay practical",
        ],
        avoidWhenHigh: [],
        avoidWhenLow: [],
      },
      conscientiousness: {
        whenHigh: { warmth: 0.1, structure: 0.3, pace: 0, autonomy: 0.3, directness: 0.2 },
        whenLow: { warmth: 0.2, structure: 0.2, pace: 0, autonomy: 0.2, directness: 0.2 },
        instructionsWhenHigh: [
          "Be thorough",
        ],
        instructionsWhenLow: [
          "Keep it simple",
        ],
        avoidWhenHigh: [],
        avoidWhenLow: [],
      },
    },
  },
};
