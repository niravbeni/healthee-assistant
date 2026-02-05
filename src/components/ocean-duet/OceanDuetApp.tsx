"use client";

import { useEffect, useRef } from "react";
import { AnalyticsPanel } from "@/components/ocean-duet/analytics/AnalyticsPanel";
import { ExportButton } from "@/components/ocean-duet/setup/ExportButton";
import { ConversationProvider, useConversation } from "@/context/ConversationContext";
import type { AssistantType, ConversationMessage } from "@/types";
import { Switch } from "@/components/ocean-duet/ui/switch";
import { Label } from "@/components/ocean-duet/ui/label";
import { MessageSquare, Activity, Database, Zap } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface OceanDuetAppProps {
  onClose: () => void;
  assistantType: AssistantType;
  onboardingAnswers: string[];
  conversationHistory?: ConversationMessage[];
}

// Screenplay action suggestions that appear randomly
const SCREENPLAY_ACTIONS = [
  "[User pauses, considering response]",
  "[Companion adjusts tone based on sentiment]",
  "[Emotional resonance detected: +0.3]",
  "[Trust score updated: 72 → 75]",
  "[Retrieval: health_preferences.json]",
  "[Adaptive cue: Show empathy]",
  "[Context window: 4 turns]",
  "[Personality match: 84%]",
  "[User engagement: High]",
  "[Response latency: 1.2s]",
  "[Sentiment shift: neutral → positive]",
  "[Memory consolidation triggered]",
];

function getRandomAction(): string {
  return SCREENPLAY_ACTIONS[Math.floor(Math.random() * SCREENPLAY_ACTIONS.length)];
}

// Inner component that uses the conversation context
function ConversationTracker({ 
  conversationHistory, 
  assistantType 
}: { 
  conversationHistory?: ConversationMessage[];
  assistantType: AssistantType;
}) {
  const { state, toggleTraitOverlay, addTurn, updateTrajectory, startConversation } = useConversation();
  const { showTraitOverlay } = state.ui;
  const { participantA, participantB } = state.conversation;
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Convert pet conversation history to OCEAN Duet turns on mount
  useEffect(() => {
    if (hasInitialized.current || !conversationHistory || conversationHistory.length === 0) return;
    hasInitialized.current = true;

    // Start the conversation
    startConversation();

    // Add each message from history as a turn
    conversationHistory.forEach((msg, index) => {
      const speaker = msg.role === "assistant" ? "A" : "B";
      const participant = speaker === "A" ? participantA : participantB;
      
      // Generate random OCEAN values for demonstration
      const randomOcean = {
        openness: Math.round(40 + Math.random() * 40),
        conscientiousness: Math.round(40 + Math.random() * 40),
        extraversion: Math.round(30 + Math.random() * 50),
        agreeableness: Math.round(50 + Math.random() * 40),
        neuroticism: Math.round(20 + Math.random() * 40),
      };

      addTurn({
        id: uuidv4(),
        speaker,
        message: msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
        turnNumber: index + 1,
        ocean: randomOcean,
        adaptiveCues: index % 2 === 0 ? ["empathy", "active_listening"] : ["information", "support"],
        retrievedDocs: index % 3 === 0 ? [{ id: "doc1", title: "User Preferences", relevance: 0.85 }] : [],
      });

      updateTrajectory(speaker, randomOcean);
    });
  }, [conversationHistory, addTurn, updateTrajectory, startConversation, participantA, participantB]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [state.conversation.turns.length]);

  const petName = assistantType === "krea" ? "Krea" : "Bonobo";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b shrink-0 flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Live Conversation Feed
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="trait-overlay"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              OCEAN overlay
            </Label>
            <Switch
              id="trait-overlay"
              checked={showTraitOverlay}
              onCheckedChange={toggleTraitOverlay}
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto min-h-0 px-4"
      >
        {state.conversation.turns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">Waiting for conversation...</h3>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Start chatting with {petName} to see the conversation tracked here in real-time.
            </p>
          </div>
        ) : (
          <div className="py-4 space-y-3">
            {state.conversation.turns.map((turn, index) => {
              const isAssistant = turn.speaker === "A";
              const showAction = index > 0 && Math.random() > 0.5;
              
              return (
                <div key={turn.id}>
                  {/* Random screenplay action */}
                  {showAction && (
                    <div className="text-center my-2">
                      <span className="text-xs text-muted-foreground italic font-mono bg-muted/50 px-2 py-1 rounded">
                        {getRandomAction()}
                      </span>
                    </div>
                  )}
                  
                  {/* Message */}
                  <div className={`flex gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                      isAssistant 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary text-secondary-foreground"
                    }`}>
                      {isAssistant ? petName[0] : "U"}
                    </div>
                    
                    <div className={`flex-1 max-w-[80%] ${isAssistant ? "" : "text-right"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {isAssistant ? petName : "User"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Turn {turn.turnNumber}
                        </span>
                      </div>
                      
                      <div className={`inline-block rounded-lg px-3 py-2 text-sm ${
                        isAssistant 
                          ? "bg-primary/10 text-foreground" 
                          : "bg-secondary text-secondary-foreground"
                      }`}>
                        {turn.message}
                      </div>
                      
                      {/* OCEAN overlay */}
                      {showTraitOverlay && turn.ocean && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                            O:{turn.ocean.openness}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                            C:{turn.ocean.conscientiousness}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">
                            E:{turn.ocean.extraversion}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-100 text-pink-700">
                            A:{turn.ocean.agreeableness}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                            N:{turn.ocean.neuroticism}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Tracking info panel (replaces SetupPanel)
function TrackingInfoPanel({ assistantType }: { assistantType: AssistantType }) {
  const petName = assistantType === "krea" ? "Krea" : "Bonobo";
  
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-3 border-b">
        <h2 className="font-semibold flex items-center gap-2">
          <Database className="h-4 w-4" />
          Session Tracking
        </h2>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Active Session */}
        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active Session</span>
            <span className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Live
            </span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Companion: {petName}</p>
            <p>Mode: Voice-first</p>
            <p>Started: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="rounded-lg border p-3 space-y-3">
          <span className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time Metrics
          </span>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted/50 rounded p-2">
              <p className="text-muted-foreground">Engagement</p>
              <p className="font-mono font-semibold">87%</p>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <p className="text-muted-foreground">Sentiment</p>
              <p className="font-mono font-semibold text-green-600">+0.4</p>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <p className="text-muted-foreground">Trust Score</p>
              <p className="font-mono font-semibold">72</p>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <p className="text-muted-foreground">Turns</p>
              <p className="font-mono font-semibold">—</p>
            </div>
          </div>
        </div>

        {/* Adaptive System */}
        <div className="rounded-lg border p-3 space-y-2">
          <span className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Adaptive System
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Personality matching</span>
              <span className="text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tone adaptation</span>
              <span className="text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Context retrieval</span>
              <span className="text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Memory system</span>
              <span className="text-yellow-600">Standby</span>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="rounded-lg border p-3 space-y-2">
          <span className="text-sm font-medium">Event Log</span>
          <div className="space-y-1 text-xs font-mono text-muted-foreground max-h-32 overflow-y-auto">
            <p>[{new Date().toLocaleTimeString()}] Session started</p>
            <p>[{new Date().toLocaleTimeString()}] Voice input initialized</p>
            <p>[{new Date().toLocaleTimeString()}] TTS connected</p>
            <p>[{new Date().toLocaleTimeString()}] OCEAN profiler ready</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OceanDuetApp({ onClose, assistantType, onboardingAnswers, conversationHistory }: OceanDuetAppProps) {
  return (
    <ConversationProvider assistantType={assistantType} onboardingAnswers={onboardingAnswers}>
      <main className="h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="border-b px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-secondary transition-colors cursor-pointer"
              aria-label="Back to pet"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">OCEAN Duet</h1>
            <span className="text-sm text-muted-foreground">
              Conversation Tracker & Analytics
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton />
            <span className="text-sm text-muted-foreground">v1.0</span>
          </div>
        </header>

        {/* Three-panel layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Tracking Info */}
          <aside className="w-72 border-r flex flex-col overflow-hidden shrink-0">
            <TrackingInfoPanel assistantType={assistantType} />
          </aside>

          {/* Center Panel - Conversation Feed */}
          <section className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <ConversationTracker 
              conversationHistory={conversationHistory} 
              assistantType={assistantType}
            />
          </section>

          {/* Right Panel - Analytics */}
          <aside className="w-96 border-l flex flex-col overflow-hidden shrink-0">
            <AnalyticsPanel />
          </aside>
        </div>
      </main>
    </ConversationProvider>
  );
}
