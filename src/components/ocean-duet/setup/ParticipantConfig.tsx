"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ocean-duet/ui/card";
import { Input } from "@/components/ocean-duet/ui/input";
import { Label } from "@/components/ocean-duet/ui/label";
import { Textarea } from "@/components/ocean-duet/ui/textarea";
import { Slider } from "@/components/ocean-duet/ui/slider";
import { Badge } from "@/components/ocean-duet/ui/badge";
import { Button } from "@/components/ocean-duet/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ocean-duet/ui/tooltip";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Participant, OceanTrait } from "@/lib/ocean/types";
import { DocumentUpload } from "./DocumentUpload";
import {
  OCEAN_TRAITS,
  OCEAN_LABELS,
  OCEAN_COLORS,
  OCEAN_DESCRIPTIONS,
} from "@/lib/ocean/constants";

interface ParticipantConfigProps {
  participant: Participant;
  onChange: (updates: Partial<Participant>) => void;
  disabled?: boolean;
}

export function ParticipantConfig({
  participant,
  onChange,
  disabled = false,
}: ParticipantConfigProps) {
  const [expanded, setExpanded] = useState(true);
  const [showPersona, setShowPersona] = useState(false);

  const handleOceanChange = (trait: OceanTrait, value: number[]) => {
    onChange({
      ocean: {
        ...participant.ocean,
        [trait]: value[0],
      },
    });
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="p-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                borderColor: participant.id === "A" ? "#3B82F6" : "#10B981",
                color: participant.id === "A" ? "#3B82F6" : "#10B981",
              }}
            >
              {participant.id}
            </Badge>
            Participant {participant.id}
          </CardTitle>
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
          {/* Name & Role */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`name-${participant.id}`} className="text-xs">
                Name
              </Label>
              <Input
                id={`name-${participant.id}`}
                value={participant.name}
                onChange={(e) => onChange({ name: e.target.value })}
                disabled={disabled}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`role-${participant.id}`} className="text-xs">
                Role
              </Label>
              <Input
                id={`role-${participant.id}`}
                value={participant.role}
                onChange={(e) => onChange({ role: e.target.value })}
                disabled={disabled}
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Persona Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Persona</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 text-xs px-2"
                onClick={() => setShowPersona(!showPersona)}
              >
                {showPersona ? "Hide" : "Edit"}
              </Button>
            </div>
            {showPersona && (
              <Textarea
                value={participant.persona}
                onChange={(e) => onChange({ persona: e.target.value })}
                disabled={disabled}
                className="text-sm min-h-[80px] resize-none"
                placeholder="Describe the participant's background, personality, and communication style..."
              />
            )}
            {!showPersona && participant.persona && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {participant.persona}
              </p>
            )}
          </div>

          {/* OCEAN Sliders */}
          <div className="space-y-3">
            <Label className="text-xs font-medium">OCEAN Profile</Label>
            {OCEAN_TRAITS.map((trait) => (
              <OceanSlider
                key={trait}
                trait={trait}
                value={participant.ocean[trait]}
                onChange={(value) => handleOceanChange(trait, value)}
                disabled={disabled}
              />
            ))}
          </div>

          {/* Documents */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Documents ({participant.documents.length})
            </Label>
            <DocumentUpload participantId={participant.id} disabled={disabled} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ============================================
// OCEAN Slider Component
// ============================================

interface OceanSliderProps {
  trait: OceanTrait;
  value: number;
  onChange: (value: number[]) => void;
  disabled?: boolean;
}

function OceanSlider({ trait, value, onChange, disabled }: OceanSliderProps) {
  const color = OCEAN_COLORS[trait];
  const description = OCEAN_DESCRIPTIONS[trait];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <Label
              className="text-xs cursor-help flex items-center gap-1.5"
              style={{ color }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              {OCEAN_LABELS[trait]}
            </Label>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[200px]">
            <div className="space-y-1 text-xs">
              <p>
                <strong>High:</strong> {description.high}
              </p>
              <p>
                <strong>Low:</strong> {description.low}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
        <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">
          {value}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={onChange}
        min={0}
        max={100}
        step={1}
        disabled={disabled}
        className="cursor-pointer"
        style={
          {
            "--slider-color": color,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
