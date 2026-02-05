'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AssistantType } from '@/types';
import { TTS_VOICES } from '@/lib/voices';

interface UseAudioPlaybackOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onAudioLevel?: (level: number) => void;
}

interface UseAudioPlaybackReturn {
  isPlaying: boolean;
  speak: (text: string, assistantType: AssistantType) => Promise<void>;
  stop: () => void;
  audioLevel: number;
}

export function useAudioPlayback(options: UseAudioPlaybackOptions = {}): UseAudioPlaybackReturn {
  const { onStart, onEnd, onAudioLevel } = options;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current || !isPlaying) {
      setAudioLevel(0);
      onAudioLevel?.(0);
      return;
    }
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume level
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const normalized = Math.min(1, average / 100);
    
    setAudioLevel(normalized);
    onAudioLevel?.(normalized);
    
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, [isPlaying, onAudioLevel]);

  const speak = useCallback(async (text: string, assistantType: AssistantType) => {
    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const voice = TTS_VOICES[assistantType];
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) {
        throw new Error('TTS request failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up audio analysis for animation sync
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      // Resume audio context if suspended (browser autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Only create source node once per audio element
      if (!sourceRef.current || sourceRef.current.mediaElement !== audio) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        
        sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }

      // Set up event handlers
      audio.onplay = () => {
        setIsPlaying(true);
        onStart?.();
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setAudioLevel(0);
        onAudioLevel?.(0);
        onEnd?.();
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        // Cleanup URL
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setAudioLevel(0);
        onEnd?.();
        URL.revokeObjectURL(audioUrl);
      };

      // Play the audio - catch AbortError when playback is interrupted
      try {
        await audio.play();
      } catch (playError) {
        // Ignore AbortError - this happens when audio is paused before it starts
        if (playError instanceof Error && playError.name === 'AbortError') {
          // Silently ignore - this is expected when user interrupts playback
          return;
        }
        throw playError;
      }

    } catch (error) {
      // Ignore AbortError at top level too
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Audio playback error:', error);
      setIsPlaying(false);
      setAudioLevel(0);
      onEnd?.();
      
      // Fallback to browser speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = assistantType === 'krea' ? 1.1 : 1.0;
        
        utterance.onstart = () => {
          setIsPlaying(true);
          onStart?.();
        };
        
        utterance.onend = () => {
          setIsPlaying(false);
          onEnd?.();
        };
        
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [onStart, onEnd, onAudioLevel, updateAudioLevel]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    setIsPlaying(false);
    setAudioLevel(0);
    onAudioLevel?.(0);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [onAudioLevel]);

  return {
    isPlaying,
    speak,
    stop,
    audioLevel,
  };
}
