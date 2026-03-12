"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Recommendation {
  recommended: string;
  confidence: "high" | "med" | "low";
  reasons: string[];
  alternatives: string[];
  next_steps: string[];
}

const confidenceConfig = {
  high: { color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50", label: "High Confidence" },
  med: { color: "bg-amber-500", textColor: "text-amber-700", bgColor: "bg-amber-50", label: "Medium Confidence" },
  low: { color: "bg-gray-400", textColor: "text-gray-600", bgColor: "bg-gray-50", label: "Low Confidence" },
};

export function parseRecommendation(text: string): Recommendation | null {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[1]);
    if (parsed.recommended && parsed.confidence && parsed.reasons) {
      return parsed as Recommendation;
    }
  } catch {
    // JSON parse failed
  }
  return null;
}

export function getTextWithoutJson(text: string): string {
  return text.replace(/```json\s*[\s\S]*?\s*```/, "").trim();
}

export default function ProductRecommendationCard({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const conf = confidenceConfig[recommendation.confidence] || confidenceConfig.low;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="rounded-lg border border-netapp-border bg-white shadow-sm overflow-hidden mt-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-netapp-border bg-netapp-surface">
        <h4 className="text-base font-semibold text-netapp-dark">
          {recommendation.recommended}
        </h4>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${conf.color}`} />
          <span className={`text-xs font-medium ${conf.textColor}`}>
            {conf.label}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Reasons */}
        <div>
          <p className="text-xs font-medium text-netapp-muted uppercase tracking-wide mb-2">
            Why this product
          </p>
          <ul className="space-y-1.5">
            {recommendation.reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-netapp-dark">
                <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Alternatives */}
        {recommendation.alternatives.length > 0 && (
          <div>
            <p className="text-xs font-medium text-netapp-muted uppercase tracking-wide mb-2">
              Alternatives to consider
            </p>
            <div className="flex flex-wrap gap-1.5">
              {recommendation.alternatives.map((alt, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-xs border-netapp-border text-netapp-muted hover:text-netapp-dark cursor-default"
                >
                  {alt}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {recommendation.next_steps.length > 0 && (
          <div>
            <p className="text-xs font-medium text-netapp-muted uppercase tracking-wide mb-2">
              Next steps
            </p>
            <ol className="space-y-1.5">
              {recommendation.next_steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-netapp-dark">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-netapp-blue text-white text-xs flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </motion.div>
  );
}
