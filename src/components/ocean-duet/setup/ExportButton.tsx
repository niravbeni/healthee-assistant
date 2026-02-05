"use client";

import { Button } from "@/components/ocean-duet/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ocean-duet/ui/dropdown-menu";
import { Download } from "lucide-react";
import { useConversation } from "@/context/ConversationContext";
import type { ExportData } from "@/lib/ocean/types";

export function ExportButton() {
  const { state } = useConversation();
  const { turns, participantA, participantB, scenario, adaptiveSettings } =
    state.conversation;

  const hasData = turns.length > 0;

  const exportAsJSON = () => {
    const data: ExportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      participantA,
      participantB,
      scenario,
      turns,
      adaptiveSettings,
    };

    downloadFile(
      JSON.stringify(data, null, 2),
      `ocean-duet-${Date.now()}.json`,
      "application/json"
    );
  };

  const exportAsMarkdown = () => {
    const lines: string[] = [
      "# OCEAN Duet Conversation",
      "",
      `**Exported:** ${new Date().toLocaleString()}`,
      "",
      "## Participants",
      "",
      `### ${participantA.name} (${participantA.role})`,
      `- **Persona:** ${participantA.persona}`,
      `- **OCEAN Profile:**`,
      `  - Openness: ${participantA.ocean.openness}`,
      `  - Conscientiousness: ${participantA.ocean.conscientiousness}`,
      `  - Extraversion: ${participantA.ocean.extraversion}`,
      `  - Agreeableness: ${participantA.ocean.agreeableness}`,
      `  - Neuroticism: ${participantA.ocean.neuroticism}`,
      "",
      `### ${participantB.name} (${participantB.role})`,
      `- **Persona:** ${participantB.persona}`,
      `- **OCEAN Profile:**`,
      `  - Openness: ${participantB.ocean.openness}`,
      `  - Conscientiousness: ${participantB.ocean.conscientiousness}`,
      `  - Extraversion: ${participantB.ocean.extraversion}`,
      `  - Agreeableness: ${participantB.ocean.agreeableness}`,
      `  - Neuroticism: ${participantB.ocean.neuroticism}`,
      "",
      "## Scenario",
      "",
      `**Topic:** ${scenario.topic}`,
      "",
      `**Background:** ${scenario.background}`,
      "",
      `**Tone:** ${scenario.tone}`,
      "",
      "## Conversation",
      "",
    ];

    turns.forEach((turn) => {
      const participant = turn.speaker === "A" ? participantA : participantB;
      lines.push(`### Turn ${turn.turnNumber} - ${participant.name}`);
      lines.push("");
      lines.push(`> ${turn.dialogue}`);
      lines.push("");
      if (turn.actions.length > 0) {
        lines.push(`*${turn.actions.join("; ")}*`);
        lines.push("");
      }
      lines.push(`**Sentiment:** ${turn.sentiment}`);
      lines.push("");
    });

    downloadFile(
      lines.join("\n"),
      `ocean-duet-${Date.now()}.md`,
      "text/markdown"
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={!hasData}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportAsJSON}>
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsMarkdown}>
          Export as Markdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
