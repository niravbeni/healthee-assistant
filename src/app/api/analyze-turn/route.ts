import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/ocean/openai";
import { buildAnalysisPrompt } from "@/lib/ocean/prompts/analysis";
import type { AnalyzeTurnRequest, AnalyzeTurnResponse, TraitSignal, OceanProfile } from "@/lib/ocean/types";
import { ANALYSIS_MODEL } from "@/lib/ocean/constants";

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeTurnRequest = await request.json();
    const { dialogue, actions, participant, conversationContext, previousTrajectory } = body;

    // Build the analysis prompt
    const prompt = buildAnalysisPrompt({
      dialogue,
      actions,
      participant,
      conversationContext,
      previousTrajectory,
    });

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: ANALYSIS_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a personality analysis system that identifies OCEAN trait signals in dialogue. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in response");
    }

    // Parse the response
    const parsed = JSON.parse(content);

    // Validate and sanitize trait signals
    const traitSignals: TraitSignal[] = (parsed.traitSignals || []).map(
      (signal: TraitSignal) => ({
        trait: signal.trait,
        startIndex: Math.max(0, signal.startIndex),
        endIndex: Math.min(dialogue.length, signal.endIndex),
        value: Math.max(-1, Math.min(1, signal.value)),
        confidence: Math.max(0, Math.min(1, signal.confidence)),
        rationale: signal.rationale || "",
      })
    );

    // Validate cumulative trajectory
    const trajectory = parsed.cumulativeTrajectory || previousTrajectory;
    const cumulativeTrajectory: OceanProfile = {
      openness: clamp(trajectory.openness, 0, 100),
      conscientiousness: clamp(trajectory.conscientiousness, 0, 100),
      extraversion: clamp(trajectory.extraversion, 0, 100),
      agreeableness: clamp(trajectory.agreeableness, 0, 100),
      neuroticism: clamp(trajectory.neuroticism, 0, 100),
    };

    const response: AnalyzeTurnResponse = {
      traitSignals,
      sentiment: parsed.sentiment || "neutral",
      cumulativeTrajectory,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error analyzing turn:", error);
    return NextResponse.json(
      { error: "Failed to analyze turn" },
      { status: 500 }
    );
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
