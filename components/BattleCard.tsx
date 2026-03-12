"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  AlertTriangle,
  MessageSquareQuote,
  Copy,
  CheckCircle2,
  FileText,
  Trophy,
  Shield,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

export interface Competitor {
  id: string;
  name: string;
  category: string;
  architecture: string;
  max_throughput_gbs?: number;
  protocols: string[];
  pricing_model: string;
  ai_tooling: string;
  strengths: string[];
  weaknesses: string[];
  afx_advantages: string[];
  killer_questions: string[];
}

interface AIAnalysis {
  strengths: string[];
  watchouts: string[];
  killer_questions: string[];
  head_to_head: Record<string, [string, string]>;
  win_scenario: string;
  lose_scenario: string;
}

interface BattleCardProps {
  competitor: Competitor;
  aiAnalysis: AIAnalysis | null;
  isLoading: boolean;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-7 text-xs text-netapp-muted hover:text-netapp-dark"
    >
      {copied ? (
        <>
          <CheckCircle2 size={12} className="mr-1 text-green-600" />
          Copied
        </>
      ) : (
        <>
          <Copy size={12} className="mr-1" />
          {label}
        </>
      )}
    </Button>
  );
}

const DEFAULT_HEAD_TO_HEAD: Record<string, [string, string]> = {
  Architecture: ["Disaggregated NVMe (controllers + NX224 enclosures + DX50)", ""],
  Throughput: ["4 TB/s (128-node cluster)", ""],
  Capacity: ["1+ EB with FabricPool", ""],
  Protocols: ["NAS (pNFS/NFS) + S3", ""],
  "AI Integration": ["AIDE + NVIDIA NIM on DX50", ""],
  Pricing: ["CapEx + Keystone STaaS", ""],
};

function buildHeadToHead(
  competitor: Competitor,
  aiAnalysis: AIAnalysis | null
): Record<string, [string, string]> {
  if (aiAnalysis?.head_to_head) return aiAnalysis.head_to_head;

  const h2h = { ...DEFAULT_HEAD_TO_HEAD };
  h2h.Architecture[1] = competitor.architecture;
  h2h.Throughput[1] = competitor.max_throughput_gbs
    ? `${competitor.max_throughput_gbs >= 1000 ? `${(competitor.max_throughput_gbs / 1000).toFixed(1)} TB/s` : `${competitor.max_throughput_gbs} GB/s`}`
    : "Varies";
  h2h.Protocols[1] = competitor.protocols.join(", ");
  h2h.Pricing[1] = competitor.pricing_model;
  h2h["AI Integration"][1] = competitor.ai_tooling;
  h2h.Capacity[1] = "Varies by config";
  return h2h;
}

export default function BattleCard({
  competitor,
  aiAnalysis,
  isLoading,
}: BattleCardProps) {
  const headToHead = buildHeadToHead(competitor, aiAnalysis);

  const strengths = aiAnalysis?.strengths || competitor.afx_advantages.slice(0, 3);
  const watchouts = aiAnalysis?.watchouts || competitor.strengths.slice(0, 2);
  const killerQuestions = aiAnalysis?.killer_questions || competitor.killer_questions;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-netapp-blue mx-auto mb-3" />
          <p className="text-sm text-netapp-muted">Generating AI battlecard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={competitor.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-netapp-dark">
              <span className="text-netapp-blue">NetApp AFX</span>
              {" "}vs{" "}
              <span>{competitor.name}</span>
            </h2>
          </div>
          <p className="text-xs text-netapp-muted mt-0.5">{competitor.category}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="border-netapp-border text-xs"
          >
            <FileText size={12} className="mr-1" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Head-to-Head Table */}
      <Card className="border-netapp-border overflow-hidden">
        <div className="grid grid-cols-3 bg-netapp-surface border-b border-netapp-border">
          <div className="px-4 py-2 text-xs font-semibold text-netapp-muted uppercase tracking-wide">
            Dimension
          </div>
          <div className="px-4 py-2 text-xs font-semibold text-netapp-blue uppercase tracking-wide">
            NetApp AFX
          </div>
          <div className="px-4 py-2 text-xs font-semibold text-netapp-muted uppercase tracking-wide">
            {competitor.name}
          </div>
        </div>
        {Object.entries(headToHead).map(([dimension, [afx, comp]], i) => (
          <div
            key={dimension}
            className={`grid grid-cols-3 ${
              i % 2 === 0 ? "bg-white" : "bg-netapp-surface/50"
            } border-b border-netapp-border last:border-b-0`}
          >
            <div className="px-4 py-2.5 text-xs font-medium text-netapp-dark">
              {dimension}
            </div>
            <div className="px-4 py-2.5 text-xs text-netapp-dark">{afx}</div>
            <div className="px-4 py-2.5 text-xs text-netapp-muted">{comp}</div>
          </div>
        ))}
        <div className="px-3 py-1.5 bg-netapp-surface border-t border-netapp-border flex justify-end">
          <CopyButton
            text={Object.entries(headToHead)
              .map(([d, [a, c]]) => `${d}: AFX=${a} | ${competitor.name}=${c}`)
              .join("\n")}
            label="Copy table"
          />
        </div>
      </Card>

      {/* Strengths + Watch Outs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AFX Strengths */}
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                <Trophy size={14} />
                AFX Strengths
              </CardTitle>
              <CopyButton
                text={strengths.join("\n")}
                label="Copy"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {strengths.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-netapp-dark">
                  <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Watch Outs */}
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                <Shield size={14} />
                Watch Out For
              </CardTitle>
              <CopyButton
                text={watchouts.join("\n")}
                label="Copy"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {watchouts.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-netapp-dark">
                  <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Win/Lose Scenarios */}
      {aiAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
              Win Scenario
            </p>
            <p className="text-sm text-green-800">{aiAnalysis.win_scenario}</p>
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">
              Lose Scenario
            </p>
            <p className="text-sm text-red-800">{aiAnalysis.lose_scenario}</p>
          </div>
        </div>
      )}

      {/* Killer Questions */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
              <MessageSquareQuote size={14} />
              Killer Questions
            </CardTitle>
            <CopyButton
              text={killerQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n\n")}
              label="Copy"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {killerQuestions.map((question, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-netapp-dark italic leading-relaxed">
                  &ldquo;{question}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Static Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Their Full Strengths */}
        <Card className="border-netapp-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-netapp-muted uppercase tracking-wide">
              {competitor.name} Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1.5">
              {competitor.strengths.map((s, i) => (
                <li key={i} className="text-xs text-netapp-dark flex gap-2">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">&bull;</span>
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Their Full Weaknesses */}
        <Card className="border-netapp-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-netapp-muted uppercase tracking-wide">
              {competitor.name} Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1.5">
              {competitor.weaknesses.map((w, i) => (
                <li key={i} className="text-xs text-netapp-dark flex gap-2">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">&bull;</span>
                  {w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
