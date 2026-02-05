"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ocean-duet/ui/card";
import { Label } from "@/components/ocean-duet/ui/label";
import { Switch } from "@/components/ocean-duet/ui/switch";
import { Badge } from "@/components/ocean-duet/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ocean-duet/ui/select";
import { useConversation } from "@/context/ConversationContext";
import { ADAPTIVE_STRATEGIES } from "@/lib/ocean/constants";
import type { AdaptiveStrategy, AdaptiveSensitivity } from "@/lib/ocean/types";

interface AdaptiveControlsProps {
  disabled?: boolean;
}

export function AdaptiveControls({ disabled = false }: AdaptiveControlsProps) {
  const { state, setAdaptiveSettings } = useConversation();
  const { adaptiveSettings } = state.conversation;

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="p-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            Adaptive Listening
            <Badge variant="secondary" className="text-[10px] px-1.5">
              V2
            </Badge>
          </CardTitle>
          <Switch
            checked={adaptiveSettings.enabled}
            onCheckedChange={(enabled) => setAdaptiveSettings({ enabled })}
            disabled={disabled}
          />
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-3">
        {adaptiveSettings.enabled ? (
          <>
            {/* Strategy */}
            <div className="space-y-1.5">
              <Label htmlFor="strategy" className="text-xs">
                Strategy
              </Label>
              <Select
                value={adaptiveSettings.strategy}
                onValueChange={(value) =>
                  setAdaptiveSettings({ strategy: value as AdaptiveStrategy })
                }
                disabled={disabled}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ADAPTIVE_STRATEGIES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {ADAPTIVE_STRATEGIES[adaptiveSettings.strategy].description}
              </p>
            </div>

            {/* Sensitivity */}
            <div className="space-y-1.5">
              <Label htmlFor="sensitivity" className="text-xs">
                Sensitivity
              </Label>
              <Select
                value={adaptiveSettings.sensitivity}
                onValueChange={(value) =>
                  setAdaptiveSettings({
                    sensitivity: value as AdaptiveSensitivity,
                  })
                }
                disabled={disabled}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show Cues Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="show-cues" className="text-xs">
                Show cues in transcript
              </Label>
              <Switch
                id="show-cues"
                checked={adaptiveSettings.showCuesInTranscript}
                onCheckedChange={(showCuesInTranscript) =>
                  setAdaptiveSettings({ showCuesInTranscript })
                }
                disabled={disabled}
              />
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            When enabled, participants dynamically adjust their communication
            style in response to detected personality and emotional signals.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
