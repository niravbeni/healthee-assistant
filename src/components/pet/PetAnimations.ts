import { PetState } from '@/types';

/**
 * Easing functions for smooth animations
 */
export const easing = {
  easeInOut: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOut: (t: number): number => 1 - Math.pow(1 - t, 3),
  elastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

/**
 * Animation timing configurations per state
 */
export const animationConfig = {
  idle: {
    duration: 3000,
    intensity: 0.15,
  },
  listening: {
    duration: 1500,
    intensity: 0.25,
  },
  thinking: {
    duration: 2000,
    intensity: 0.1,
  },
  speaking: {
    duration: 500,
    intensity: 0.3,
  },
} as const;

/**
 * Get animation phase (0-1) based on time and state
 */
export function getAnimationPhase(time: number, state: PetState): number {
  const config = animationConfig[state];
  const phase = (time % config.duration) / config.duration;
  return easing.easeInOut(phase);
}

/**
 * Calculate pulse scale for orb animations
 */
export function calculatePulseScale(
  time: number,
  state: PetState,
  audioLevel: number = 0
): number {
  const config = animationConfig[state];
  const basePhase = Math.sin((time / config.duration) * Math.PI * 2);
  
  if (state === 'speaking') {
    // Sync with audio level when speaking
    return 1 + (basePhase * 0.1) + (audioLevel * config.intensity);
  }
  
  return 1 + (basePhase * config.intensity);
}

/**
 * Calculate glow intensity
 */
export function calculateGlowIntensity(
  time: number,
  state: PetState,
  audioLevel: number = 0
): number {
  const baseIntensity = state === 'listening' ? 0.8 : state === 'speaking' ? 0.7 : 0.5;
  const pulse = Math.sin((time / 2000) * Math.PI * 2) * 0.2;
  
  if (state === 'speaking') {
    return Math.min(1, baseIntensity + pulse + (audioLevel * 0.3));
  }
  
  return baseIntensity + pulse;
}

/**
 * Interpolate between colors
 */
export function lerpColor(
  color1: [number, number, number],
  color2: [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(color1[0] + (color2[0] - color1[0]) * t),
    Math.round(color1[1] + (color2[1] - color1[1]) * t),
    Math.round(color1[2] + (color2[2] - color1[2]) * t),
  ];
}

/**
 * Convert RGB to CSS color string
 */
export function rgbToString(rgb: [number, number, number], alpha: number = 1): string {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/**
 * Parse hex color to RGB
 */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

/**
 * Calculate bounce animation for Bonobo
 */
export function calculateBounce(
  time: number,
  state: PetState,
  bondLevel: number = 50
): number {
  const bounceIntensity = Math.min(1, bondLevel / 100 + 0.3);
  
  if (state === 'idle') {
    return Math.sin((time / 1500) * Math.PI * 2) * 8 * bounceIntensity;
  }
  
  if (state === 'listening') {
    return Math.sin((time / 800) * Math.PI * 2) * 4;
  }
  
  return 0;
}

/**
 * Calculate eye blink timing
 */
export function shouldBlink(time: number): boolean {
  // Blink every 3-5 seconds with some randomness
  const blinkCycle = 4000;
  const blinkPhase = (time % blinkCycle) / blinkCycle;
  return blinkPhase > 0.95 || blinkPhase < 0.02;
}

/**
 * Calculate mouth open amount for speaking
 */
export function calculateMouthOpen(
  time: number,
  state: PetState,
  audioLevel: number = 0
): number {
  if (state !== 'speaking') {
    return 0;
  }
  
  const baseMouth = Math.sin((time / 150) * Math.PI * 2) * 0.3 + 0.5;
  return Math.min(1, baseMouth + (audioLevel * 0.5));
}
