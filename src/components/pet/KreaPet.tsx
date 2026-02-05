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
  // Higher intensity when speaking or listening
  const baseIntensity = state === 'speaking' ? 0.3 : state === 'listening' ? 0.2 : 0.05;
  const audioIntensity = baseIntensity + audioLevel * 0.7;

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
            opacity: 0.8 + audioLevel * 0.2,
          }}
        />
      </div>
      
      {/* 3D Blob Scene */}
      <BlobScene audioIntensity={audioIntensity} />
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 gradient-overlay pointer-events-none" />
    </div>
  );
}
