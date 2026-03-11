"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BattleCard from "@/components/BattleCard";
import ChatInterface from "@/components/ChatInterface";
import competitorsData from "@/data/competitors.json";
import { motion } from "framer-motion";

export default function CompetitiveIntelPage() {
  const [activeCompetitor, setActiveCompetitor] = useState(competitorsData[0].id);

  const competitor = competitorsData.find((c) => c.id === activeCompetitor) || competitorsData[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-netapp-dark">
          Competitive Intelligence
        </h1>
        <p className="text-netapp-muted mt-1">
          Battle cards and positioning against key competitors
        </p>
      </div>

      <Tabs value={activeCompetitor} onValueChange={setActiveCompetitor}>
        <TabsList>
          {competitorsData.map((c) => (
            <TabsTrigger key={c.id} value={c.id}>
              {c.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <BattleCard competitor={competitor} />
        </div>

        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-sm font-semibold text-netapp-dark mb-3">
              Ask About {competitor.name}
            </h3>
            <ChatInterface
              context={`Help the user with competitive positioning against ${competitor.name}. Their products include: ${competitor.products.join(", ")}. Focus on NetApp's advantages and effective talk tracks.`}
              placeholder={`Ask about competing with ${competitor.name}...`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
