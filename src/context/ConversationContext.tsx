"use client";

import React, { createContext, useContext, useReducer, ReactNode, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import type {
  ConversationState,
  ConversationTurn,
  Participant,
  Scenario,
  AdaptiveSettings,
  OceanProfile,
  UIState,
  AnalyticsTab,
  Document,
} from "@/lib/ocean/types";
import {
  DEFAULT_PARTICIPANT_A,
  DEFAULT_PARTICIPANT_B,
  DEFAULT_SCENARIO,
  DEFAULT_ADAPTIVE_SETTINGS,
  KREA_PARTICIPANT_A,
  KREA_PARTICIPANT_B,
  KREA_SCENARIO,
  BONOBO_PARTICIPANT_A,
  BONOBO_PARTICIPANT_B,
  BONOBO_SCENARIO,
} from "@/lib/ocean/constants";
import type { AssistantType } from "@/types";

// ============================================
// State Types
// ============================================

interface AppState {
  conversation: ConversationState;
  ui: UIState;
}

// ============================================
// Action Types
// ============================================

type Action =
  | { type: "SET_PARTICIPANT_A"; payload: Partial<Participant> }
  | { type: "SET_PARTICIPANT_B"; payload: Partial<Participant> }
  | { type: "SET_SCENARIO"; payload: Partial<Scenario> }
  | { type: "SET_ADAPTIVE_SETTINGS"; payload: Partial<AdaptiveSettings> }
  | { type: "ADD_TURN"; payload: ConversationTurn }
  | { type: "UPDATE_TURN"; payload: { turnId: string; updates: Partial<ConversationTurn> } }
  | { type: "START_CONVERSATION" }
  | { type: "PAUSE_CONVERSATION" }
  | { type: "RESUME_CONVERSATION" }
  | { type: "COMPLETE_CONVERSATION" }
  | { type: "RESET_CONVERSATION" }
  | { type: "SET_CURRENT_SPEAKER"; payload: "A" | "B" }
  | { type: "ADD_DOCUMENT"; payload: { participantId: "A" | "B"; document: Document } }
  | { type: "REMOVE_DOCUMENT"; payload: { participantId: "A" | "B"; documentId: string } }
  | { type: "SET_SELECTED_TURN"; payload: { turnId: string; turnNumber: number } | null }
  | { type: "SET_ANALYTICS_TAB"; payload: AnalyticsTab }
  | { type: "TOGGLE_TRAIT_OVERLAY" }
  | { type: "SET_GENERATING"; payload: boolean }
  | { type: "UPDATE_TRAJECTORY"; payload: { speaker: "A" | "B"; trajectory: OceanProfile } };

// ============================================
// Random Variation Helpers
// ============================================

function randomVariation(base: number, range: number = 15): number {
  const variation = (Math.random() - 0.5) * 2 * range;
  return Math.max(0, Math.min(100, Math.round(base + variation)));
}

function randomizeOcean(base: OceanProfile): OceanProfile {
  return {
    openness: randomVariation(base.openness),
    conscientiousness: randomVariation(base.conscientiousness),
    extraversion: randomVariation(base.extraversion),
    agreeableness: randomVariation(base.agreeableness),
    neuroticism: randomVariation(base.neuroticism),
  };
}

// Companion name variations
const KREA_NAMES = ["Dr. Krea", "Krea", "Dr. Chen", "Dr. Sarah", "Dr. Maya"];
const BONOBO_NAMES = ["Bonobo", "Coach Bo", "Bo", "Dr. Green", "Nurse Alex"];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================
// Build User Persona from Onboarding
// ============================================

function buildUserPersonaFromOnboarding(answers: string[]): string {
  if (!answers || answers.length === 0) {
    return "A person navigating their health journey, seeking guidance and support.";
  }

  const parts: string[] = [];
  
  // Q1: Health concerns
  if (answers[0]) {
    parts.push(`Currently concerned about: ${answers[0]}`);
  }
  
  // Q2: Past healthcare experiences
  if (answers[1]) {
    parts.push(`Past healthcare experiences: ${answers[1]}`);
  }
  
  // Q3: How they manage health
  if (answers[2]) {
    parts.push(`Health management approach: ${answers[2]}`);
  }
  
  // Q4: What prompts seeking care
  if (answers[3]) {
    parts.push(`Triggers for seeking care: ${answers[3]}`);
  }
  
  // Q5: Biggest challenges
  if (answers[4]) {
    parts.push(`Main health challenges: ${answers[4]}`);
  }

  return `A real person with the following health profile and concerns:\n${parts.join("\n")}\n\nThis persona is based on actual onboarding responses and should be treated with empathy and understanding.`;
}

function inferOceanFromAnswers(answers: string[]): OceanProfile {
  // Start with neutral baseline
  const profile: OceanProfile = {
    openness: 50,
    conscientiousness: 50,
    extraversion: 45,
    agreeableness: 60,
    neuroticism: 50,
  };

  if (!answers || answers.length === 0) return profile;

  // Analyze answer content for personality hints
  const allText = answers.join(" ").toLowerCase();

  // Check for anxiety/worry indicators
  if (allText.includes("anxious") || allText.includes("worried") || allText.includes("stress") || allText.includes("overwhelm")) {
    profile.neuroticism += 15;
  }

  // Check for organization indicators
  if (allText.includes("track") || allText.includes("routine") || allText.includes("schedule") || allText.includes("organized")) {
    profile.conscientiousness += 15;
  }

  // Check for social/support indicators
  if (allText.includes("alone") || allText.includes("myself") || allText.includes("private")) {
    profile.extraversion -= 10;
  }

  // Check for openness indicators
  if (allText.includes("research") || allText.includes("learn") || allText.includes("curious") || allText.includes("explore")) {
    profile.openness += 10;
  }

  // Add some randomness
  return {
    openness: randomVariation(profile.openness, 10),
    conscientiousness: randomVariation(profile.conscientiousness, 10),
    extraversion: randomVariation(profile.extraversion, 10),
    agreeableness: randomVariation(profile.agreeableness, 10),
    neuroticism: randomVariation(profile.neuroticism, 10),
  };
}

// ============================================
// Initial State Factory
// ============================================

function createInitialState(assistantType?: AssistantType, onboardingAnswers?: string[]): AppState {
  // Select presets based on assistant type
  let participantA: Participant;
  let participantB: Participant;
  let scenario: Scenario;

  if (assistantType === "krea") {
    // Randomize Krea companion
    participantA = {
      ...KREA_PARTICIPANT_A,
      name: pickRandom(KREA_NAMES),
      ocean: randomizeOcean(KREA_PARTICIPANT_A.ocean),
    };
    scenario = KREA_SCENARIO;
  } else if (assistantType === "bonobo") {
    // Randomize Bonobo companion
    participantA = {
      ...BONOBO_PARTICIPANT_A,
      name: pickRandom(BONOBO_NAMES),
      ocean: randomizeOcean(BONOBO_PARTICIPANT_A.ocean),
    };
    scenario = BONOBO_SCENARIO;
  } else {
    participantA = DEFAULT_PARTICIPANT_A;
    scenario = DEFAULT_SCENARIO;
  }

  // Build user persona from onboarding answers
  if (onboardingAnswers && onboardingAnswers.length > 0) {
    const userPersona = buildUserPersonaFromOnboarding(onboardingAnswers);
    const userOcean = inferOceanFromAnswers(onboardingAnswers);
    
    participantB = {
      id: "B",
      name: "You (User)",
      role: "Health Journey Participant",
      persona: userPersona,
      ocean: userOcean,
      documents: [],
    };
  } else {
    // Fallback to preset
    participantB = assistantType === "krea" 
      ? KREA_PARTICIPANT_B 
      : assistantType === "bonobo" 
        ? BONOBO_PARTICIPANT_B 
        : DEFAULT_PARTICIPANT_B;
  }

  return {
    conversation: {
      id: uuidv4(),
      participantA,
      participantB,
      scenario,
      turns: [],
      adaptiveSettings: DEFAULT_ADAPTIVE_SETTINGS,
      status: "idle",
      currentSpeaker: "A",
      trajectoryA: [],
      trajectoryB: [],
    },
    ui: {
      selectedTurn: null,
      activeAnalyticsTab: "trajectory",
      showTraitOverlay: true,
      isGenerating: false,
    },
  };
}

// ============================================
// Reducer
// ============================================

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_PARTICIPANT_A":
      return {
        ...state,
        conversation: {
          ...state.conversation,
          participantA: { ...state.conversation.participantA, ...action.payload },
        },
      };

    case "SET_PARTICIPANT_B":
      return {
        ...state,
        conversation: {
          ...state.conversation,
          participantB: { ...state.conversation.participantB, ...action.payload },
        },
      };

    case "SET_SCENARIO":
      return {
        ...state,
        conversation: {
          ...state.conversation,
          scenario: { ...state.conversation.scenario, ...action.payload },
        },
      };

    case "SET_ADAPTIVE_SETTINGS":
      return {
        ...state,
        conversation: {
          ...state.conversation,
          adaptiveSettings: { ...state.conversation.adaptiveSettings, ...action.payload },
        },
      };

    case "ADD_TURN":
      return {
        ...state,
        conversation: {
          ...state.conversation,
          turns: [...state.conversation.turns, action.payload],
          currentSpeaker: action.payload.speaker === "A" ? "B" : "A",
        },
      };

    case "UPDATE_TURN":
      return {
        ...state,
        conversation: {
          ...state.conversation,
          turns: state.conversation.turns.map((turn) =>
            turn.id === action.payload.turnId
              ? { ...turn, ...action.payload.updates }
              : turn
          ),
        },
      };

    case "START_CONVERSATION":
      return {
        ...state,
        conversation: {
          ...state.conversation,
          status: "running",
        },
      };

    case "PAUSE_CONVERSATION":
      return {
        ...state,
        conversation: {
          ...state.conversation,
          status: "paused",
        },
      };

    case "RESUME_CONVERSATION":
      return {
        ...state,
        conversation: {
          ...state.conversation,
          status: "running",
        },
      };

    case "COMPLETE_CONVERSATION":
      return {
        ...state,
        conversation: {
          ...state.conversation,
          status: "completed",
        },
      };

    case "RESET_CONVERSATION":
      return {
        ...state,
        conversation: {
          ...state.conversation,
          id: uuidv4(),
          turns: [],
          status: "idle",
          currentSpeaker: "A",
          trajectoryA: [],
          trajectoryB: [],
        },
        ui: {
          ...state.ui,
          selectedTurn: null,
        },
      };

    case "SET_CURRENT_SPEAKER":
      return {
        ...state,
        conversation: {
          ...state.conversation,
          currentSpeaker: action.payload,
        },
      };

    case "ADD_DOCUMENT": {
      const participantKey = action.payload.participantId === "A" ? "participantA" : "participantB";
      return {
        ...state,
        conversation: {
          ...state.conversation,
          [participantKey]: {
            ...state.conversation[participantKey],
            documents: [...state.conversation[participantKey].documents, action.payload.document],
          },
        },
      };
    }

    case "REMOVE_DOCUMENT": {
      const participantKey = action.payload.participantId === "A" ? "participantA" : "participantB";
      return {
        ...state,
        conversation: {
          ...state.conversation,
          [participantKey]: {
            ...state.conversation[participantKey],
            documents: state.conversation[participantKey].documents.filter(
              (doc) => doc.id !== action.payload.documentId
            ),
          },
        },
      };
    }

    case "SET_SELECTED_TURN":
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedTurn: action.payload,
        },
      };

    case "SET_ANALYTICS_TAB":
      return {
        ...state,
        ui: {
          ...state.ui,
          activeAnalyticsTab: action.payload,
        },
      };

    case "TOGGLE_TRAIT_OVERLAY":
      return {
        ...state,
        ui: {
          ...state.ui,
          showTraitOverlay: !state.ui.showTraitOverlay,
        },
      };

    case "SET_GENERATING":
      return {
        ...state,
        ui: {
          ...state.ui,
          isGenerating: action.payload,
        },
      };

    case "UPDATE_TRAJECTORY": {
      const trajectoryKey = action.payload.speaker === "A" ? "trajectoryA" : "trajectoryB";
      return {
        ...state,
        conversation: {
          ...state.conversation,
          [trajectoryKey]: [...state.conversation[trajectoryKey], action.payload.trajectory],
        },
      };
    }

    default:
      return state;
  }
}

// ============================================
// Context
// ============================================

interface ConversationContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Convenience actions
  setParticipantA: (updates: Partial<Participant>) => void;
  setParticipantB: (updates: Partial<Participant>) => void;
  setScenario: (updates: Partial<Scenario>) => void;
  setAdaptiveSettings: (updates: Partial<AdaptiveSettings>) => void;
  addTurn: (turn: ConversationTurn) => void;
  updateTurn: (turnId: string, updates: Partial<ConversationTurn>) => void;
  startConversation: () => void;
  pauseConversation: () => void;
  resumeConversation: () => void;
  completeConversation: () => void;
  resetConversation: () => void;
  addDocument: (participantId: "A" | "B", document: Document) => void;
  removeDocument: (participantId: "A" | "B", documentId: string) => void;
  setSelectedTurn: (turnId: string | null, turnNumber?: number) => void;
  setAnalyticsTab: (tab: AnalyticsTab) => void;
  toggleTraitOverlay: () => void;
  setGenerating: (isGenerating: boolean) => void;
  updateTrajectory: (speaker: "A" | "B", trajectory?: OceanProfile) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

// ============================================
// Provider
// ============================================

interface ConversationProviderProps {
  children: ReactNode;
  assistantType?: AssistantType;
  onboardingAnswers?: string[];
}

export function ConversationProvider({ children, assistantType, onboardingAnswers }: ConversationProviderProps) {
  // Create initial state based on assistant type and onboarding answers
  const initialStateForType = useMemo(
    () => createInitialState(assistantType, onboardingAnswers), 
    [assistantType, onboardingAnswers]
  );
  const [state, dispatch] = useReducer(reducer, initialStateForType);

  const value: ConversationContextType = {
    state,
    dispatch,
    setParticipantA: (updates) => dispatch({ type: "SET_PARTICIPANT_A", payload: updates }),
    setParticipantB: (updates) => dispatch({ type: "SET_PARTICIPANT_B", payload: updates }),
    setScenario: (updates) => dispatch({ type: "SET_SCENARIO", payload: updates }),
    setAdaptiveSettings: (updates) => dispatch({ type: "SET_ADAPTIVE_SETTINGS", payload: updates }),
    addTurn: (turn) => dispatch({ type: "ADD_TURN", payload: turn }),
    updateTurn: (turnId, updates) => dispatch({ type: "UPDATE_TURN", payload: { turnId, updates } }),
    startConversation: () => dispatch({ type: "START_CONVERSATION" }),
    pauseConversation: () => dispatch({ type: "PAUSE_CONVERSATION" }),
    resumeConversation: () => dispatch({ type: "RESUME_CONVERSATION" }),
    completeConversation: () => dispatch({ type: "COMPLETE_CONVERSATION" }),
    resetConversation: () => dispatch({ type: "RESET_CONVERSATION" }),
    addDocument: (participantId, document) =>
      dispatch({ type: "ADD_DOCUMENT", payload: { participantId, document } }),
    removeDocument: (participantId, documentId) =>
      dispatch({ type: "REMOVE_DOCUMENT", payload: { participantId, documentId } }),
    setSelectedTurn: (turnId, turnNumber) =>
      dispatch({
        type: "SET_SELECTED_TURN",
        payload: turnId ? { turnId, turnNumber: turnNumber || 0 } : null,
      }),
    setAnalyticsTab: (tab) => dispatch({ type: "SET_ANALYTICS_TAB", payload: tab }),
    toggleTraitOverlay: () => dispatch({ type: "TOGGLE_TRAIT_OVERLAY" }),
    setGenerating: (isGenerating) => dispatch({ type: "SET_GENERATING", payload: isGenerating }),
    updateTrajectory: (speaker, trajectory) => {
      if (trajectory) {
        dispatch({ type: "UPDATE_TRAJECTORY", payload: { speaker, trajectory } });
      }
    },
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useConversation() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error("useConversation must be used within a ConversationProvider");
  }
  return context;
}
