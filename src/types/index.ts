// Assistant types
export type AssistantType = 'krea' | 'bonobo';

// Pet animation states
export type PetState = 'idle' | 'listening' | 'thinking' | 'speaking';

// Classification result from GPT
export interface ClassificationResult {
  assistantType: AssistantType;
  confidenceScore: number;
}

// Conversation message
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Main app state stored in localStorage
export interface HealtheeState {
  assistantType: AssistantType | null;
  onboardingAnswers: string[];
  conversationHistory: ConversationMessage[];
  bondLevel: number; // 0-100, mainly affects Bonobo
  lastInteraction: string | null; // ISO timestamp
  hasSeenDisclaimer: boolean;
  initialGreetingShown: boolean;
}

// Onboarding question structure
export interface OnboardingQuestion {
  id: number;
  question: string;
  placeholder: string;
}

// API request/response types
export interface ClassifyRequest {
  answers: string[];
}

export interface ClassifyResponse {
  assistantType: AssistantType;
  confidenceScore: number;
}

export interface ChatRequest {
  message: string;
  assistantType: AssistantType;
  conversationHistory: ConversationMessage[];
  bondLevel: number;
  onboardingAnswers: string[];
  isInitialGreeting?: boolean;
}

export interface ChatResponse {
  message: string;
}

export interface TranscribeRequest {
  audio: Blob;
}

export interface TranscribeResponse {
  text: string;
}

export interface TTSRequest {
  text: string;
  voice: 'shimmer' | 'nova';
}

// Default state
export const DEFAULT_STATE: HealtheeState = {
  assistantType: null,
  onboardingAnswers: [],
  conversationHistory: [],
  bondLevel: 50,
  lastInteraction: null,
  hasSeenDisclaimer: false,
  initialGreetingShown: false,
};

// Onboarding questions
export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 1,
    question: "Is there anything about your health that's been on your mind lately?",
    placeholder: "Take your time... there's no right answer.",
  },
  {
    id: 2,
    question: "Have you had any healthcare experiences that felt stressful or frustrating?",
    placeholder: "It could be anything, big or small.",
  },
  {
    id: 3,
    question: "How do you usually manage your health today?",
    placeholder: "Whatever works for you is valid.",
  },
  {
    id: 4,
    question: "What tends to prompt you to seek care, if at all?",
    placeholder: "There's no judgment here.",
  },
  {
    id: 5,
    question: "What do you find hardest about dealing with your health?",
    placeholder: "Be as honest as you'd like.",
  },
];
