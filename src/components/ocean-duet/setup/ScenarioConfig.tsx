"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ocean-duet/ui/card";
import { Input } from "@/components/ocean-duet/ui/input";
import { Label } from "@/components/ocean-duet/ui/label";
import { Textarea } from "@/components/ocean-duet/ui/textarea";
import { Button } from "@/components/ocean-duet/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ocean-duet/ui/select";
import { Slider } from "@/components/ocean-duet/ui/slider";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useConversation } from "@/context/ConversationContext";
import { TONE_OPTIONS } from "@/lib/ocean/constants";

interface ScenarioConfigProps {
  disabled?: boolean;
}

export function ScenarioConfig({ disabled = false }: ScenarioConfigProps) {
  const [expanded, setExpanded] = useState(true);
  const [showObjectives, setShowObjectives] = useState(false);
  const { state, setScenario } = useConversation();
  const { scenario } = state.conversation;

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="p-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Scenario</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-0 space-y-4">
          {/* Topic */}
          <div className="space-y-1.5">
            <Label htmlFor="topic" className="text-xs">
              Topic
            </Label>
            <Input
              id="topic"
              value={scenario.topic}
              onChange={(e) => setScenario({ topic: e.target.value })}
              disabled={disabled}
              className="h-8 text-sm"
              placeholder="What is this conversation about?"
            />
          </div>

          {/* Background */}
          <div className="space-y-1.5">
            <Label htmlFor="background" className="text-xs">
              Background Context
            </Label>
            <Textarea
              id="background"
              value={scenario.background}
              onChange={(e) => setScenario({ background: e.target.value })}
              disabled={disabled}
              className="text-sm min-h-[60px] resize-none"
              placeholder="Provide context for the conversation..."
            />
          </div>

          {/* Tone & Max Turns */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tone" className="text-xs">
                Tone
              </Label>
              <Select
                value={scenario.tone}
                onValueChange={(value) =>
                  setScenario({ tone: value as typeof scenario.tone })
                }
                disabled={disabled}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center justify-between">
                <span>Max Turns</span>
                <span className="text-muted-foreground tabular-nums">
                  {scenario.maxTurns}
                </span>
              </Label>
              <Slider
                value={[scenario.maxTurns]}
                onValueChange={(value) => setScenario({ maxTurns: value[0] })}
                min={4}
                max={24}
                step={2}
                disabled={disabled}
                className="mt-2"
              />
            </div>
          </div>

          {/* Objectives Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Participant Objectives</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 text-xs px-2"
                onClick={() => setShowObjectives(!showObjectives)}
              >
                {showObjectives ? "Hide" : "Edit"}
              </Button>
            </div>
            {showObjectives && scenario.objectives && (
              <div className="space-y-2">
                {scenario.objectives.map((obj, index) => (
                  <div key={obj.participantId} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Participant {obj.participantId}
                    </Label>
                    <Textarea
                      value={obj.objective}
                      onChange={(e) => {
                        const newObjectives = [...scenario.objectives!];
                        newObjectives[index] = {
                          ...obj,
                          objective: e.target.value,
                        };
                        setScenario({ objectives: newObjectives });
                      }}
                      disabled={disabled}
                      className="text-sm min-h-[50px] resize-none"
                      placeholder={`What should ${obj.participantId} try to achieve?`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
