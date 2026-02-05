"use client";

import { Separator } from "@/components/ocean-duet/ui/separator";
import { ParticipantConfig } from "./ParticipantConfig";
import { ScenarioConfig } from "./ScenarioConfig";
import { AdaptiveControls } from "./AdaptiveControls";
import { RunControls } from "./RunControls";
import { useConversation } from "@/context/ConversationContext";

export function SetupPanel() {
  const { state, setParticipantA, setParticipantB } = useConversation();
  const { participantA, participantB, status } = state.conversation;
  
  const isDisabled = status === "running";

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b shrink-0">
        <h2 className="font-semibold">Setup</h2>
      </div>
      
      {/* Scrollable content area with proper overflow */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 space-y-6">
          {/* Participant A */}
          <ParticipantConfig
            participant={participantA}
            onChange={setParticipantA}
            disabled={isDisabled}
          />
          
          <Separator />
          
          {/* Participant B */}
          <ParticipantConfig
            participant={participantB}
            onChange={setParticipantB}
            disabled={isDisabled}
          />
          
          <Separator />
          
          {/* Scenario */}
          <ScenarioConfig disabled={isDisabled} />
          
          <Separator />
          
          {/* Adaptive Listening (V2-ready) */}
          <AdaptiveControls disabled={isDisabled} />
        </div>
      </div>
      
      {/* Run Controls - Fixed at bottom */}
      <div className="border-t p-4 shrink-0 bg-background">
        <RunControls />
      </div>
    </div>
  );
}
