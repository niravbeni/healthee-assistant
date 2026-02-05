'use client';

import { useState, useCallback, useRef } from 'react';
import { AssistantType, ConversationMessage } from '@/types';
import { addConversationMessage, getState, saveState } from '@/lib/storage';

interface UseConversationOptions {
  assistantType: AssistantType;
  onStreamingText?: (text: string) => void;
}

interface UseConversationReturn {
  sendMessage: (text: string) => Promise<string | null>;
  getInitialGreeting: () => Promise<string | null>;
  isProcessing: boolean;
  conversationHistory: ConversationMessage[];
  streamingText: string;
}

export function useConversation(options: UseConversationOptions): UseConversationReturn {
  const { assistantType, onStreamingText } = options;
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>(() => {
    if (typeof window !== 'undefined') {
      return getState().conversationHistory;
    }
    return [];
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string): Promise<string | null> => {
    if (!text.trim()) return null;

    setIsProcessing(true);
    setStreamingText('');

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
      
      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          assistantType,
          conversationHistory: state.conversationHistory,
          bondLevel: state.bondLevel,
          onboardingAnswers: state.onboardingAnswers,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamingText(fullText);
        onStreamingText?.(fullText);
      }

      // Clear streaming text after complete
      setStreamingText('');

      // Add assistant message to history
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: fullText,
        timestamp: new Date().toISOString(),
      };
      
      addConversationMessage(assistantMessage);
      setConversationHistory(prev => [...prev, assistantMessage]);

      return fullText;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return null;
      }
      console.error('Conversation error:', error);
      return "I'm having a moment... could you try again?";
    } finally {
      setIsProcessing(false);
      setStreamingText('');
    }
  }, [assistantType, onStreamingText]);

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
    streamingText,
  };
}
