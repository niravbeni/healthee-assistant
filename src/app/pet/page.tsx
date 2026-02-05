'use client';

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import type { PetState, AssistantType } from '@/types';
import { getState, saveState, updateBondLevel, isOnboardingComplete } from '@/lib/storage';
import PetCanvas from '@/components/pet/PetCanvas';
import ResetButton from '@/components/ui/ResetButton';
import Transcript from '@/components/ui/Transcript';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import { useConversation } from '@/hooks/useConversation';

// Lazy load Ocean Duet app
const OceanDuetApp = lazy(() => import('@/components/ocean-duet/OceanDuetApp'));

export default function PetPage() {
  const router = useRouter();
  const [assistantType, setAssistantType] = useState<AssistantType | null>(null);
  const [bondLevel, setBondLevel] = useState(50);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showOceanDuet, setShowOceanDuet] = useState(false);
  const [onboardingAnswers, setOnboardingAnswers] = useState<string[]>([]);
  const [showIntro, setShowIntro] = useState(false);
  
  const hasGreetedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const mountedRef = useRef(false);

  // Initialize hooks after we have assistant type
  const { speak, stop: stopSpeaking, isPlaying, audioLevel: speakerAudioLevel } = useAudioPlayback({});

  const { sendMessage, getInitialGreeting, isProcessing: isChatProcessing, conversationHistory } = useConversation({
    assistantType: assistantType || 'bonobo',
  });

  const handleTranscription = useCallback(async (text: string) => {
    if (!text.trim() || !assistantType || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    
    // Stop any current speech
    stopSpeaking();
    
    // Get response
    const response = await sendMessage(text);
    
    if (response) {
      await speak(response, assistantType);
    }
    
    isProcessingRef.current = false;
  }, [assistantType, sendMessage, speak, stopSpeaking]);

  const { 
    isRecording, 
    isProcessing: isTranscribing, 
    startRecording, 
    stopRecording,
    audioLevel: micAudioLevel,
    liveTranscript,
  } = useVoiceInput({
    onTranscription: handleTranscription,
    onError: (error) => console.error('Voice error:', error),
  });

  // Compute pet state based on current activity
  const effectivePetState: PetState = isRecording 
    ? 'listening' 
    : isChatProcessing || isTranscribing
      ? 'thinking'
      : isPlaying 
        ? 'speaking' 
        : 'idle';

  // Compute effective audio level based on state
  const effectiveAudioLevel = isRecording ? micAudioLevel : isPlaying ? speakerAudioLevel : 0;

  // Stop pet speaking when user starts recording
  useEffect(() => {
    if (isRecording && isPlaying) {
      stopSpeaking();
    }
  }, [isRecording, isPlaying, stopSpeaking]);

  // Load state and check onboarding
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    
    if (!isOnboardingComplete()) {
      router.replace('/onboarding');
      return;
    }

    const state = getState();
    setAssistantType(state.assistantType);
    setBondLevel(state.bondLevel);
    setOnboardingAnswers(state.onboardingAnswers || []);
    setIsInitialized(true);
  }, [router]);

  // Initial greeting and intro text
  useEffect(() => {
    if (!isInitialized || !assistantType || hasGreetedRef.current) return;
    
    const state = getState();
    if (state.initialGreetingShown) {
      hasGreetedRef.current = true;
      return;
    }

    hasGreetedRef.current = true;
    
    // Show intro text
    setShowIntro(true);
    
    // Fade out intro after 6 seconds
    const introTimer = setTimeout(() => {
      setShowIntro(false);
    }, 6000);
    
    // Delay greeting slightly for better UX
    const greetingTimer = setTimeout(async () => {
      const greeting = await getInitialGreeting();
      if (greeting) {
        await speak(greeting, assistantType);
      }
    }, 1000);

    return () => {
      clearTimeout(introTimer);
      clearTimeout(greetingTimer);
    };
  }, [isInitialized, assistantType, getInitialGreeting, speak]);

  // Spacebar support for push-to-talk
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.code === 'Space' && !e.repeat && !isRecording && !isTranscribing && !isChatProcessing) {
        e.preventDefault();
        startRecording();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isRecording) {
        e.preventDefault();
        stopRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRecording, isTranscribing, isChatProcessing, startRecording, stopRecording]);

  // Handle pet click
  const handlePetClick = useCallback(() => {
    if (assistantType === 'bonobo') {
      updateBondLevel(2);
      setBondLevel(prev => Math.min(100, prev + 2));
    }
  }, [assistantType]);

  // Handle pet petting (Bonobo only)
  const handlePet = useCallback(() => {
    updateBondLevel(1);
    setBondLevel(prev => Math.min(100, prev + 1));
  }, []);

  // Switch between pets
  const handleSwitchPet = useCallback(() => {
    const newType: AssistantType = assistantType === 'krea' ? 'bonobo' : 'krea';
    setAssistantType(newType);
    saveState({ assistantType: newType });
  }, [assistantType]);

  // Handle mic button press/release
  const handleMicDown = useCallback(() => {
    if (!isRecording && !isTranscribing && !isChatProcessing) {
      startRecording();
    }
  }, [isRecording, isTranscribing, isChatProcessing, startRecording]);

  const handleMicUp = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
  }, [isRecording, stopRecording]);

  if (!isInitialized || !assistantType) {
    return (
      <main className="min-h-screen min-h-dvh bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-purple-300/50 animate-ping absolute inset-0" />
          <div className="w-12 h-12 rounded-full bg-purple-400 animate-pulse" />
        </div>
      </main>
    );
  }

  // Show Ocean Duet app when toggled
  if (showOceanDuet) {
    return (
      <Suspense fallback={
        <main className="min-h-screen min-h-dvh bg-background flex items-center justify-center">
          <div className="text-muted-foreground">Loading OCEAN Duet...</div>
        </main>
      }>
        <OceanDuetApp 
          onClose={() => setShowOceanDuet(false)} 
          assistantType={assistantType} 
          onboardingAnswers={onboardingAnswers}
        />
      </Suspense>
    );
  }

  // Pet intro descriptions
  const petIntros = {
    krea: {
      name: 'Krea',
      description: "I'm here to help you stay on top of your health. I'll handle the mental load of scheduling, reminders, and keeping track of everything so you don't have to worry.",
    },
    bonobo: {
      name: 'Bonobo', 
      description: "I'm here to be your companion on your health journey. When you take care of me, I take care of you. Let's support each other!",
    },
  };

  return (
    <main className="relative w-full h-screen h-dvh overflow-hidden">
      {/* Pet Canvas - Full screen */}
      <div className="absolute inset-0">
        <PetCanvas
          assistantType={assistantType}
          state={effectivePetState}
          audioLevel={effectiveAudioLevel}
          bondLevel={bondLevel}
          onClick={handlePetClick}
          onPet={handlePet}
        />
      </div>

      {/* Intro text - shows on first visit */}
      <div 
        className={`absolute inset-x-0 top-1/4 z-20 flex justify-center items-center px-8 transition-all duration-1000 ${
          showIntro ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="max-w-lg text-center">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-4">
            Hi, I&apos;m {petIntros[assistantType].name}!
          </h1>
          <p className="text-white/80 text-lg md:text-xl leading-relaxed">
            {petIntros[assistantType].description}
          </p>
        </div>
      </div>

      {/* Live transcript display */}
      {(isRecording || liveTranscript) && (
        <div className="absolute bottom-32 left-0 right-0 flex justify-center px-6 z-10">
          <div className="max-w-md w-full">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 min-h-[60px]">
              {liveTranscript ? (
                <p className="text-white text-center text-sm leading-relaxed">
                  {liveTranscript}
                  <span className="inline-block w-1 h-4 bg-white/60 ml-1 animate-pulse" />
                </p>
              ) : (
                <p className="text-white/50 text-center text-sm italic">
                  Listening...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mic Button - Bottom center */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center z-10">
        <button
          onPointerDown={handleMicDown}
          onPointerUp={handleMicUp}
          onPointerLeave={handleMicUp}
          disabled={isTranscribing || isChatProcessing}
          className={`relative w-16 h-16 rounded-full transition-all duration-200 ease-out cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-white/50
            ${isRecording 
              ? 'bg-red-500 scale-110 shadow-lg shadow-red-500/30' 
              : isTranscribing || isChatProcessing
                ? 'bg-white/10 backdrop-blur-sm opacity-50 cursor-wait'
                : 'bg-white/20 backdrop-blur-sm hover:bg-white/30'
            }`}
          aria-label={isRecording ? 'Release to stop' : 'Hold to speak'}
        >
          {/* Mic icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`w-8 h-8 mx-auto transition-colors ${
              isRecording ? 'text-white' : 'text-white/80'
            }`}
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>

          {/* Recording pulse */}
          {isRecording && (
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
          )}
        </button>
        
        {/* Status text with pulsing dots for processing states */}
        <div className="text-center mt-3 text-sm font-light text-white/70 h-5">
          {isRecording ? (
            'Listening...'
          ) : isTranscribing || isChatProcessing ? (
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          ) : (
            'Hold to speak (or spacebar)'
          )}
        </div>
      </div>

      {/* Pet switch button - Top left */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <button
          onClick={handleSwitchPet}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer"
          aria-label="Switch pet"
        >
          <span className={`w-3 h-3 rounded-full ${assistantType === 'krea' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
          <span className="text-sm font-medium text-white">
            {assistantType === 'krea' ? 'Krea' : 'Bonobo'}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 text-white/70"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
            />
          </svg>
        </button>

        {/* Ocean Duet toggle button - hidden/reveal eye icon */}
        <button
          onClick={() => setShowOceanDuet(true)}
          className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer"
          aria-label="Open OCEAN Duet"
          title="Open OCEAN Duet"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      {/* Top bar with reset and transcript toggle */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer"
          aria-label="Toggle transcript"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
        </button>
        <ResetButton lightText />
      </div>

      {/* Transcript panel */}
      <Transcript
        messages={conversationHistory}
        isOpen={showTranscript}
        onClose={() => setShowTranscript(false)}
      />
    </main>
  );
}
