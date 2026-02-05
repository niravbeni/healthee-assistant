"use client";

import { ScrollArea } from "@/components/ocean-duet/ui/scroll-area";
import { Card } from "@/components/ocean-duet/ui/card";
import { Badge } from "@/components/ocean-duet/ui/badge";
import { FileText } from "lucide-react";
import { useConversation } from "@/context/ConversationContext";

export function RetrievalPanel() {
  const { state } = useConversation();
  const { selectedTurn } = state.ui;
  const { turns, participantA, participantB } = state.conversation;

  // Find the selected turn or use the latest
  const turn = selectedTurn
    ? turns.find((t) => t.id === selectedTurn.turnId)
    : turns[turns.length - 1];

  const retrievedDocs = turn?.retrievedDocs || [];

  if (turns.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Start a conversation to see document retrievals
        </p>
      </div>
    );
  }

  if (retrievedDocs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No documents retrieved for this turn
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Upload documents in the participant config to enable RAG
        </p>
      </div>
    );
  }

  const participant = turn?.speaker === "A" ? participantA : participantB;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium">Retrieved Snippets</span>
        </div>
        {turn && (
          <Badge variant="outline" className="text-xs">
            Turn {turn.turnNumber} - {participant?.name}
          </Badge>
        )}
      </div>

      {/* Snippets */}
      <ScrollArea className="flex-1">
        <div className="space-y-3">
          {retrievedDocs.map((doc, index) => (
            <Card key={doc.chunkId || doc.id || index} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {doc.documentName || doc.title || 'Document'}
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  Score: {((doc.score || doc.relevance || 0) * 100).toFixed(0)}%
                </Badge>
              </div>
              <p className="text-sm leading-relaxed">{doc.content || 'Retrieved context'}</p>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
