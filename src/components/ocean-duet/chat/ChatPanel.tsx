"use client";

import { useEffect, useRef } from "react";
import { Switch } from "@/components/ocean-duet/ui/switch";
import { Label } from "@/components/ocean-duet/ui/label";
import { MessageSquare } from "lucide-react";
import { useConversation } from "@/context/ConversationContext";
import { ChatMessage } from "./ChatMessage";

export function ChatPanel() {
  const { state, toggleTraitOverlay } = useConversation();
  const { turns, participantA, participantB } = state.conversation;
  const { showTraitOverlay } = state.ui;
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new turns are added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [turns.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b shrink-0 flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Conversation
        </h2>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="trait-overlay"
            className="text-xs text-muted-foreground cursor-pointer"
          >
            Trait overlay
          </Label>
          <Switch
            id="trait-overlay"
            checked={showTraitOverlay}
            onCheckedChange={toggleTraitOverlay}
          />
        </div>
      </div>

      {/* Messages - proper scrollable container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto min-h-0 px-4"
      >
        {turns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No conversation yet</h3>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Configure the participants and scenario, then click Start to begin
              the simulation.
            </p>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {turns.map((turn) => (
              <ChatMessage
                key={turn.id}
                turn={turn}
                participant={
                  turn.speaker === "A" ? participantA : participantB
                }
                showTraitOverlay={showTraitOverlay}
              />
            ))}
            <div ref={scrollRef} />
          </div>
        )}
      </div>
    </div>
  );
}
