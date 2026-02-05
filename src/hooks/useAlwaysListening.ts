'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseAlwaysListeningOptions {
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  // VAD settings
  silenceThreshold?: number;      // Audio level below this = silence (0-1)
  speechThreshold?: number;       // Audio level above this = speech (0-1)
  silenceDuration?: number;       // ms of silence before ending recording
  minSpeechDuration?: number;     // Minimum ms of speech to consider valid
  enabled?: boolean;              // Whether to auto-start
}

interface UseAlwaysListeningReturn {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  audioLevel: number;
  hasPermission: boolean | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
}

export function useAlwaysListening(options: UseAlwaysListeningOptions = {}): UseAlwaysListeningReturn {
  const {
    onTranscription,
    onError,
    onSpeechStart,
    onSpeechEnd,
    silenceThreshold = 0.02,
    speechThreshold = 0.05,
    silenceDuration = 1500,
    minSpeechDuration = 500,
    enabled = true,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Store all refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number>(0);
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const silenceStartRef = useRef<number | null>(null);
  const speechStartRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Store callbacks in refs to avoid dependency issues
  const onTranscriptionRef = useRef(onTranscription);
  const onErrorRef = useRef(onError);
  const onSpeechStartRef = useRef(onSpeechStart);
  const onSpeechEndRef = useRef(onSpeechEnd);

  // Update refs when callbacks change
  useEffect(() => {
    onTranscriptionRef.current = onTranscription;
    onErrorRef.current = onError;
    onSpeechStartRef.current = onSpeechStart;
    onSpeechEndRef.current = onSpeechEnd;
  }, [onTranscription, onError, onSpeechStart, onSpeechEnd]);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    if (audioBlob.size === 0 || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      const text = result.text?.trim();

      if (text && text.length > 0) {
        onTranscriptionRef.current?.(text);
      }
    } catch (error) {
      console.error('Transcription error:', error);
      onErrorRef.current?.('Failed to transcribe audio.');
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, []);

  const startNewRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'recording') return;
    
    chunksRef.current = [];
    try {
      mediaRecorderRef.current.start(100);
      speechStartRef.current = Date.now();
      isSpeakingRef.current = true;
      setIsSpeaking(true);
      onSpeechStartRef.current?.();
    } catch (e) {
      console.error('Failed to start recording:', e);
    }
  }, []);

  const stopCurrentRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;

    const speechDuration = speechStartRef.current ? Date.now() - speechStartRef.current : 0;
    
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    onSpeechEndRef.current?.();

    // Only process if speech was long enough
    if (speechDuration < minSpeechDuration) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Failed to stop recording:', e);
      }
      chunksRef.current = [];
      return;
    }

    return new Promise<void>((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve();
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: mediaRecorderRef.current?.mimeType || 'audio/webm'
        });
        chunksRef.current = [];
        
        if (audioBlob.size > 0) {
          await transcribeAudio(audioBlob);
        }
        resolve();
      };

      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Failed to stop recording:', e);
        resolve();
      }
    });
  }, [minSpeechDuration, transcribeAudio]);

  const processAudioLevel = useCallback(() => {
    if (!analyserRef.current || !isListeningRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume level
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const normalized = Math.min(1, average / 128);
    setAudioLevel(normalized);

    const now = Date.now();

    // Voice Activity Detection logic
    if (!isSpeakingRef.current) {
      // Not currently speaking - check if speech started
      if (normalized > speechThreshold && !isProcessingRef.current) {
        silenceStartRef.current = null;
        startNewRecording();
      }
    } else {
      // Currently speaking - check for silence
      if (normalized < silenceThreshold) {
        // Below silence threshold
        if (silenceStartRef.current === null) {
          silenceStartRef.current = now;
        } else if (now - silenceStartRef.current > silenceDuration) {
          // Silence long enough - stop recording
          silenceStartRef.current = null;
          stopCurrentRecording();
        }
      } else {
        // Above silence threshold - reset silence timer
        silenceStartRef.current = null;
      }
    }

    if (isListeningRef.current) {
      animationFrameRef.current = requestAnimationFrame(processAudioLevel);
    }
  }, [speechThreshold, silenceThreshold, silenceDuration, startNewRecording, stopCurrentRecording]);

  const startListening = useCallback(async () => {
    if (isListeningRef.current) return;
    
    try {
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;
      setHasPermission(true);

      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Set up MediaRecorder (but don't start yet)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      isListeningRef.current = true;
      setIsListening(true);

      // Start audio level monitoring with VAD
      animationFrameRef.current = requestAnimationFrame(processAudioLevel);

    } catch (error) {
      console.error('Failed to start listening:', error);
      setHasPermission(false);
      onErrorRef.current?.('Could not access microphone. Please check permissions.');
    }
  }, [processAudioLevel]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setIsSpeaking(false);
    setAudioLevel(0);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Error stopping recorder:', e);
      }
    }
    mediaRecorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    isSpeakingRef.current = false;
    silenceStartRef.current = null;
    speechStartRef.current = null;
  }, []);

  // Auto-start listening when component mounts (only once)
  useEffect(() => {
    if (!enabled || isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Start listening after a short delay
    const timer = setTimeout(() => {
      startListening();
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [enabled, startListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    isSpeaking,
    isProcessing,
    audioLevel,
    hasPermission,
    startListening,
    stopListening,
  };
}
