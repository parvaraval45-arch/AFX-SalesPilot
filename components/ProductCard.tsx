"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Zap, Globe } from "lucide-react";
import type { Product } from "@/lib/netapp-products";

interface ProductCardProps {
  product: Product;
}

const categoryColors: Record<string, string> = {
  "All-Flash": "bg-blue-100 text-blue-800",
  Hybrid: "bg-purple-100 text-purple-800",
  "Object Storage": "bg-green-100 text-green-800",
  Cloud: "bg-sky-100 text-sky-800",
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="border-netapp-border hover:shadow-md transition-all duration-150 ease-in-out">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base text-netapp-dark">
            {product.name}
          </CardTitle>
          <Badge
            variant="secondary"
            className={categoryColors[product.category] || "bg-gray-100 text-gray-800"}
          >
            {product.category}
          </Badge>
        </div>
        <p className="text-sm text-netapp-muted">{product.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Key Specs */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-1.5">
            <HardDrive size={14} className="text-netapp-blue" />
            <div>
              <p className="text-xs text-netapp-muted">Capacity</p>
              <p className="text-sm font-medium text-netapp-dark">
                {product.specs.maxCapacityTB >= 1000
                  ? `${(product.specs.maxCapacityTB / 1000).toFixed(1)}PB`
                  : `${product.specs.maxCapacityTB}TB`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-netapp-accent" />
            <div>
              <p className="text-xs text-netapp-muted">IOPS</p>
              <p className="text-sm font-medium text-netapp-dark">
                {product.specs.maxIOPS >= 1000000
                  ? `${(product.specs.maxIOPS / 1000000).toFixed(1)}M`
                  : `${(product.specs.maxIOPS / 1000).toFixed(0)}K`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe size={14} className="text-netapp-muted" />
            <div>
              <p className="text-xs text-netapp-muted">Throughput</p>
              <p className="text-sm font-medium text-netapp-dark">
                {product.specs.maxThroughputGBs}GB/s
              </p>
            </div>
          </div>
        </div>

        {/* Protocols */}
        <div>
          <p className="text-xs text-netapp-muted mb-1">Protocols</p>
          <div className="flex flex-wrap gap-1">
            {product.specs.protocols.map((protocol) => (
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

        {/* Use Cases */}
        <div>
          <p className="text-xs text-netapp-muted mb-1">Use Cases</p>
          <div className="flex flex-wrap gap-1">
            {product.useCases.map((useCase) => (
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
