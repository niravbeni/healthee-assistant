// OCEAN Duet - In-Memory Vector Store

import type { DocumentChunk, RetrievalResult } from "./types";
import { cosineSimilarity } from "./openai";

// In-memory storage for document chunks with embeddings
// Keyed by participant ID ("A" or "B")
const vectorStore: Map<string, DocumentChunk[]> = new Map();

export function addChunks(participantId: "A" | "B", chunks: DocumentChunk[]): void {
  const existing = vectorStore.get(participantId) || [];
  vectorStore.set(participantId, [...existing, ...chunks]);
}

export function getChunks(participantId: "A" | "B"): DocumentChunk[] {
  return vectorStore.get(participantId) || [];
}

export function clearChunks(participantId: "A" | "B"): void {
  vectorStore.set(participantId, []);
}

export function clearAllChunks(): void {
  vectorStore.clear();
}

export function searchSimilar(
  participantId: "A" | "B",
  queryEmbedding: number[],
  topK: number = 3
): RetrievalResult[] {
  const chunks = vectorStore.get(participantId) || [];
  
  if (chunks.length === 0) {
    return [];
  }
  
  // Calculate similarity scores for all chunks
  const scored = chunks
    .filter((chunk) => chunk.embedding && chunk.embedding.length > 0)
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding!),
    }));
  
  // Sort by score descending and take top K
  scored.sort((a, b) => b.score - a.score);
  const topChunks = scored.slice(0, topK);
  
  // Convert to RetrievalResult format
  return topChunks.map(({ chunk, score }) => ({
    documentId: chunk.documentId,
    documentName: chunk.documentId, // Will be populated properly when we have document metadata
    chunkId: chunk.id,
    content: chunk.content,
    score,
  }));
}

// Utility function to chunk text
export function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50
): { content: string; startIndex: number; endIndex: number }[] {
  const chunks: { content: string; startIndex: number; endIndex: number }[] = [];
  
  // Simple character-based chunking (in production, use token-based)
  const words = text.split(/\s+/);
  const wordsPerChunk = Math.floor(chunkSize / 5); // Approximate words per chunk
  const overlapWords = Math.floor(overlap / 5);
  
  let startWord = 0;
  let charIndex = 0;
  
  while (startWord < words.length) {
    const endWord = Math.min(startWord + wordsPerChunk, words.length);
    const chunkWords = words.slice(startWord, endWord);
    const content = chunkWords.join(" ");
    
    const startIndex = charIndex;
    const endIndex = startIndex + content.length;
    
    chunks.push({ content, startIndex, endIndex });
    
    // Move start forward, accounting for overlap
    const advance = wordsPerChunk - overlapWords;
    charIndex += words.slice(startWord, startWord + advance).join(" ").length + 1;
    startWord += advance;
    
    if (endWord >= words.length) break;
  }
  
  return chunks;
}
