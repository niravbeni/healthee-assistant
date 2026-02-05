"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ocean-duet/ui/card";
import { Badge } from "@/components/ocean-duet/ui/badge";
import { useConversation } from "@/context/ConversationContext";
import {
  OCEAN_TRAITS,
  OCEAN_SHORT_LABELS,
  OCEAN_COLORS,
} from "@/lib/ocean/constants";

export function RadarChart() {
  const { state } = useConversation();
  const { selectedTurn } = state.ui;
  const { turns, participantA, participantB } = state.conversation;

  // Find the selected turn or use the latest
  const turn = selectedTurn
    ? turns.find((t) => t.id === selectedTurn.turnId)
    : turns[turns.length - 1];

  if (!turn) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Select a turn to view its personality snapshot
        </p>
      </div>
    );
  }

  const participant = turn.speaker === "A" ? participantA : participantB;
  // Use cumulativeTrajectory if available, fall back to ocean
  const trajectory = turn.cumulativeTrajectory || turn.ocean;

  // Handle case where trajectory might still be undefined
  if (!trajectory) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          No personality data for this turn
        </p>
      </div>
    );
  }

  // Build radar data
  const radarData = OCEAN_TRAITS.map((trait) => ({
    trait: OCEAN_SHORT_LABELS[trait],
    fullName: trait,
    baseline: participant.ocean[trait],
    current: trajectory[trait],
  }));

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            style={{
              borderColor: turn.speaker === "A" ? "#3B82F6" : "#10B981",
              color: turn.speaker === "A" ? "#3B82F6" : "#10B981",
            }}
          >
            Turn {turn.turnNumber}
          </Badge>
          <span className="text-sm font-medium">{participant.name}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {participant.role}
        </span>
      </div>

      {/* Chart */}
      <Card className="flex-1 p-4 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={radarData} cx="50%" cy="50%">
            <PolarGrid />
            <PolarAngleAxis
              dataKey="trait"
              tick={{ fontSize: 11, fill: "currentColor" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 9 }}
              tickCount={5}
            />
            <Radar
              name="Baseline"
              dataKey="baseline"
              stroke="#9CA3AF"
              fill="#9CA3AF"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Radar
              name="Current"
              dataKey="current"
              stroke={turn.speaker === "A" ? "#3B82F6" : "#10B981"}
              fill={turn.speaker === "A" ? "#3B82F6" : "#10B981"}
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </Card>

      {/* Trait Details */}
      <div className="grid grid-cols-5 gap-2 shrink-0">
        {OCEAN_TRAITS.map((trait) => {
          const baseline = participant.ocean[trait];
          const current = trajectory[trait];
          const delta = current - baseline;

          return (
            <div
              key={trait}
              className="text-center p-2 rounded-lg"
              style={{ backgroundColor: `${OCEAN_COLORS[trait]}10` }}
            >
              <div
                className="text-xs font-medium"
                style={{ color: OCEAN_COLORS[trait] }}
              >
                {OCEAN_SHORT_LABELS[trait]}
              </div>
              <div className="text-lg font-semibold tabular-nums">
                {current.toFixed(0)}
              </div>
              <div
                className={`text-xs ${
                  delta > 0
                    ? "text-green-600"
                    : delta < 0
                    ? "text-red-600"
                    : "text-muted-foreground"
                }`}
              >
                {delta > 0 ? "+" : ""}
                {delta.toFixed(1)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
