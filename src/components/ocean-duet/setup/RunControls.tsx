"use client";

import { Button } from "@/components/ocean-duet/ui/button";
import { Play, Pause, RotateCcw, StepForward, Loader2 } from "lucide-react";
import { useConversation } from "@/context/ConversationContext";
import { useConversationRunner } from "@/hooks/ocean/useConversationRunner";

export function RunControls() {
  const { state, resetConversation, pauseConversation, resumeConversation } =
    useConversation();
  const { status, turns } = state.conversation;
  const { isGenerating } = state.ui;
  const { generateNextTurn, runConversation } = useConversationRunner();

  const isIdle = status === "idle";
  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isCompleted = status === "completed";

  const handleStart = () => {
    runConversation();
  };

  const handleStep = () => {
    generateNextTurn();
  };

  const handlePauseResume = () => {
    if (isRunning) {
      pauseConversation();
    } else if (isPaused) {
      resumeConversation();
      runConversation();
    }
  };

  const handleReset = () => {
    resetConversation();
  };

  return (
    <div className="space-y-3">
      {/* Status */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Turn {turns.length} / {state.conversation.scenario.maxTurns}
        </span>
        <StatusBadge status={status} />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        {isIdle && (
          <>
            <Button
              onClick={handleStart}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Start
            </Button>
            <Button
              variant="outline"
              onClick={handleStep}
              disabled={isGenerating}
            >
              <StepForward className="h-4 w-4" />
            </Button>
          </>
        )}

        {(isRunning || isPaused) && (
          <>
            <Button
              variant={isRunning ? "secondary" : "default"}
              onClick={handlePauseResume}
              disabled={isGenerating && isRunning}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Pause className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating ? "Generating..." : "Pause"}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleStep}
              disabled={isGenerating}
            >
              <StepForward className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </>
        )}

        {isCompleted && (
          <>
            <Button onClick={handleReset} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    idle: { label: "Ready", className: "text-muted-foreground" },
    running: { label: "Running", className: "text-green-600" },
    paused: { label: "Paused", className: "text-yellow-600" },
    completed: { label: "Completed", className: "text-blue-600" },
  }[status] || { label: status, className: "text-muted-foreground" };

  return (
    <span className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
