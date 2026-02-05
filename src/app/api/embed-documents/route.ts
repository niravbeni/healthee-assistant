import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createEmbedding } from "@/lib/ocean/openai";
import { addChunks, chunkText } from "@/lib/ocean/vector-store";
import type { EmbedDocumentRequest, DocumentChunk } from "@/lib/ocean/types";

export async function POST(request: NextRequest) {
  try {
    const body: EmbedDocumentRequest = await request.json();
    const { participantId, name, content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Document content is empty" },
        { status: 400 }
      );
    }

    const documentId = uuidv4();

    // Chunk the document
    const textChunks = chunkText(content, 500, 50);

    // Generate embeddings for each chunk
    const chunks: DocumentChunk[] = await Promise.all(
      textChunks.map(async (chunk, index) => {
        const embedding = await createEmbedding(chunk.content);
        return {
          id: `${documentId}-${index}`,
          documentId,
          content: chunk.content,
          embedding,
          startIndex: chunk.startIndex,
          endIndex: chunk.endIndex,
        };
      })
    );

    // Store chunks in vector store
    addChunks(participantId, chunks);

    return NextResponse.json({
      documentId,
      name,
      participantId,
      chunkCount: chunks.length,
    });
  } catch (error) {
    console.error("Error embedding document:", error);
    return NextResponse.json(
      { error: "Failed to embed document" },
      { status: 500 }
    );
  }
}
