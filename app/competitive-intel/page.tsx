"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BattleCard, { type Competitor } from "@/components/BattleCard";
import competitorsData from "@/data/competitors.json";
import { Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";

const competitors = competitorsData as Competitor[];

const COMPETITOR_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  "pure-flashblade": { border: "border-orange-400", bg: "bg-orange-50", text: "text-orange-700" },
  "dell-powerstore": { border: "border-blue-400", bg: "bg-blue-50", text: "text-blue-700" },
  "hpe-alletra": { border: "border-green-400", bg: "bg-green-50", text: "text-green-700" },
  weka: { border: "border-violet-400", bg: "bg-violet-50", text: "text-violet-700" },
  "vast-data": { border: "border-rose-400", bg: "bg-rose-50", text: "text-rose-700" },
  ddn: { border: "border-cyan-400", bg: "bg-cyan-50", text: "text-cyan-700" },
};

interface AIAnalysis {
  strengths: string[];
  watchouts: string[];
  killer_questions: string[];
  head_to_head: Record<string, [string, string]>;
  win_scenario: string;
  lose_scenario: string;
}

export default function CompetitiveIntelPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeCompetitor = activeId
    ? competitors.find((c) => c.id === activeId) || null
    : null;

  const handleSelect = useCallback(
    async (id: string) => {
      setActiveId(id);
      setAiAnalysis(null);
      setIsLoading(true);

      try {
        const response = await fetch("/api/competitive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ competitor: id }),
        });

        if (response.ok) {
          const data = await response.json();
          setAiAnalysis(data.ai_analysis);
        }
      } catch {
        // Fall back to static data
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleQuickCompare = useCallback(() => {
    if (competitors.length > 0) {
      handleSelect(competitors[0].id);
    }
  }, [handleSelect]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h1 className="text-2xl font-bold text-netapp-dark">
          Competitive Intelligence
        </h1>
        <p className="text-netapp-muted text-sm mt-1">
          AI-powered battlecard generator for AFX vs key storage competitors
        </p>
      </div>

      <div className="grid grid-cols-10 gap-6">
        {/* Left column (30%) — Competitor Selector */}
        <div className="col-span-3 space-y-3">
          <Button
            onClick={handleQuickCompare}
            variant="outline"
            className="w-full border-netapp-blue text-netapp-blue hover:bg-netapp-blue hover:text-white text-xs"
          >
            <Zap size={14} className="mr-1" />
            Quick Compare All
          </Button>

          {competitors.map((c) => {
            const colors = COMPETITOR_COLORS[c.id] || {
              border: "border-gray-300",
              bg: "bg-gray-50",
              text: "text-gray-700",
            };
            const isActive = activeId === c.id;

            return (
              <motion.div key={c.id} whileHover={{ scale: 1.01 }} transition={{ duration: 0.1 }}>
                <Card
                  className={`cursor-pointer transition-all duration-150 border-l-4 ${
                    colors.border
                  } ${isActive ? `${colors.bg} shadow-md ring-1 ring-${colors.border}` : "hover:shadow-sm"}`}
                  onClick={() => handleSelect(c.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${isActive ? colors.text : "text-netapp-dark"}`}>
                          {c.name}
                        </p>
                        <p className="text-[10px] text-netapp-muted mt-0.5 truncate">
                          {c.category}
                        </p>
                      </div>
                      {isActive && isLoading && (
                        <Loader2 size={14} className="animate-spin text-netapp-blue flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.protocols.slice(0, 3).map((p) => (
                        <Badge
                          key={p}
                          variant="secondary"
                          className="text-[9px] px-1 py-0 bg-white/80"
                        >
                          {p}
                        </Badge>
                      ))}
                      {c.protocols.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1 py-0 bg-white/80"
                        >
                          +{c.protocols.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Right column (70%) — Dynamic Battlecard */}
        <div className="col-span-7">
          {activeCompetitor ? (
            <BattleCard
              competitor={activeCompetitor}
              aiAnalysis={aiAnalysis}
              isLoading={isLoading}
            />
          ) : (
            <div className="flex items-center justify-center h-96 border border-dashed border-netapp-border rounded-lg bg-white">
              <div className="text-center text-netapp-muted">
                <Zap size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Select a competitor</p>
                <p className="text-xs mt-1">
                  Click a competitor card to generate an AI-powered battlecard
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
