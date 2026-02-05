"use client";

import { Card } from "@/components/ocean-duet/ui/card";
import { Badge } from "@/components/ocean-duet/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ocean-duet/ui/tooltip";
import type { ConversationTurn, Participant, TraitSignal } from "@/lib/ocean/types";
import { useConversation } from "@/context/ConversationContext";
import { OCEAN_COLORS, OCEAN_LABELS, SENTIMENT_COLORS } from "@/lib/ocean/constants";
import { cn } from "@/lib/ocean/utils";

interface ChatMessageProps {
  turn: ConversationTurn;
  participant: Participant;
  showTraitOverlay: boolean;
}

export function ChatMessage({
  turn,
  participant,
  showTraitOverlay,
}: ChatMessageProps) {
  const { state, setSelectedTurn, setAnalyticsTab } = useConversation();
  const isSelected = state.ui.selectedTurn?.turnId === turn.id;
  const isA = turn.speaker === "A";

  const handleClick = () => {
    setSelectedTurn(turn.id, turn.turnNumber);
    setAnalyticsTab("radar");
  };

  return (
    <div
      className={cn(
        "flex gap-3",
        isA ? "flex-row" : "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
          isA
            ? "bg-blue-100 text-blue-700"
            : "bg-emerald-100 text-emerald-700"
        )}
      >
        {participant.name.charAt(0)}
      </div>

      {/* Message Content */}
      <Card
        className={cn(
          "max-w-[75%] p-3 cursor-pointer transition-all",
          isA ? "bg-blue-50/50" : "bg-emerald-50/50",
          isSelected && "ring-2 ring-primary"
        )}
        onClick={handleClick}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-medium">{participant.name}</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {participant.role}
          </Badge>
          <span className="text-xs text-muted-foreground ml-auto">
            #{turn.turnNumber}
          </span>
        </div>

        {/* Dialogue with trait overlay */}
        <div className="text-sm leading-relaxed">
          {showTraitOverlay && turn.traitSignals.length > 0 ? (
            <TraitHighlightedText
              text={turn.dialogue}
              signals={turn.traitSignals}
            />
          ) : (
            turn.dialogue
          )}
        </div>

        {/* Non-verbal actions */}
        {turn.actions.length > 0 && (
          <div className="mt-2 space-y-0.5">
            {turn.actions.map((action, index) => (
              <p
                key={index}
                className="text-xs italic text-muted-foreground"
              >
                {action}
              </p>
            ))}
          </div>
        )}

        {/* Turn indicators */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
          {/* Sentiment */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: SENTIMENT_COLORS[turn.sentiment] }}
              />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Sentiment: {turn.sentiment}
            </TooltipContent>
          </Tooltip>

          {/* Mini OCEAN indicators */}
          <div className="flex gap-1">
            {(["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"] as const).map(
              (trait) => {
                const signal = turn.traitSignals.find((s) => s.trait === trait);
                if (!signal) return null;
                return (
                  <Tooltip key={trait}>
                    <TooltipTrigger asChild>
                      <div
                        className="w-4 h-1.5 rounded-full opacity-70"
                        style={{
                          backgroundColor: OCEAN_COLORS[trait],
                          opacity: 0.3 + Math.abs(signal.value) * 0.7,
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {OCEAN_LABELS[trait]}: {signal.value > 0 ? "+" : ""}
                      {(signal.value * 100).toFixed(0)}%
                    </TooltipContent>
                  </Tooltip>
                );
              }
            )}
          </div>

          {/* Adaptive cue indicator */}
          {turn.adaptation && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1 py-0 h-4 ml-auto"
                >
                  Adapted
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs max-w-[200px]">
                {turn.adaptation.rationale}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </Card>
    </div>
  );
}

// ============================================
// Trait Highlighted Text
// ============================================

interface TraitHighlightedTextProps {
  text: string;
  signals: TraitSignal[];
}

function TraitHighlightedText({ text, signals }: TraitHighlightedTextProps) {
  // Snap indices to word boundaries
  const snapToWordBoundaries = (start: number, end: number): [number, number] => {
    // Expand start to beginning of word
    let newStart = start;
    while (newStart > 0 && !/\s/.test(text[newStart - 1])) {
      newStart--;
    }
    
    // Expand end to end of word
    let newEnd = end;
    while (newEnd < text.length && !/\s/.test(text[newEnd])) {
      newEnd++;
    }
    
    return [newStart, newEnd];
  };

  // Process signals with snapped boundaries
  const processedSignals = signals.map((signal) => {
    const [start, end] = snapToWordBoundaries(
      Math.max(0, Math.min(signal.startIndex, text.length)),
      Math.max(0, Math.min(signal.endIndex, text.length))
    );
    return { ...signal, startIndex: start, endIndex: end };
  });

  // Sort signals by start index and remove overlapping
  const sortedSignals = [...processedSignals]
    .sort((a, b) => a.startIndex - b.startIndex)
    .filter((signal, index, arr) => {
      if (index === 0) return true;
      // Skip if overlaps with previous
      return signal.startIndex >= arr[index - 1].endIndex;
    });

  // Build highlighted segments
  const segments: { text: string; signal?: TraitSignal }[] = [];
  let lastIndex = 0;

  for (const signal of sortedSignals) {
    // Skip invalid ranges
    if (signal.startIndex >= signal.endIndex || signal.startIndex < 0) continue;
    
    // Add unhighlighted text before this signal
    if (signal.startIndex > lastIndex) {
      segments.push({ text: text.slice(lastIndex, signal.startIndex) });
    }

    // Add highlighted segment
    const highlightText = text.slice(signal.startIndex, signal.endIndex);
    if (highlightText.length > 0) {
      segments.push({
        text: highlightText,
        signal,
      });
    }

    lastIndex = signal.endIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }

  return (
    <span>
      {segments.map((segment, index) => {
        if (!segment.signal) {
          return <span key={index}>{segment.text}</span>;
        }

        const color = OCEAN_COLORS[segment.signal.trait];
        const intensity = Math.min(0.25, segment.signal.confidence * 0.25);

        return (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <span
                className="rounded-sm cursor-help"
                style={{
                  backgroundColor: `${color}${Math.round(intensity * 255)
                    .toString(16)
                    .padStart(2, "0")}`,
                  borderBottom: `2px solid ${color}`,
                  paddingBottom: "1px",
                }}
              >
                {segment.text}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[250px]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium">
                    {OCEAN_LABELS[segment.signal.trait]}
                  </span>
                  <span className="text-muted-foreground">
                    ({(segment.signal.confidence * 100).toFixed(0)}%)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {segment.signal.rationale}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </span>
  );
}
