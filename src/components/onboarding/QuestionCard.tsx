'use client';

import { useState, useEffect, useRef } from 'react';
import { OnboardingQuestion } from '@/types';

interface QuestionCardProps {
  question: OnboardingQuestion;
  onAnswer: (answer: string) => void;
  isActive: boolean;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuestionCard({
  question,
  onAnswer,
  isActive,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const [answer, setAnswer] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isActive && textareaRef.current) {
      // Small delay to allow transition to complete
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onAnswer(answer.trim());
      setAnswer('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center px-6 transition-all duration-500 ease-out ${
        isActive
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8 pointer-events-none'
      }`}
      style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
    >
      <div className="w-full max-w-md">
        {/* Question */}
        <h2 className="text-2xl md:text-3xl text-gray-800 text-center mb-12 leading-relaxed font-normal">
          {question.question}
        </h2>

        {/* Answer form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea
            ref={textareaRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={question.placeholder}
            rows={4}
            className="w-full px-4 py-4 bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl 
                     text-gray-700 placeholder-gray-400 resize-none
                     focus:outline-none focus:ring-2 focus:ring-[#9496B8]/50 focus:border-transparent
                     transition-all duration-200"
            style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
          />

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!answer.trim()}
              className={`px-8 py-3 rounded-full transition-all duration-200 ${
                answer.trim()
                  ? 'bg-[#9496B8] text-white hover:bg-[#7D7FA3] shadow-lg shadow-[#D2D3E8] cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              style={{ fontFamily: 'var(--font-newsreader), Georgia, serif' }}
            >
              {questionNumber < totalQuestions - 1 ? 'Continue' : 'Meet your companion'}
            </button>
          </div>
        </form>

        {/* Skip option */}
        <p className="text-center mt-6 text-sm text-gray-400">
          Press Enter to continue
        </p>
      </div>
    </div>
  );
}
