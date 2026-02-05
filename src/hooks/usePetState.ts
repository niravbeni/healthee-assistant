'use client';

import { useState, useEffect, useCallback } from 'react';
import { HealtheeState, DEFAULT_STATE, AssistantType } from '@/types';
import { getState, saveState, resetState as clearStorage } from '@/lib/storage';

interface UsePetStateReturn {
  state: HealtheeState;
  isLoading: boolean;
  updateState: (updates: Partial<HealtheeState>) => void;
  resetState: () => void;
  isOnboarded: boolean;
}

export function usePetState(): UsePetStateReturn {
  const [state, setState] = useState<HealtheeState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = getState();
    setState(stored);
    setIsLoading(false);
  }, []);

  // Update state and persist
  const updateState = useCallback((updates: Partial<HealtheeState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      saveState(updates);
      return newState;
    });
  }, []);

  // Reset all state
  const resetState = useCallback(() => {
    clearStorage();
    setState(DEFAULT_STATE);
  }, []);

  // Check if onboarding is complete
  const isOnboarded = state.assistantType !== null && state.onboardingAnswers.length === 5;

  return {
    state,
    isLoading,
    updateState,
    resetState,
    isOnboarded,
  };
}

/**
 * Hook to get just the assistant type
 */
export function useAssistantType(): AssistantType | null {
  const [assistantType, setAssistantType] = useState<AssistantType | null>(null);

  useEffect(() => {
    const state = getState();
    setAssistantType(state.assistantType);
  }, []);

  return assistantType;
}

/**
 * Hook to manage bond level
 */
export function useBondLevel(): [number, (delta: number) => void] {
  const [bondLevel, setBondLevel] = useState(50);

  useEffect(() => {
    const state = getState();
    setBondLevel(state.bondLevel);
  }, []);

  const updateBond = useCallback((delta: number) => {
    setBondLevel(prev => {
      const newLevel = Math.max(0, Math.min(100, prev + delta));
      saveState({ bondLevel: newLevel });
      return newLevel;
    });
  }, []);

  return [bondLevel, updateBond];
}
