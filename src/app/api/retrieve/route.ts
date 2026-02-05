import { NextRequest, NextResponse } from "next/server";
import { createEmbedding } from "@/lib/ocean/openai";
import { searchSimilar } from "@/lib/ocean/vector-store";
import type { RetrieveRequest, RetrievalResult } from "@/lib/ocean/types";
import { TOP_K_RETRIEVAL } from "@/lib/ocean/constants";

export async function POST(request: NextRequest) {
  try {
    const body: RetrieveRequest = await request.json();
    const { participantId, query, topK = TOP_K_RETRIEVAL } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Create embedding for the query
    const queryEmbedding = await createEmbedding(query);

    // Search for similar chunks
    const results: RetrievalResult[] = searchSimilar(participantId, queryEmbedding, topK);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error retrieving documents:", error);
    return NextResponse.json(
      { error: "Failed to retrieve documents" },
      { status: 500 }
    );
  }
}
