"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChatInterface from "@/components/ChatInterface";
import productsData from "@/data/products.json";
import type { Product } from "@/lib/netapp-products";
import {
  Server,
  HardDrive,
  Database,
  Cpu,
  Archive,
  MessageSquarePlus,
} from "lucide-react";
import { motion } from "framer-motion";

const products = productsData as Product[];

const STARTER_PROMPTS = [
  "AI training workload",
  "VMware modernization",
  "High-frequency trading",
  "EDA simulation",
];

const productIcons: Record<string, React.ElementType> = {
  afx: Cpu,
  "aff-a": Server,
  "aff-c": HardDrive,
  "asa-r2": Database,
  fas: Archive,
};

const productColors: Record<string, string> = {
  afx: "border-purple-400 bg-purple-50",
  "aff-a": "border-netapp-blue bg-blue-50",
  "aff-c": "border-teal-400 bg-teal-50",
  "asa-r2": "border-orange-400 bg-orange-50",
  fas: "border-gray-400 bg-gray-50",
};

function getKeySpecs(product: Product): string[] {
  const specs: string[] = [];
  if (product.max_throughput_gbs) {
    specs.push(
      product.max_throughput_gbs >= 1000
        ? `${(product.max_throughput_gbs / 1000).toFixed(0)} TB/s throughput`
        : `${product.max_throughput_gbs} GB/s throughput`
    );
  }
  if (product.max_nodes) {
    specs.push(`Up to ${product.max_nodes} nodes`);
  }
  if (product.max_capacity_pb) {
    specs.push(`${product.max_capacity_pb}+ PB capacity`);
  }
  if (product.latency) {
    specs.push(product.latency);
  }
  if (product.protocols) {
    specs.push(product.protocols.join(", "));
  }
  return specs.slice(0, 3);
}

export default function ProductSelectorPage() {
  const [chatContext, setChatContext] = useState<string | undefined>(undefined);
  const [contextKey, setContextKey] = useState(0);

  const handleCardClick = useCallback((product: Product) => {
    const ctx = `The user is interested in ${product.name}. Product details: ${product.tagline}. Best for: ${product.best_for.join(", ")}. Not ideal for: ${product.not_for.join(", ")}. Differentiator: ${product.differentiator}. Protocols: ${product.protocols.join(", ")}.`;
    setChatContext(ctx);
    setContextKey((k) => k + 1);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-7rem)]"
    >
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-netapp-dark">
          Product Selector
        </h1>
        <p className="text-netapp-muted text-sm mt-1">
          Describe a workload to get AI-powered product recommendations, or
          click a product card for details
        </p>
      </div>

      <div className="grid grid-cols-5 gap-6 h-[calc(100%-4rem)]">
        {/* Left Panel — Chat Interface (60%) */}
        <div className="col-span-3 flex flex-col min-h-0">
          <ChatInterface
            key={contextKey}
            context={chatContext}
            placeholder="Describe your customer's workload requirements..."
            starterPrompts={STARTER_PROMPTS}
            className="flex-1 min-h-0"
          />
        </div>

        {/* Right Panel — Product Quick Reference (40%) */}
        <div className="col-span-2 space-y-3 overflow-y-auto pr-1">
          <h3 className="text-sm font-semibold text-netapp-dark uppercase tracking-wide">
            Product Quick Reference
          </h3>

          {products.map((product) => {
            const Icon = productIcons[product.id] || Server;
            const colorClass = productColors[product.id] || "border-gray-300 bg-gray-50";
            const specs = getKeySpecs(product);

            return (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.15 }}
              >
                <Card
                  className={`border-l-4 cursor-pointer hover:shadow-md transition-all duration-150 ${colorClass}`}
                  onClick={() => handleCardClick(product)}
                >
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-center gap-2">
                      <Icon size={18} className="text-netapp-dark" />
                      <CardTitle className="text-sm font-semibold text-netapp-dark">
                        {product.name}
                      </CardTitle>
                    </div>
                    <p className="text-xs text-netapp-muted mt-1">
                      {product.tagline}
                    </p>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 space-y-2">
                    {/* Key Specs */}
                    <ul className="space-y-1">
                      {specs.map((spec, i) => (
                        <li
                          key={i}
                          className="text-xs text-netapp-dark flex items-center gap-1.5"
                        >
                          <span className="w-1 h-1 rounded-full bg-netapp-blue flex-shrink-0" />
                          {spec}
                        </li>
                      ))}
                    </ul>

                    {/* Best For Tags */}
                    <div>
                      <p className="text-[10px] text-netapp-muted uppercase tracking-wide mb-1">
                        Best for
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {product.best_for.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 bg-white/70"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {product.best_for.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 bg-white/70"
                          >
                            +{product.best_for.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Insert into chat hint */}
                    <div className="flex items-center gap-1 text-[10px] text-netapp-muted pt-1">
                      <MessageSquarePlus size={10} />
                      <span>Click to add as chat context</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
