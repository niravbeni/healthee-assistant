'use client';

import { useState, useCallback } from 'react';
import { resetState } from '@/lib/storage';

interface ResetButtonProps {
  onReset?: () => void;
  lightText?: boolean;
}

export default function ResetButton({ onReset, lightText = false }: ResetButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const handleReset = useCallback(() => {
    resetState();
    setShowConfirm(false);
    onReset?.();
    // Reload the page to start fresh
    window.location.href = '/';
  }, [onReset]);

  const handleCancel = useCallback(() => {
    setShowConfirm(false);
  }, []);

  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/30 backdrop-blur-sm cursor-pointer" 
          onClick={handleCancel} 
        />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Start over?
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            This will clear all your data and conversations. You&apos;ll go through onboarding again.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 
                       rounded-full font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white 
                       rounded-full font-medium transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="relative p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
      title="Reset app"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`w-5 h-5 ${lightText ? 'text-white' : 'text-gray-600'}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
    </button>
  );
}
