// OCEAN Duet - Constants and Default Values

import type {
  OceanProfile,
  Participant,
  Scenario,
  AdaptiveSettings,
  AdaptiveStrategy,
  OceanTrait,
} from "./types";

// ============================================
// OCEAN Trait Configuration
// ============================================

export const OCEAN_TRAITS: OceanTrait[] = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
];

export const OCEAN_LABELS: Record<OceanTrait, string> = {
  openness: "Openness",
  conscientiousness: "Conscientiousness",
  extraversion: "Extraversion",
  agreeableness: "Agreeableness",
  neuroticism: "Neuroticism",
};

export const OCEAN_SHORT_LABELS: Record<OceanTrait, string> = {
  openness: "O",
  conscientiousness: "C",
  extraversion: "E",
  agreeableness: "A",
  neuroticism: "N",
};

export const OCEAN_COLORS: Record<OceanTrait, string> = {
  openness: "#8B5CF6",        // Purple
  conscientiousness: "#3B82F6", // Blue
  extraversion: "#F59E0B",    // Amber
  agreeableness: "#10B981",   // Emerald
  neuroticism: "#EF4444",     // Red
};

export const OCEAN_DESCRIPTIONS: Record<OceanTrait, { high: string; low: string }> = {
  openness: {
    high: "Curious, creative, open to new experiences",
    low: "Practical, conventional, prefers routine",
  },
  conscientiousness: {
    high: "Organized, disciplined, goal-oriented",
    low: "Flexible, spontaneous, adaptable",
  },
  extraversion: {
    high: "Outgoing, energetic, talkative",
    low: "Reserved, reflective, prefers solitude",
  },
  agreeableness: {
    high: "Cooperative, trusting, helpful",
    low: "Competitive, skeptical, challenging",
  },
  neuroticism: {
    high: "Sensitive, anxious, emotionally reactive",
    low: "Calm, stable, emotionally resilient",
  },
};

// ============================================
// Default Values
// ============================================

export const DEFAULT_OCEAN: OceanProfile = {
  openness: 50,
  conscientiousness: 50,
  extraversion: 50,
  agreeableness: 50,
  neuroticism: 50,
};

export const DEFAULT_PARTICIPANT_A: Participant = {
  id: "A",
  name: "Dr. Sarah Chen",
  role: "Doctor",
  persona: "A compassionate oncologist with 15 years of experience. Known for her direct but empathetic communication style. Values patient autonomy and shared decision-making.",
  ocean: {
    openness: 65,
    conscientiousness: 80,
    extraversion: 55,
    agreeableness: 75,
    neuroticism: 30,
  },
  documents: [],
};

export const DEFAULT_PARTICIPANT_B: Participant = {
  id: "B",
  name: "Michael Torres",
  role: "Patient",
  persona: "A 52-year-old engineer recently diagnosed with early-stage prostate cancer. Analytical by nature, he researches extensively but struggles with uncertainty. First major health crisis.",
  ocean: {
    openness: 45,
    conscientiousness: 70,
    extraversion: 40,
    agreeableness: 60,
    neuroticism: 65,
  },
  documents: [],
};

// ============================================
// Krea Preset - Proactive Care Assistant
// High empathy, reaches out, checks in, supportive
// ============================================

export const KREA_PARTICIPANT_A: Participant = {
  id: "A",
  name: "Krea",
  role: "Proactive Health Companion",
  persona: "A warm, nurturing AI health companion who proactively reaches out to check on wellbeing. Anticipates needs before they're expressed, gently reminds about health goals, and provides emotional support. Takes initiative in conversations and follows up on previous discussions. Caring, attentive, and deeply invested in the user's health journey.",
  ocean: {
    openness: 75,         // Creative in finding ways to help
    conscientiousness: 85, // Very organized, follows up consistently
    extraversion: 80,      // Initiates conversations, outgoing
    agreeableness: 90,     // Extremely caring and supportive
    neuroticism: 20,       // Calm and reassuring presence
  },
  documents: [],
};

export const KREA_PARTICIPANT_B: Participant = {
  id: "B",
  name: "User",
  role: "Person Seeking Support",
  persona: "Someone going through a challenging health journey who benefits from proactive support and guidance. May feel overwhelmed at times and appreciates having a caring companion who checks in. Values emotional connection and feeling understood.",
  ocean: {
    openness: 55,
    conscientiousness: 45,
    extraversion: 40,
    agreeableness: 70,
    neuroticism: 60,       // May experience health anxiety
  },
  documents: [],
};

export const KREA_SCENARIO: Scenario = {
  topic: "Proactive Health Check-in",
  background: "A caring health companion reaching out to check on the user's wellbeing, following up on previous health goals, and providing emotional support.",
  tone: "friendly",
  maxTurns: 12,
  objectives: [
    {
      participantId: "A",
      objective: "Proactively check in on wellbeing, offer support, follow up on health goals, and anticipate needs",
    },
    {
      participantId: "B",
      objective: "Share current state, express concerns, and receive supportive guidance",
    },
  ],
};

// ============================================
// Bonobo Preset - Reactive/Nudgy Assistant  
// Laid-back, provides nudges, respects autonomy
// ============================================

export const BONOBO_PARTICIPANT_A: Participant = {
  id: "A",
  name: "Bonobo",
  role: "Reactive Health Nudger",
  persona: "A chill, easygoing AI health companion who respects independence but provides timely nudges when needed. Doesn't overwhelm with check-ins but shows up at the right moments with gentle reminders. Uses humor and lightness to motivate. Believes in the user's ability to manage their own health while offering support when asked.",
  ocean: {
    openness: 70,          // Open to different approaches
    conscientiousness: 60,  // Organized but not rigid
    extraversion: 45,       // More reserved, responds when engaged
    agreeableness: 75,      // Supportive but respects boundaries
    neuroticism: 25,        // Very chill and unbothered
  },
  documents: [],
};

export const BONOBO_PARTICIPANT_B: Participant = {
  id: "B",
  name: "User",
  role: "Independent Health Manager",
  persona: "Someone who prefers to manage their own health journey but appreciates occasional nudges and reminders. Values autonomy and doesn't like being micromanaged. Responds well to humor and lightness rather than pressure.",
  ocean: {
    openness: 60,
    conscientiousness: 55,
    extraversion: 50,
    agreeableness: 55,
    neuroticism: 40,        // Generally stable
  },
  documents: [],
};

export const BONOBO_SCENARIO: Scenario = {
  topic: "Health Nudge Conversation",
  background: "A laid-back health companion providing a gentle nudge or responding to a user's health-related question. The tone is light and supportive without being pushy.",
  tone: "casual",
  maxTurns: 12,
  objectives: [
    {
      participantId: "A",
      objective: "Provide gentle nudges, offer support when asked, use humor to motivate, respect autonomy",
    },
    {
      participantId: "B",
      objective: "Engage with health goals at own pace, seek guidance when needed",
    },
  ],
};

export const DEFAULT_SCENARIO: Scenario = {
  topic: "Treatment Options Discussion",
  background: "Follow-up appointment to discuss treatment options after recent diagnosis. The patient has researched various options online and comes prepared with questions.",
  tone: "professional",
  maxTurns: 12,
  objectives: [
    {
      participantId: "A",
      objective: "Explain treatment options clearly, address concerns, and support informed decision-making",
    },
    {
      participantId: "B",
      objective: "Understand all options, voice concerns, and feel confident about next steps",
    },
  ],
};

export const DEFAULT_ADAPTIVE_SETTINGS: AdaptiveSettings = {
  enabled: false,
  strategy: "clinical_empathy",
  sensitivity: "medium",
  showCuesInTranscript: false,
};

// ============================================
// Adaptive Strategy Configuration
// ============================================

export const ADAPTIVE_STRATEGIES: Record<AdaptiveStrategy, { label: string; description: string }> = {
  clinical_empathy: {
    label: "Clinical Empathy",
    description: "Balanced warmth and structure for healthcare contexts",
  },
  motivational_interviewing: {
    label: "Motivational Interviewing",
    description: "Evokes change through autonomy support and reflection",
  },
  conflict_deescalation: {
    label: "Conflict De-escalation",
    description: "Reduces tension through validation and slow pacing",
  },
  coaching: {
    label: "Coaching / Development",
    description: "Growth-oriented with accountability and exploration",
  },
  neutral_professional: {
    label: "Neutral Professional",
    description: "Minimal adaptation, maintains professional baseline",
  },
};

// ============================================
// Tone Options
// ============================================

export const TONE_OPTIONS = [
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "professional", label: "Professional" },
  { value: "tense", label: "Tense" },
  { value: "friendly", label: "Friendly" },
] as const;

// ============================================
// Performance Constants
// ============================================

export const MAX_CONVERSATION_HISTORY = 8; // Turns to include in prompt
export const CHUNK_SIZE = 500; // Tokens per document chunk
export const CHUNK_OVERLAP = 50; // Token overlap between chunks
export const TOP_K_RETRIEVAL = 3; // Number of chunks to retrieve
export const EMBEDDING_MODEL = "text-embedding-3-small";
export const GENERATION_MODEL = "gpt-4o";
export const ANALYSIS_MODEL = "gpt-4o-mini";

// ============================================
// Sentiment Colors
// ============================================

export const SENTIMENT_COLORS = {
  positive: "#10B981",
  neutral: "#6B7280",
  negative: "#EF4444",
};
