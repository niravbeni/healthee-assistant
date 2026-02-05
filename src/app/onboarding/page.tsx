'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ONBOARDING_QUESTIONS } from '@/types';
import { saveState, getState } from '@/lib/storage';
import QuestionCard from '@/components/onboarding/QuestionCard';
import DisclaimerModal from '@/components/ui/DisclaimerModal';

export default function OnboardingPage() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if already onboarded
    const state = getState();
    if (state.assistantType) {
      router.replace('/pet');
      return;
    }
    // Show disclaimer if not seen
    if (!state.hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }
  }, [router]);

  const handleDisclaimerAccept = () => {
    saveState({ hasSeenDisclaimer: true });
    setShowDisclaimer(false);
  };

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < ONBOARDING_QUESTIONS.length - 1) {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered - classify and redirect
      setIsClassifying(true);
      
      try {
        const response = await fetch('/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: newAnswers }),
        });

        if (!response.ok) {
          throw new Error('Classification failed');
        }

        const result = await response.json();
        
        // Save state
        saveState({
          assistantType: result.assistantType,
          onboardingAnswers: newAnswers,
          initialGreetingShown: false,
        });

        // Navigate to pet page
        router.push('/pet');
      } catch (error) {
        console.error('Classification error:', error);
        // Default to bonobo on error
        saveState({
          assistantType: 'bonobo',
          onboardingAnswers: newAnswers,
          initialGreetingShown: false,
        });
        router.push('/pet');
      }
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen min-h-dvh bg-gradient-to-br from-[#D4D5E9] via-[#D2D3E8] to-white relative overflow-hidden" style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}>
      {/* Disclaimer modal */}
      <DisclaimerModal isOpen={showDisclaimer} onAccept={handleDisclaimerAccept} />

      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-[#D2D3E8]/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-white/50 rounded-full blur-3xl" />
      </div>

      {/* Healthee logo at top */}
      <div className="absolute top-12 left-0 right-0 text-center z-10">
        <h1 className="text-3xl md:text-4xl text-gray-800 font-bold italic" style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}>
          Healthee
        </h1>
      </div>

      {/* Intro screen */}
      {showIntro && !showDisclaimer && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center px-8 z-20"
          style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
        >
          <div className="max-w-sm text-center">
            <h2 className="text-3xl md:text-4xl text-gray-800 mb-16">
              Hi there 👋
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-16">
              Let&apos;s start by getting to know you. You can answer as much or as little as you like...
            </p>
            
            <button
              onClick={() => setShowIntro(false)}
              className="px-8 py-3 rounded-full bg-[#9496B8] text-white hover:bg-[#7D7FA3] shadow-lg shadow-[#D2D3E8] cursor-pointer transition-all duration-200"
              style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
            >
              Get started
            </button>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className={`relative w-full h-screen h-dvh transition-opacity duration-500 ${showIntro ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {ONBOARDING_QUESTIONS.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            onAnswer={handleAnswer}
            isActive={currentQuestion === index && !isClassifying && !showIntro}
            questionNumber={index}
            totalQuestions={ONBOARDING_QUESTIONS.length}
          />
        ))}

        {/* Loading state */}
        {isClassifying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}>
            {/* Pulsing dots */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-3 h-3 rounded-full bg-[#9496B8] animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 rounded-full bg-[#9496B8] animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 rounded-full bg-[#9496B8] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-gray-600">
              Finding your perfect companion...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
