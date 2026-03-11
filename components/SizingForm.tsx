"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Cpu, HardDrive, Network, Loader2 } from "lucide-react";
import type { SizingInput, SizingResult, WorkloadType } from "@/lib/afx-sizing";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const WORKLOAD_OPTIONS: WorkloadType[] = [
  "VDI",
  "Databases",
  "VMware",
  "AI/ML",
  "File Services",
  "EDA",
  "Analytics",
  "Mixed",
];

const PROTOCOL_OPTIONS = [
  "NFS",
  "SMB",
  "iSCSI",
  "FC",
  "NVMe/FC",
  "NVMe/TCP",
  "S3",
];

export default function SizingForm() {
  const [formData, setFormData] = useState<SizingInput>({
    workloadType: "Mixed",
    capacityTB: 100,
    iopsRequired: 200000,
    throughputGBs: 5,
    protocolType: "NFS",
    growthPercent: 20,
    haRequired: true,
  });

  const [result, setResult] = useState<SizingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/size", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Sizing failed");
      const data = await response.json();
      setResult(data);
    } catch {
      console.error("Sizing error");
    } finally {
      setIsLoading(false);
    }
  }

  const projectionData = result
    ? [
        { name: "Year 1", capacity: result.projections.year1CapacityTB },
        { name: "Year 2", capacity: result.projections.year2CapacityTB },
        { name: "Year 3", capacity: result.projections.year3CapacityTB },
        {
          name: "Provisioned",
          capacity: Math.round(result.storageShelves.effectiveCapacityTB),
        },
      ]
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <Card className="border-netapp-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-netapp-dark">
            <Calculator size={20} className="text-netapp-blue" />
            Sizing Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-netapp-dark mb-1">
                Workload Type
              </label>
              <select
                value={formData.workloadType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    workloadType: e.target.value as WorkloadType,
                  })
                }
                className="w-full rounded-md border border-netapp-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-netapp-blue"
              >
                {WORKLOAD_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-netapp-dark mb-1">
                  Capacity (TB)
                </label>
                <Input
                  type="number"
                  value={formData.capacityTB}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacityTB: Number(e.target.value),
                    })
                  }
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-netapp-dark mb-1">
                  IOPS Required
                </label>
                <Input
                  type="number"
                  value={formData.iopsRequired}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      iopsRequired: Number(e.target.value),
                    })
                  }
                  min={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-netapp-dark mb-1">
                  Throughput (GB/s)
                </label>
                <Input
                  type="number"
                  value={formData.throughputGBs}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      throughputGBs: Number(e.target.value),
                    })
                  }
                  min={0}
                  step={0.1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-netapp-dark mb-1">
                  Growth Rate (% / year)
                </label>
                <Input
                  type="number"
                  value={formData.growthPercent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      growthPercent: Number(e.target.value),
                    })
                  }
                  min={0}
                  max={100}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-netapp-dark mb-1">
                Protocol
              </label>
              <select
                value={formData.protocolType}
                onChange={(e) =>
                  setFormData({ ...formData, protocolType: e.target.value })
                }
                className="w-full rounded-md border border-netapp-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-netapp-blue"
              >
                {PROTOCOL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ha"
                checked={formData.haRequired}
                onChange={(e) =>
                  setFormData({ ...formData, haRequired: e.target.checked })
                }
                className="rounded border-netapp-border"
              />
              <label htmlFor="ha" className="text-sm text-netapp-dark">
                High Availability Required
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-netapp-blue hover:bg-netapp-blue/90 transition-all duration-150 ease-in-out"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator size={16} className="mr-2" />
                  Calculate Sizing
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {result ? (
          <>
            <Card className="border-netapp-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-netapp-dark text-base">
                    Recommended Configuration
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="border-netapp-blue text-netapp-blue"
                  >
                    {result.costTier}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Compute */}
                <div className="flex items-start gap-3 p-3 bg-netapp-surface rounded-lg">
                  <Cpu size={20} className="text-netapp-blue mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-netapp-dark">
                      {result.computeNodes.count}x {result.computeNodes.model} ({result.computeNodes.type})
                    </p>
                    <p className="text-xs text-netapp-muted">
                      {result.computeNodes.totalCores} cores | {result.computeNodes.totalRAMGB}GB RAM
                    </p>
                  </div>
                </div>

                {/* Storage */}
                <div className="flex items-start gap-3 p-3 bg-netapp-surface rounded-lg">
                  <HardDrive size={20} className="text-netapp-blue mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-netapp-dark">
                      {result.storageShelves.count}x {result.storageShelves.model} ({result.storageShelves.type})
                    </p>
                    <p className="text-xs text-netapp-muted">
                      {Math.round(result.storageShelves.effectiveCapacityTB)}TB effective capacity
                    </p>
                  </div>
                </div>

                {/* Network */}
                <div className="flex items-start gap-3 p-3 bg-netapp-surface rounded-lg">
                  <Network size={20} className="text-netapp-blue mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-netapp-dark">
                      {result.network.fabricType}
                    </p>
                    <p className="text-xs text-netapp-muted">
                      {result.network.portsRequired} ports | {result.network.bandwidthGbps}Gbps aggregate
                    </p>
                  </div>
                </div>

                {/* Performance */}
                <div className="border-t border-netapp-border pt-3 mt-3">
                  <p className="text-sm font-medium text-netapp-dark mb-2">
                    Performance Estimates
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-netapp-blue">
                        {(result.performance.estimatedIOPS / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-netapp-muted">IOPS</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-netapp-blue">
                        {result.performance.estimatedThroughputGBs.toFixed(1)}
                      </p>
                      <p className="text-xs text-netapp-muted">GB/s</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-netapp-blue">
                        {result.performance.latencyMs}
                      </p>
                      <p className="text-xs text-netapp-muted">Latency</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Capacity Projection Chart */}
            <Card className="border-netapp-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-netapp-dark text-base">
                  Capacity Projection (3-Year)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#D0D7DE" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar
                      dataKey="capacity"
                      fill="#0068B5"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-netapp-muted mt-2 text-center">
                  {result.projections.headroomPercent}% headroom at end of Year 3
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-netapp-border h-full flex items-center justify-center min-h-[400px]">
            <div className="text-center text-netapp-muted">
              <Calculator size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Configure parameters and click</p>
              <p className="text-sm">&quot;Calculate Sizing&quot; to see results</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
