// OCEAN Duet - Core Type Definitions

// ============================================
// OCEAN Profile Types
// ============================================

export interface OceanProfile {
  openness: number;          // 0-100
  conscientiousness: number; // 0-100
  extraversion: number;      // 0-100
  agreeableness: number;     // 0-100
  neuroticism: number;       // 0-100
}

export type OceanTrait = keyof OceanProfile;

// ============================================
// Participant Types
// ============================================

export interface Document {
  id: string;
  name: string;
  content: string;
  participantId: "A" | "B";
  chunks: DocumentChunk[];
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  startIndex: number;
  endIndex: number;
}

export interface Participant {
  id: "A" | "B";
  name: string;
  role: string;
  persona: string;
  ocean: OceanProfile;
  speakingStyle?: string;
  documents: Document[];
}

// ============================================
// Scenario Types
// ============================================

export interface ParticipantObjective {
  participantId: "A" | "B";
  objective: string;
}

export interface Scenario {
  topic: string;
  background: string;
  tone: "formal" | "casual" | "professional" | "tense" | "friendly";
  maxTurns: number;
  objectives?: ParticipantObjective[];
  safetyBoundaries?: string;
}

// ============================================
// Trait Analysis Types
// ============================================

export interface TraitSignal {
  trait: OceanTrait;
  startIndex: number;
  endIndex: number;
  value: number;       // -1 to 1, where negative is low trait, positive is high
  confidence: number;  // 0-1
  rationale: string;
}

export type Sentiment = "positive" | "neutral" | "negative";

// ============================================
// Retrieval Types
// ============================================

export interface RetrievalResult {
  documentId: string;
  documentName: string;
  chunkId: string;
  content: string;
  score: number;
}

// ============================================
// Adaptive Listening Types (V2-Ready)
// ============================================

export interface StanceAdjustments {
  warmth: number;     // -3 to +3
  structure: number;  // -3 to +3
  pace: number;       // -3 to +3
  autonomy: number;   // -3 to +3
  directness: number; // -3 to +3
}

export interface AdaptiveTrigger {
  detectedTrait: OceanTrait;
  delta: number;
  sentiment?: Sentiment;
  windowTurns: number;
}

export interface AdaptiveCue {
  stanceAdjustments: StanceAdjustments;
  instructions: string[];
  doNotDo: string[];
  rationale: string;
  confidence: number;
  trigger?: AdaptiveTrigger;
}

export type AdaptiveStrategy =
  | "clinical_empathy"
  | "motivational_interviewing"
  | "conflict_deescalation"
  | "coaching"
  | "neutral_professional";

export type AdaptiveSensitivity = "low" | "medium" | "high";

export interface AdaptiveSettings {
  enabled: boolean;
  strategy: AdaptiveStrategy;
  sensitivity: AdaptiveSensitivity;
  showCuesInTranscript: boolean;
}

// ============================================
// Conversation Turn Types
// ============================================

export interface ConversationTurn {
  id: string;
  turnNumber: number;
  speaker: "A" | "B";
  dialogue: string;
  actions: string[];              // Non-verbal, screenplay-style
  traitSignals: TraitSignal[];
  sentiment: Sentiment;
  cumulativeTrajectory: OceanProfile;
  retrievedDocs?: RetrievalResult[];
  adaptation?: AdaptiveCue;       // V2-ready
  timestamp: number;
}

// ============================================
// Conversation State Types
// ============================================

export interface ConversationState {
  id: string;
  participantA: Participant;
  participantB: Participant;
  scenario: Scenario;
  turns: ConversationTurn[];
  adaptiveSettings: AdaptiveSettings;
  status: "idle" | "running" | "paused" | "completed";
  currentSpeaker: "A" | "B";
  trajectoryA: OceanProfile[];    // Cumulative trajectory per turn
  trajectoryB: OceanProfile[];    // Cumulative trajectory per turn
}

// ============================================
// API Types
// ============================================

export interface GenerateTurnRequest {
  participantA: Participant;
  participantB: Participant;
  scenario: Scenario;
  turns: ConversationTurn[];
  currentSpeaker: "A" | "B";
  adaptiveSettings: AdaptiveSettings;
  previousCue?: AdaptiveCue;
}

export interface GenerateTurnResponse {
  dialogue: string;
  actions: string[];
}

export interface AnalyzeTurnRequest {
  dialogue: string;
  actions: string[];
  speaker: "A" | "B";
  participant: Participant;
  conversationContext: string;
  previousTrajectory: OceanProfile;
}

export interface AnalyzeTurnResponse {
  traitSignals: TraitSignal[];
  sentiment: Sentiment;
  cumulativeTrajectory: OceanProfile;
}

export interface EmbedDocumentRequest {
  participantId: "A" | "B";
  name: string;
  content: string;
}

export interface RetrieveRequest {
  participantId: "A" | "B";
  query: string;
  topK?: number;
}

// ============================================
// UI State Types
// ============================================

export interface SelectedTurn {
  turnId: string;
  turnNumber: number;
}

export type AnalyticsTab = "trajectory" | "radar" | "retrieval" | "adaptive" | "debug";

export interface UIState {
  selectedTurn: SelectedTurn | null;
  activeAnalyticsTab: AnalyticsTab;
  showTraitOverlay: boolean;
  isGenerating: boolean;
}

// ============================================
// Export Types
// ============================================

export interface ExportData {
  version: string;
  exportedAt: string;
  participantA: Participant;
  participantB: Participant;
  scenario: Scenario;
  turns: ConversationTurn[];
  adaptiveSettings: AdaptiveSettings;
}
