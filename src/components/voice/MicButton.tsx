'use client';

import { useState, useCallback } from 'react';

interface MicButtonProps {
  onRecordingStart: () => void;
  onRecordingStop: () => void;
  isRecording: boolean;
  isProcessing: boolean;
  disabled?: boolean;
  className?: string;
}

export default function MicButton({
  onRecordingStart,
  onRecordingStop,
  isRecording,
  isProcessing,
  disabled = false,
  className = '',
}: MicButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled || isProcessing) return;
    e.preventDefault();
    setIsPressed(true);
    onRecordingStart();
  }, [disabled, isProcessing, onRecordingStart]);

  const handlePointerUp = useCallback(() => {
    if (!isPressed) return;
    setIsPressed(false);
    onRecordingStop();
  }, [isPressed, onRecordingStop]);

  const handlePointerLeave = useCallback(() => {
    if (isPressed) {
      setIsPressed(false);
      onRecordingStop();
    }
  }, [isPressed, onRecordingStop]);

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerUp}
      disabled={disabled || isProcessing}
      className={`
        relative w-16 h-16 rounded-full 
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-white/50
        ${isRecording 
          ? 'bg-red-500 scale-110 shadow-lg shadow-red-500/30' 
          : 'bg-white/20 backdrop-blur-sm hover:bg-white/30'
        }
        ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      aria-label={isRecording ? 'Release to stop recording' : 'Hold to speak'}
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

      {/* Recording pulse animation */}
      {isRecording && (
        <>
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
          <span className="absolute inset-0 rounded-full bg-red-400 animate-pulse opacity-20" />
        </>
      )}

      {/* Processing spinner */}
      {isProcessing && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-8 h-8 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
    </button>
  );
}
