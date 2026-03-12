"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Globe } from "lucide-react";
import type { Product } from "@/lib/netapp-products";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card
      className="border-netapp-border hover:shadow-md transition-all duration-150 ease-in-out cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base text-netapp-dark">
            {product.name}
          </CardTitle>
        </div>
        <p className="text-sm text-netapp-muted">{product.tagline}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Key Specs */}
        <div className="grid grid-cols-2 gap-2">
          {product.max_throughput_gbs && (
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-netapp-accent" />
              <div>
                <p className="text-xs text-netapp-muted">Throughput</p>
                <p className="text-sm font-medium text-netapp-dark">
                  {product.max_throughput_gbs >= 1000
                    ? `${(product.max_throughput_gbs / 1000).toFixed(0)} TB/s`
                    : `${product.max_throughput_gbs} GB/s`}
                </p>
              </div>
            </div>
          )}
          {product.max_nodes && (
            <div className="flex items-center gap-1.5">
              <Globe size={14} className="text-netapp-muted" />
              <div>
                <p className="text-xs text-netapp-muted">Max Nodes</p>
                <p className="text-sm font-medium text-netapp-dark">
                  {product.max_nodes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Protocols */}
        <div>
          <p className="text-xs text-netapp-muted mb-1">Protocols</p>
          <div className="flex flex-wrap gap-1">
            {product.protocols.map((protocol) => (
              <Badge
                key={protocol}
                variant="outline"
                className="text-xs border-netapp-border"
              >
                {protocol}
              </Badge>
            ))}
          </div>
        </div>

        {/* Best For */}
        <div>
          <p className="text-xs text-netapp-muted mb-1">Best For</p>
          <div className="flex flex-wrap gap-1">
            {product.best_for.map((useCase) => (
              <span
                key={useCase}
                className="text-xs bg-netapp-surface text-netapp-dark px-2 py-0.5 rounded"
              >
                {useCase}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
