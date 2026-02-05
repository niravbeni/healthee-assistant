import { HealtheeState, DEFAULT_STATE, ConversationMessage } from '@/types';

const STORAGE_KEY = 'healthee_state';
const MAX_CONVERSATION_TURNS = 5;

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get the current state from localStorage
 */
export function getState(): HealtheeState {
  if (!isBrowser()) {
    return DEFAULT_STATE;
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_STATE;
    }
    return { ...DEFAULT_STATE, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_STATE;
  }
}

/**
 * Save state to localStorage
 */
export function saveState(state: Partial<HealtheeState>): void {
  if (!isBrowser()) {
    return;
  }
  
  try {
    const current = getState();
    const updated = { ...current, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

/**
 * Reset all state (used for clearing data)
 */
export function resetState(): void {
  if (!isBrowser()) {
    return;
  }
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset state:', error);
  }
}

/**
 * Check if onboarding is complete
 */
export function isOnboardingComplete(): boolean {
  const state = getState();
  return state.assistantType !== null && state.onboardingAnswers.length === 5;
}

/**
 * Add a message to conversation history (keeps last N turns)
 */
export function addConversationMessage(message: ConversationMessage): void {
  const state = getState();
  const history = [...state.conversationHistory, message];
  
  // Keep only the last MAX_CONVERSATION_TURNS * 2 messages (user + assistant pairs)
  const trimmed = history.slice(-(MAX_CONVERSATION_TURNS * 2));
  
  saveState({
    conversationHistory: trimmed,
    lastInteraction: new Date().toISOString(),
  });
}

/**
 * Update bond level (clamped 0-100)
 */
export function updateBondLevel(delta: number): void {
  const state = getState();
  const newLevel = Math.max(0, Math.min(100, state.bondLevel + delta));
  saveState({ bondLevel: newLevel });
}

/**
 * Get bond level description for prompts
 */
export function getBondDescription(bondLevel: number): string {
  if (bondLevel < 30) {
    return 'The user is new and the bond is still forming. Be gentle and welcoming.';
  } else if (bondLevel < 60) {
    return 'There is a growing connection. Show warmth and familiarity.';
  } else if (bondLevel < 85) {
    return 'There is a strong bond. Be affectionate and show that you care deeply.';
  } else {
    return 'The bond is very deep. Show profound care and emotional closeness.';
  }
}
