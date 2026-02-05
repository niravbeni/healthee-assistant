"use client";

import { SetupPanel } from "@/components/ocean-duet/setup/SetupPanel";
import { ChatPanel } from "@/components/ocean-duet/chat/ChatPanel";
import { AnalyticsPanel } from "@/components/ocean-duet/analytics/AnalyticsPanel";
import { ExportButton } from "@/components/ocean-duet/setup/ExportButton";
import { ConversationProvider } from "@/context/ConversationContext";
import type { AssistantType } from "@/types";

interface OceanDuetAppProps {
  onClose: () => void;
  assistantType: AssistantType;
  onboardingAnswers: string[];
}

export default function OceanDuetApp({ onClose, assistantType, onboardingAnswers }: OceanDuetAppProps) {
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
              Adaptive Conversation Simulator
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton />
            <span className="text-sm text-muted-foreground">v1.0</span>
          </div>
        </header>

        {/* Three-panel layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Setup */}
          <aside className="w-80 border-r flex flex-col overflow-hidden shrink-0">
            <SetupPanel />
          </aside>

          {/* Center Panel - Chat */}
          <section className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <ChatPanel />
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
