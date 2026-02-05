'use client';

import { useState, useCallback } from 'react';
import { AssistantType, ConversationMessage } from '@/types';
import { addConversationMessage, getState, saveState } from '@/lib/storage';

interface UseConversationOptions {
  assistantType: AssistantType;
}

interface UseConversationReturn {
  sendMessage: (text: string) => Promise<string | null>;
  getInitialGreeting: () => Promise<string | null>;
  isProcessing: boolean;
  conversationHistory: ConversationMessage[];
}

export function useConversation(options: UseConversationOptions): UseConversationReturn {
  const { assistantType } = options;
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>(() => {
    if (typeof window !== 'undefined') {
      return getState().conversationHistory;
    }
    return [];
  });

  const sendMessage = useCallback(async (text: string): Promise<string | null> => {
    if (!text.trim()) return null;

    setIsProcessing(true);

    // Add user message to history
    const userMessage: ConversationMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    
    addConversationMessage(userMessage);
    setConversationHistory(prev => [...prev, userMessage]);

    try {
      const state = getState();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          assistantType,
          conversationHistory: state.conversationHistory,
          bondLevel: state.bondLevel,
          onboardingAnswers: state.onboardingAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const result = await response.json();
      const responseText = result.message;

      // Add assistant message to history
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      };
      
      addConversationMessage(assistantMessage);
      setConversationHistory(prev => [...prev, assistantMessage]);

      return responseText;
    } catch (error) {
      console.error('Conversation error:', error);
      return "I'm having a moment... could you try again?";
    } finally {
      setIsProcessing(false);
    }
  }, [assistantType]);

  const getInitialGreeting = useCallback(async (): Promise<string | null> => {
    setIsProcessing(true);

    try {
      const state = getState();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '',
          assistantType,
          conversationHistory: [],
          bondLevel: state.bondLevel,
          onboardingAnswers: state.onboardingAnswers,
          isInitialGreeting: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Greeting request failed');
      }

      const result = await response.json();
      const greetingText = result.message;

      // Add greeting to history
      const greetingMessage: ConversationMessage = {
        role: 'assistant',
        content: greetingText,
        timestamp: new Date().toISOString(),
      };
      
      addConversationMessage(greetingMessage);
      setConversationHistory([greetingMessage]);
      
      // Mark initial greeting as shown
      saveState({ initialGreetingShown: true });

      return greetingText;
    } catch (error) {
      console.error('Greeting error:', error);
      return assistantType === 'krea'
        ? "Hello... I'm glad you're here. I'll be taking care of the little things so you don't have to worry."
        : "Hi there! I'm so happy to meet you. I think we're going to be great friends.";
    } finally {
      setIsProcessing(false);
    }
  }, [assistantType]);

  return {
    sendMessage,
    getInitialGreeting,
    isProcessing,
    conversationHistory,
  };
}
