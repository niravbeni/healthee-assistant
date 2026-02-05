// TTS voice mapping for each assistant
// Separated from openai.ts to avoid importing OpenAI client on the client side
export const TTS_VOICES = {
  krea: 'shimmer' as const,   // Soft, calming
  bonobo: 'nova' as const,    // Warm, friendly
};
