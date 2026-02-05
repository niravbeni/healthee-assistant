'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ONBOARDING_QUESTIONS } from '@/types';
import { saveState, getState } from '@/lib/storage';
import QuestionCard from '@/components/onboarding/QuestionCard';
import DisclaimerModal from '@/components/ui/DisclaimerModal';

export default function OnboardingPage() {
  const router = useRouter();
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
    <main className="min-h-screen min-h-dvh bg-gradient-to-br from-[#D4D5E9] via-[#D2D3E8] to-white relative overflow-hidden">
      {/* Disclaimer modal */}
      <DisclaimerModal isOpen={showDisclaimer} onAccept={handleDisclaimerAccept} />

      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-[#D2D3E8]/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-white/50 rounded-full blur-3xl" />
      </div>

      {/* Welcome message (shown before first question starts being answered) */}
      {currentQuestion === 0 && answers.length === 0 && (
        <div className="absolute top-8 left-0 right-0 text-center">
          <h1 className="text-lg text-gray-500 font-light">
            Let&apos;s get to know each other
          </h1>
        </div>
      )}

      {/* Questions */}
      <div className="relative w-full h-screen h-dvh">
        {ONBOARDING_QUESTIONS.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            onAnswer={handleAnswer}
            isActive={currentQuestion === index && !isClassifying}
            questionNumber={index}
            totalQuestions={ONBOARDING_QUESTIONS.length}
          />
        ))}

        {/* Loading state */}
        {isClassifying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#D2D3E8]/50 animate-ping absolute inset-0" />
              <div className="w-16 h-16 rounded-full bg-[#9496B8] animate-pulse" />
            </div>
            <p className="mt-8 text-gray-600 font-light animate-pulse">
              Finding your perfect companion...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
