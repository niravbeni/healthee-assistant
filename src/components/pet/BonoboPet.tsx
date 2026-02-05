'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { PetState } from '@/types';

interface BonoboPetProps {
  state: PetState;
  audioLevel: number;
  bondLevel: number;
  onClick?: () => void;
  onPet?: () => void;
}

export default function BonoboPet({ 
  state, 
  audioLevel, 
  bondLevel: _bondLevel, 
  onClick,
  onPet 
}: BonoboPetProps) {
  // bondLevel reserved for future use
  void _bondLevel;
  
  const [isBeingPetted, setIsBeingPetted] = useState(false);
  const [happyLevel, setHappyLevel] = useState(0);
  const [bounce, setBounce] = useState(0);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Animation loop for idle bounce
  useEffect(() => {
    startTimeRef.current = Date.now();
    
    const animate = () => {
      const time = Date.now() - startTimeRef.current;
      
      // Gentle bounce animation
      const bounceAmount = Math.sin(time / 1000) * 8 * (1 + happyLevel * 0.5);
      setBounce(bounceAmount);
      
      // Decay happy level
      setHappyLevel(prev => Math.max(0, prev - 0.005));
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationRef.current);
  }, [happyLevel]);

  // Handle interactions
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsBeingPetted(true);
    setHappyLevel(prev => Math.min(1, prev + 0.3));
    onPet?.();
  }, [onPet]);

  const handlePointerUp = useCallback(() => {
    setIsBeingPetted(false);
  }, []);

  const handleClick = useCallback(() => {
    setHappyLevel(prev => Math.min(1, prev + 0.2));
    onClick?.();
  }, [onClick]);

  // Calculate mouth animation based on audio level and state - direct mapping for instant sync
  // Always show a base smile, animate bigger when speaking
  const mouthOpen = state === 'speaking' ? audioLevel : 0;
  const mouthWidth = 60 + mouthOpen * 40; // 60-100px wide
  const mouthHeight = 8 + mouthOpen * 35; // 8-43px tall (small smile at rest)
  
  // Squish effect when being petted
  const scaleX = isBeingPetted ? 1.05 : 1;
  const scaleY = isBeingPetted ? 0.95 : 1;

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      {/* Green glow behind the pet */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full green-glow"
          style={{
            opacity: 0.8 + audioLevel * 0.2,
          }}
        />
      </div>

      <div 
        className="relative cursor-pointer select-none z-10"
        style={{
          transform: `translateY(${bounce}px) scaleX(${scaleX}) scaleY(${scaleY})`,
          transition: isBeingPetted ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
        }}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Main pet image - much larger size */}
        <Image
          src="/bonobo.png"
          alt="Bonobo pet"
          width={700}
          height={933}
          className="pointer-events-none"
          style={{
            filter: state === 'listening' ? 'brightness(1.1)' : 'none',
          }}
          priority
        />
        
        {/* Animated smile mouth overlay - always visible, animates when speaking */}
        <div
          className="absolute pointer-events-none"
          style={{
            // Position mouth below the eyes on the white face area
            left: '47%',
            top: '44%',
            transform: 'translateX(-50%)',
          }}
        >
          {/* Smile-shaped mouth using border-radius */}
          <div
            style={{
              width: `${mouthWidth}px`,
              height: `${mouthHeight}px`,
              backgroundColor: '#5A3825',
              borderRadius: `0 0 ${mouthWidth / 2}px ${mouthWidth / 2}px`,
              boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.4)',
              transition: state === 'speaking' ? 'none' : 'all 0.15s ease-out',
            }}
          />
        </div>

        {/* Happy sparkles */}
        {happyLevel > 0.3 && (
          <>
            <div 
              className="absolute w-4 h-4 bg-yellow-300 rounded-full animate-ping"
              style={{ top: '8%', left: '12%', animationDuration: '1s' }}
            />
            <div 
              className="absolute w-4 h-4 bg-yellow-300 rounded-full animate-ping"
              style={{ top: '12%', right: '15%', animationDuration: '1.2s', animationDelay: '0.3s' }}
            />
          </>
        )}

        {/* Listening indicator - subtle glow */}
        {state === 'listening' && (
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
            }}
          />
        )}
      </div>
    </div>
  );
}
