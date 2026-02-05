"use client";

import { ScrollArea } from "@/components/ocean-duet/ui/scroll-area";
import { Card } from "@/components/ocean-duet/ui/card";
import { Badge } from "@/components/ocean-duet/ui/badge";
import { ArrowRight, AlertCircle } from "lucide-react";
import { useConversation } from "@/context/ConversationContext";
import { OCEAN_LABELS } from "@/lib/ocean/constants";

export function AdaptiveCuePanel() {
  const { state } = useConversation();
  const { selectedTurn } = state.ui;
  const { turns, adaptiveSettings, participantA, participantB } = state.conversation;

  if (!adaptiveSettings.enabled) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Adaptive Listening is disabled
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Enable it in the setup panel to see listener cues
        </p>
      </div>
    );
  }

  // Find turns with adaptive cues
  const turnsWithCues = turns.filter((t) => t.adaptation);

  // Find the selected turn or use the latest with a cue
  const turn = selectedTurn
    ? turns.find((t) => t.id === selectedTurn.turnId)
    : turnsWithCues[turnsWithCues.length - 1];

  if (!turn?.adaptation) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          No adaptive cues generated yet
        </p>
      </div>
    );
  }

  const { adaptation } = turn;
  const speaker = turn.speaker === "A" ? participantA : participantB;
  const listener = turn.speaker === "A" ? participantB : participantA;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Turn {turn.turnNumber}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {speaker.name}
          </span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm font-medium">{listener.name}</span>
        </div>
        <Badge
          variant="secondary"
          className="text-[10px]"
        >
          {(adaptation.confidence * 100).toFixed(0)}% confidence
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {/* Trigger */}
          {adaptation.trigger && (
            <Card className="p-3">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                Detected Signal
              </h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {OCEAN_LABELS[adaptation.trigger.detectedTrait]}
                </Badge>
                <span className="text-sm">
                  {adaptation.trigger.delta > 0 ? "↑" : "↓"}{" "}
                  {Math.abs(adaptation.trigger.delta).toFixed(1)} over{" "}
                  {adaptation.trigger.windowTurns} turns
                </span>
              </div>
            </Card>
          )}

          {/* Stance Adjustments */}
          <Card className="p-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              Stance Adjustments
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(adaptation.stanceAdjustments).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="capitalize">{key}</span>
                    <span
                      className={`font-medium ${
                        value > 0
                          ? "text-green-600"
                          : value < 0
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {value > 0 ? "+" : ""}
                      {value}
                    </span>
                  </div>
                )
              )}
            </div>
          </Card>

          {/* Instructions */}
          {adaptation.instructions.length > 0 && (
            <Card className="p-3">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                Instructions
              </h4>
              <ul className="space-y-1">
                {adaptation.instructions.map((instruction, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    {instruction}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Do Not Do */}
          {adaptation.doNotDo.length > 0 && (
            <Card className="p-3">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                Avoid
              </h4>
              <ul className="space-y-1">
                {adaptation.doNotDo.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-red-600">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Rationale */}
          <Card className="p-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              Rationale
            </h4>
            <p className="text-sm">{adaptation.rationale}</p>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
