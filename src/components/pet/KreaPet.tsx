'use client';

import { PetState } from '@/types';
import { BlobScene } from './BlobScene';

interface KreaPetProps {
  state: PetState;
  audioLevel: number;
  onClick?: () => void;
}

export default function KreaPet({ state, audioLevel, onClick }: KreaPetProps) {
  // Calculate audio intensity based on state
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  
  // Base intensity: listening gets a moderate base to show it's active
  const baseIntensity = isSpeaking ? 0.4 : isListening ? 0.25 : 0.05;
  const audioIntensity = baseIntensity + audioLevel * 0.8;

  return (
    <div 
      className="w-full h-full cursor-pointer relative"
      onClick={onClick}
    >
      {/* Orange glow behind the blob */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className="w-[500px] h-[500px] rounded-full orange-glow"
          style={{
            opacity: isListening ? 0.85 : 0.8 + audioLevel * 0.15,
            transform: isListening ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.3s ease-out',
          }}
        />
      </div>
      
      {/* 3D Blob Scene */}
      <BlobScene audioIntensity={audioIntensity} isListening={isListening} />
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 gradient-overlay pointer-events-none" />
    </div>
  );
}
