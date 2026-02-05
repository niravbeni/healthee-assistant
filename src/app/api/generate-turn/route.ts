import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/ocean/openai";
import { buildGenerationPrompt } from "@/lib/ocean/prompts/generation";
import type { GenerateTurnRequest, GenerateTurnResponse } from "@/lib/ocean/types";
import { GENERATION_MODEL } from "@/lib/ocean/constants";

export async function POST(request: NextRequest) {
  try {
    const body: GenerateTurnRequest = await request.json();
    const {
      participantA,
      participantB,
      scenario,
      turns,
      currentSpeaker,
      adaptiveSettings,
      previousCue,
    } = body;

    const speaker = currentSpeaker === "A" ? participantA : participantB;
    const otherParticipant = currentSpeaker === "A" ? participantB : participantA;

    // Build the generation prompt
    const prompt = buildGenerationPrompt({
      speaker,
      otherParticipant,
      scenario,
      turns,
      adaptiveCue: adaptiveSettings.enabled ? previousCue : undefined,
      // retrievedDocs would be passed here if RAG is implemented
    });

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: GENERATION_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a conversation simulator that generates realistic dialogue. Always respond with valid JSON only, no additional text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in response");
    }

    // Parse the response
    const parsed = JSON.parse(content);
    const response: GenerateTurnResponse = {
      dialogue: parsed.dialogue || "",
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error generating turn:", error);
    return NextResponse.json(
      { error: "Failed to generate turn" },
      { status: 500 }
    );
  }
}
