"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ocean-duet/ui/tabs";
import { useConversation } from "@/context/ConversationContext";
import { TrajectoryChart } from "./TrajectoryChart";
import { RadarChart } from "./RadarChart";
import { RetrievalPanel } from "./RetrievalPanel";
import { AdaptiveCuePanel } from "./AdaptiveCuePanel";
import type { AnalyticsTab } from "@/lib/ocean/types";

export function AnalyticsPanel() {
  const { state, setAnalyticsTab } = useConversation();
  const { activeAnalyticsTab } = state.ui;
  const { adaptiveSettings } = state.conversation;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b shrink-0">
        <h2 className="font-semibold">Analytics</h2>
      </div>

      <Tabs
        value={activeAnalyticsTab}
        onValueChange={(value) => setAnalyticsTab(value as AnalyticsTab)}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="mx-4 mt-3 grid w-auto grid-cols-4">
          <TabsTrigger value="trajectory" className="text-xs">
            Trajectory
          </TabsTrigger>
          <TabsTrigger value="radar" className="text-xs">
            Radar
          </TabsTrigger>
          <TabsTrigger value="retrieval" className="text-xs">
            Retrieval
          </TabsTrigger>
          <TabsTrigger
            value="adaptive"
            className="text-xs"
            disabled={!adaptiveSettings.enabled}
          >
            Adaptive
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="trajectory" className="h-full m-0 p-4">
            <TrajectoryChart />
          </TabsContent>

          <TabsContent value="radar" className="h-full m-0 p-4">
            <RadarChart />
          </TabsContent>

          <TabsContent value="retrieval" className="h-full m-0 p-4">
            <RetrievalPanel />
          </TabsContent>

          <TabsContent value="adaptive" className="h-full m-0 p-4">
            <AdaptiveCuePanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
