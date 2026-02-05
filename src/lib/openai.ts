import OpenAI from 'openai';

// Server-side OpenAI client - lazily initialized
// Only use this in API routes, never on the client
let _openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

// For backward compatibility
export const openai = {
  get chat() {
    return getOpenAIClient().chat;
  },
  get audio() {
    return getOpenAIClient().audio;
  },
};

// Model configurations
export const MODELS = {
  chat: 'gpt-5-mini',
  transcription: 'whisper-1',
  tts: 'tts-1',
} as const;
