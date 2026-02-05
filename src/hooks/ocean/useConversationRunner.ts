"use client";

import { useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useConversation } from "@/context/ConversationContext";
import type {
  ConversationTurn,
  GenerateTurnRequest,
  GenerateTurnResponse,
  AnalyzeTurnRequest,
  AnalyzeTurnResponse,
  Participant,
  Scenario,
  AdaptiveSettings,
} from "@/lib/ocean/types";

export function useConversationRunner() {
  const {
    state,
    addTurn,
    startConversation,
    completeConversation,
    pauseConversation,
    setGenerating,
    updateTrajectory,
  } = useConversation();

  const abortRef = useRef<AbortController | null>(null);
  const shouldStopRef = useRef(false);
  const isRunningRef = useRef(false);
  
  // Use refs to always access the latest state
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Generate a single turn - returns true if successful
  const generateNextTurn = useCallback(async (): Promise<boolean> => {
    // Get current state from ref
    const currentState = stateRef.current.conversation;
    const { participantA, participantB, scenario, turns, adaptiveSettings, currentSpeaker } = currentState;
    
    if (turns.length >= scenario.maxTurns) {
      completeConversation();
      return false;
    }

    setGenerating(true);

    try {
      abortRef.current = new AbortController();
      const speaker = currentSpeaker;
      const participant = speaker === "A" ? participantA : participantB;

      // Get previous adaptive cue if applicable
      const previousCue =
        turns.length > 0 ? turns[turns.length - 1].adaptation : undefined;

      // Step 1: Generate dialogue
      const generateRequest: GenerateTurnRequest = {
        participantA,
        participantB,
        scenario,
        turns,
        currentSpeaker: speaker,
        adaptiveSettings,
        previousCue,
      };

      const generateResponse = await fetch("/api/generate-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generateRequest),
        signal: abortRef.current.signal,
      });

      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        console.error("Generate API error:", errorText);
        throw new Error(`Failed to generate turn: ${generateResponse.status}`);
      }

      const generatedData: GenerateTurnResponse = await generateResponse.json();
      
      // Validate generated data
      if (!generatedData.dialogue || generatedData.dialogue.trim() === "") {
        console.error("Empty dialogue generated");
        throw new Error("Empty dialogue generated");
      }

      // Get previous trajectory or use participant's baseline
      const previousTurns = turns.filter((t) => t.speaker === speaker);
      const previousTrajectory =
        previousTurns.length > 0
          ? previousTurns[previousTurns.length - 1].cumulativeTrajectory
          : participant.ocean;

      // Build conversation context for analysis
      const conversationContext = turns
        .slice(-6)
        .map((t) => {
          const p = t.speaker === "A" ? participantA : participantB;
          return `${p.name}: ${t.dialogue}`;
        })
        .join("\n");

      // Step 2: Analyze the turn
      const analyzeRequest: AnalyzeTurnRequest = {
        dialogue: generatedData.dialogue,
        actions: generatedData.actions || [],
        speaker,
        participant,
        conversationContext,
        previousTrajectory,
      };

      const analyzeResponse = await fetch("/api/analyze-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analyzeRequest),
        signal: abortRef.current.signal,
      });

      if (!analyzeResponse.ok) {
        const errorText = await analyzeResponse.text();
        console.error("Analyze API error:", errorText);
        throw new Error(`Failed to analyze turn: ${analyzeResponse.status}`);
      }

      const analysisData: AnalyzeTurnResponse = await analyzeResponse.json();

      // Create the complete turn
      const turn: ConversationTurn = {
        id: uuidv4(),
        turnNumber: turns.length + 1,
        speaker,
        dialogue: generatedData.dialogue,
        actions: generatedData.actions || [],
        traitSignals: analysisData.traitSignals || [],
        sentiment: analysisData.sentiment || "neutral",
        cumulativeTrajectory: analysisData.cumulativeTrajectory || previousTrajectory,
        timestamp: Date.now(),
      };

      // Add the turn
      addTurn(turn);
      updateTrajectory(speaker, turn.cumulativeTrajectory);
      
      return true;
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log("Generation aborted");
      } else {
        console.error("Error generating turn:", error);
      }
      return false;
    } finally {
      setGenerating(false);
    }
  }, [addTurn, updateTrajectory, completeConversation, setGenerating]);

  // Run the full conversation
  const runConversation = useCallback(async () => {
    // Prevent multiple simultaneous runs
    if (isRunningRef.current) {
      console.log("Conversation already running");
      return;
    }
    
    isRunningRef.current = true;
    shouldStopRef.current = false;
    
    const currentStatus = stateRef.current.conversation.status;
    const maxTurns = stateRef.current.conversation.scenario.maxTurns;
    const startingTurns = stateRef.current.conversation.turns.length;
    
    if (currentStatus === "idle") {
      startConversation();
    }

    let generatedCount = 0;
    let consecutiveErrors = 0;

    // Continue generating turns until we've generated maxTurns total
    while (!shouldStopRef.current && (startingTurns + generatedCount) < maxTurns) {
      const success = await generateNextTurn();
      
      if (success) {
        generatedCount++;
        consecutiveErrors = 0;
      } else {
        consecutiveErrors++;
        // Stop if we have 3 consecutive errors
        if (consecutiveErrors >= 3) {
          console.error("Too many consecutive errors, stopping conversation");
          break;
        }
      }

      // Delay between turns
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    
    if (!shouldStopRef.current && (startingTurns + generatedCount) >= maxTurns) {
      completeConversation();
    }
    
    isRunningRef.current = false;
  }, [startConversation, generateNextTurn, completeConversation]);

  // Stop generation
  const stopGeneration = useCallback(() => {
    shouldStopRef.current = true;
    isRunningRef.current = false;
    if (abortRef.current) {
      abortRef.current.abort();
    }
    pauseConversation();
  }, [pauseConversation]);

  return {
    generateNextTurn,
    runConversation,
    stopGeneration,
  };
}
