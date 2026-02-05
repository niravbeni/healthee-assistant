"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ocean-duet/ui/card";
import { Label } from "@/components/ocean-duet/ui/label";
import { Switch } from "@/components/ocean-duet/ui/switch";
import { useState } from "react";
import { useConversation } from "@/context/ConversationContext";
import {
  OCEAN_TRAITS,
  OCEAN_SHORT_LABELS,
  OCEAN_LABELS,
  OCEAN_COLORS,
} from "@/lib/ocean/constants";
import type { OceanTrait } from "@/lib/ocean/types";

export function TrajectoryChart() {
  const { state, setSelectedTurn } = useConversation();
  const { turns, participantA, participantB } = state.conversation;
  const [showA, setShowA] = useState(true);
  const [showB, setShowB] = useState(true);
  const [selectedTraits, setSelectedTraits] = useState<Set<OceanTrait>>(
    new Set(OCEAN_TRAITS)
  );

  // Build chart data from turns
  const chartData = turns.map((turn) => {
    // Use cumulativeTrajectory if available, fall back to ocean
    const trajectory = turn.cumulativeTrajectory || turn.ocean;
    const prefix = turn.speaker === "A" ? "a" : "b";

    // Handle case where trajectory might still be undefined
    if (!trajectory) {
      return {
        turn: turn.turnNumber,
        turnId: turn.id,
        speaker: turn.speaker,
      };
    }

    return {
      turn: turn.turnNumber,
      turnId: turn.id,
      speaker: turn.speaker,
      [`${prefix}_openness`]: trajectory.openness,
      [`${prefix}_conscientiousness`]: trajectory.conscientiousness,
      [`${prefix}_extraversion`]: trajectory.extraversion,
      [`${prefix}_agreeableness`]: trajectory.agreeableness,
      [`${prefix}_neuroticism`]: trajectory.neuroticism,
    };
  });

  const toggleTrait = (trait: OceanTrait) => {
    const newSet = new Set(selectedTraits);
    if (newSet.has(trait)) {
      newSet.delete(trait);
    } else {
      newSet.add(trait);
    }
    setSelectedTraits(newSet);
  };

  const handleClick = (data: unknown) => {
    const chartData = data as { activePayload?: { payload?: { turnId: string; turn: number } }[] };
    if (chartData.activePayload?.[0]?.payload) {
      const { turnId, turn } = chartData.activePayload[0].payload;
      setSelectedTurn(turnId, turn);
    }
  };

  if (turns.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Start a conversation to see personality trajectories
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Participant toggles with legend */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Switch
              id="show-a"
              checked={showA}
              onCheckedChange={setShowA}
              className="scale-75"
            />
            <div className="w-4 h-0.5 bg-current rounded" style={{ color: "#3B82F6" }} />
            <Label htmlFor="show-a" className="text-xs text-blue-600 truncate max-w-[80px]">
              {participantA.name.split(" ")[0]}
            </Label>
          </div>
          <div className="flex items-center gap-1.5">
            <Switch
              id="show-b"
              checked={showB}
              onCheckedChange={setShowB}
              className="scale-75"
            />
            <div className="w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: "#10B981" }} />
            <Label htmlFor="show-b" className="text-xs text-emerald-600 truncate max-w-[80px]">
              {participantB.name.split(" ")[0]}
            </Label>
          </div>
        </div>
      </div>

      {/* Trait toggles */}
      <div className="flex flex-wrap gap-1.5 shrink-0">
        {OCEAN_TRAITS.map((trait) => (
          <button
            key={trait}
            onClick={() => toggleTrait(trait)}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-opacity cursor-pointer ${
              selectedTraits.has(trait) ? "opacity-100" : "opacity-30"
            }`}
            style={{
              backgroundColor: `${OCEAN_COLORS[trait]}20`,
              color: OCEAN_COLORS[trait],
            }}
            title={OCEAN_LABELS[trait]}
          >
            {OCEAN_SHORT_LABELS[trait]}
          </button>
        ))}
      </div>

      {/* Chart */}
      <Card className="flex-1 p-3 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            onClick={handleClick}
            margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="turn"
              tick={{ fontSize: 10 }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10 }}
              tickLine={false}
              width={30}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                // Group by trait
                const byTrait: Record<string, { a?: number; b?: number }> = {};
                payload.forEach((entry) => {
                  const key = entry.dataKey as string;
                  const trait = key.substring(2); // Remove "a_" or "b_" prefix
                  const speaker = key.startsWith("a_") ? "a" : "b";
                  if (!byTrait[trait]) byTrait[trait] = {};
                  byTrait[trait][speaker] = entry.value as number;
                });
                
                return (
                  <div className="bg-popover border rounded-lg p-2 shadow-lg text-xs">
                    <p className="font-medium mb-1.5">Turn {label}</p>
                    <div className="space-y-1">
                      {Object.entries(byTrait).map(([trait, values]) => (
                        <div
                          key={trait}
                          className="flex items-center gap-2"
                          style={{ color: OCEAN_COLORS[trait as OceanTrait] }}
                        >
                          <span className="font-medium w-3">{OCEAN_SHORT_LABELS[trait as OceanTrait]}</span>
                          {values.a !== undefined && (
                            <span>{participantA.name.split(" ")[0]}: {values.a.toFixed(0)}</span>
                          )}
                          {values.b !== undefined && (
                            <span>{participantB.name.split(" ")[0]}: {values.b.toFixed(0)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }}
            />

            {/* Lines for Participant A (solid) */}
            {showA &&
              OCEAN_TRAITS.filter((t) => selectedTraits.has(t)).map((trait) => (
                <Line
                  key={`a_${trait}`}
                  type="monotone"
                  dataKey={`a_${trait}`}
                  name={OCEAN_SHORT_LABELS[trait]}
                  stroke={OCEAN_COLORS[trait]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  connectNulls
                />
              ))}

            {/* Lines for Participant B (dashed) */}
            {showB &&
              OCEAN_TRAITS.filter((t) => selectedTraits.has(t)).map((trait) => (
                <Line
                  key={`b_${trait}`}
                  type="monotone"
                  dataKey={`b_${trait}`}
                  name={OCEAN_SHORT_LABELS[trait]}
                  stroke={OCEAN_COLORS[trait]}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                  connectNulls
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
