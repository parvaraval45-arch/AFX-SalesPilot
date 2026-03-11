"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldAlert,
  ShieldCheck,
  Trophy,
  MessageSquare,
} from "lucide-react";

interface Competitor {
  id: string;
  name: string;
  products: string[];
  strengths: string[];
  weaknesses: string[];
  netappAdvantages: string[];
  battleCardPoints: string[];
}

interface BattleCardProps {
  competitor: Competitor;
}

export default function BattleCard({ competitor }: BattleCardProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-netapp-dark">
          vs. {competitor.name}
        </h3>
        <div className="flex gap-1 flex-wrap">
          {competitor.products.map((product) => (
            <span
              key={product}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
            >
              {product}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Their Strengths (threats) */}
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-700">
              <ShieldAlert size={16} />
              Their Strengths (Watch Out)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {competitor.strengths.map((item, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-red-400 mt-1 flex-shrink-0">&#8226;</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Their Weaknesses (opportunities) */}
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-green-700">
              <ShieldCheck size={16} />
              Their Weaknesses (Exploit)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {competitor.weaknesses.map((item, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-green-400 mt-1 flex-shrink-0">&#8226;</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* NetApp Advantages */}
      <Card className="border-netapp-blue/30 bg-blue-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-netapp-blue">
            <Trophy size={16} />
            NetApp Advantages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {competitor.netappAdvantages.map((item, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-netapp-blue mt-1 flex-shrink-0">&#8226;</span>
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Talk Track */}
      <Card className="border-netapp-accent/30 bg-sky-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-netapp-accent">
            <MessageSquare size={16} />
            Key Talk Track Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {competitor.battleCardPoints.map((item, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-netapp-accent mt-1 flex-shrink-0">{i + 1}.</span>
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
