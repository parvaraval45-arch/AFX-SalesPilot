"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ChatInterface from "@/components/ChatInterface";
import {
  Calculator,
  Server,
  HardDrive,
  Cpu,
  AlertTriangle,
  FileText,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import type {
  SizingInputs,
  AFXConfiguration,
  WorkloadType,
  KeystoneEstimate,
  AFXComparison,
} from "@/lib/afx-sizing";

type Step = 1 | 2 | 3;

const WORKLOAD_OPTIONS: { value: WorkloadType; label: string }[] = [
  { value: "AI_training", label: "AI Training" },
  { value: "AI_inference", label: "AI Inference" },
  { value: "HPC_EDA", label: "HPC / EDA" },
  { value: "media_rendering", label: "Media Rendering" },
  { value: "general_nas", label: "General NAS" },
  { value: "mixed", label: "Mixed" },
];

const AIDE_OPTIONS = [
  { id: "metadata", label: "Metadata indexing" },
  { id: "guardrails", label: "Data Guardrails" },
  { id: "vectorization", label: "Vectorization / semantic search" },
];

interface SizingResult {
  config: AFXConfiguration;
  narrative: string;
  comparison: AFXComparison[];
  keystone_estimate: KeystoneEstimate | null;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function formatTB(tb: number): string {
  if (tb >= 1000) return `${(tb / 1000).toFixed(1)} PB`;
  return `${Math.round(tb)} TB`;
}

export default function AFXSizerPage() {
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SizingResult | null>(null);

  const [formData, setFormData] = useState<SizingInputs>({
    workloadType: "AI_training",
    rawCapacityTB: 500,
    peakThroughputGBs: 200,
    gpuNodeCount: 0,
    aideFeatures: [],
    deploymentModel: "both",
  });

  const handleCalculate = useCallback(async () => {
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
      setStep(2);
    } catch {
      // stay on step 1
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const handleReconfigure = () => {
    setStep(1);
    setResult(null);
  };

  const toggleAideFeature = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      aideFeatures: prev.aideFeatures.includes(id)
        ? prev.aideFeatures.filter((f) => f !== id)
        : [...prev.aideFeatures, id],
    }));
  };

  const chatContext = result
    ? `The user has sized an AFX cluster: ${result.config.controllers}x AFX 1K controllers, ${result.config.enclosures}x NX224 enclosures (${result.config.drive_size_tb}TB drives), ${result.config.dx50_nodes}x DX50 nodes. Workload: ${formData.workloadType}. Raw: ${result.config.raw_tb}TB, Effective: ${result.config.effective_tb}TB, Throughput: ${result.config.peak_throughput_gbs} GB/s. Help them refine the config.`
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-netapp-dark">AFX Sizer</h1>
        <p className="text-netapp-muted text-sm mt-1">
          AI-guided sizing for NetApp AFX disaggregated storage
        </p>
      </div>

      {/* Disclaimer Banner */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-800">
          Configuration estimates are for planning purposes only. Contact your
          NetApp SE for validated sizing via SPM.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: "Workload Profile" },
          { n: 2, label: "AI Refinement" },
          { n: 3, label: "Configuration" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                step >= s.n
                  ? "bg-netapp-blue text-white"
                  : "bg-gray-100 text-netapp-muted"
              }`}
            >
              {step > s.n ? (
                <CheckCircle2 size={12} />
              ) : (
                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                  {s.n}
                </span>
              )}
              {s.label}
            </div>
            {i < 2 && (
              <div
                className={`w-8 h-px ${
                  step > s.n ? "bg-netapp-blue" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepOne
            key="step1"
            formData={formData}
            setFormData={setFormData}
            onCalculate={handleCalculate}
            isLoading={isLoading}
            toggleAideFeature={toggleAideFeature}
          />
        )}
        {step === 2 && result && (
          <StepTwo
            key="step2"
            result={result}
            chatContext={chatContext}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && result && (
          <StepThree
            key="step3"
            result={result}
            formData={formData}
            onReconfigure={handleReconfigure}
            onBack={() => setStep(2)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Step 1: Workload Profile ─── */

function StepOne({
  formData,
  setFormData,
  onCalculate,
  isLoading,
  toggleAideFeature,
}: {
  formData: SizingInputs;
  setFormData: React.Dispatch<React.SetStateAction<SizingInputs>>;
  onCalculate: () => void;
  isLoading: boolean;
  toggleAideFeature: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-netapp-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-netapp-dark">
            <Calculator size={20} className="text-netapp-blue" />
            Workload Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Row 1: Workload Type */}
          <div>
            <label className="block text-sm font-medium text-netapp-dark mb-1.5">
              Workload Type
            </label>
            <select
              value={formData.workloadType}
              onChange={(e) =>
                setFormData({ ...formData, workloadType: e.target.value as WorkloadType })
              }
              className="w-full rounded-md border border-netapp-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-netapp-blue"
            >
              {WORKLOAD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Row 2: Capacity + Throughput sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-netapp-dark mb-1.5">
                Raw Capacity Needed:{" "}
                <span className="text-netapp-blue font-bold">
                  {formatTB(formData.rawCapacityTB)}
                </span>
              </label>
              <input
                type="range"
                min={10}
                max={10000}
                step={10}
                value={formData.rawCapacityTB}
                onChange={(e) =>
                  setFormData({ ...formData, rawCapacityTB: Number(e.target.value) })
                }
                className="w-full accent-netapp-blue"
              />
              <div className="flex justify-between text-[10px] text-netapp-muted mt-1">
                <span>10 TB</span>
                <span>10,000 TB</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-netapp-dark mb-1.5">
                Peak Throughput Needed:{" "}
                <span className="text-netapp-blue font-bold">
                  {formData.peakThroughputGBs >= 1000
                    ? `${(formData.peakThroughputGBs / 1000).toFixed(1)} TB/s`
                    : `${formData.peakThroughputGBs} GB/s`}
                </span>
              </label>
              <input
                type="range"
                min={10}
                max={4000}
                step={10}
                value={formData.peakThroughputGBs}
                onChange={(e) =>
                  setFormData({ ...formData, peakThroughputGBs: Number(e.target.value) })
                }
                className="w-full accent-netapp-blue"
              />
              <div className="flex justify-between text-[10px] text-netapp-muted mt-1">
                <span>10 GB/s</span>
                <span>4,000 GB/s</span>
              </div>
            </div>
          </div>

          {/* Row 3: GPU nodes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-netapp-dark mb-1.5">
                GPU Node Count (DX50)
              </label>
              <Input
                type="number"
                min={0}
                max={10}
                value={formData.gpuNodeCount}
                onChange={(e) =>
                  setFormData({ ...formData, gpuNodeCount: Number(e.target.value) })
                }
              />
              <p className="text-[10px] text-netapp-muted mt-1">
                DX50: AMD Genoa 64-core, 1TB RAM, NVIDIA L4 (max 10)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-netapp-dark mb-1.5">
                Deployment Model
              </label>
              <div className="space-y-2">
                {[
                  { value: "capex", label: "CapEx Purchase" },
                  { value: "keystone", label: "Keystone STaaS" },
                  { value: "both", label: "Evaluate Both" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="deploymentModel"
                      value={opt.value}
                      checked={formData.deploymentModel === opt.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deploymentModel: e.target.value as SizingInputs["deploymentModel"],
                        })
                      }
                      className="accent-netapp-blue"
                    />
                    <span className="text-sm text-netapp-dark">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: AIDE Features */}
          <div>
            <label className="block text-sm font-medium text-netapp-dark mb-1.5">
              AIDE Features Needed
            </label>
            <div className="flex flex-wrap gap-3">
              {AIDE_OPTIONS.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.aideFeatures.includes(opt.id)}
                    onChange={() => toggleAideFeature(opt.id)}
                    className="rounded border-netapp-border accent-netapp-blue"
                  />
                  <span className="text-sm text-netapp-dark">{opt.label}</span>
                </label>
              ))}
            </div>
            <p className="text-[10px] text-netapp-muted mt-1">
              AIDE features require DX50 compute nodes (GA Q4 FY2026)
            </p>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={onCalculate}
            disabled={isLoading}
            className="w-full bg-netapp-blue hover:bg-netapp-blue/90 transition-all duration-150"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator size={16} className="mr-2" />
                Calculate AFX Configuration
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Step 2: AI Refinement ─── */

function StepTwo({
  result,
  chatContext,
  onNext,
  onBack,
}: {
  result: SizingResult;
  chatContext: string | undefined;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Baseline Config Summary */}
      <Card className="border-netapp-border bg-netapp-surface">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-netapp-blue mt-0.5 flex-shrink-0" />
            <div className="text-sm text-netapp-dark">
              <p className="font-medium mb-1">Baseline Configuration Calculated</p>
              <p className="text-xs text-netapp-muted">
                {result.config.controllers}x AFX 1K Controllers |{" "}
                {result.config.enclosures}x NX224 Enclosures ({result.config.drive_size_tb}TB) |{" "}
                {result.config.dx50_nodes}x DX50 Nodes |{" "}
                {formatTB(result.config.effective_tb)} effective |{" "}
                {result.config.peak_throughput_gbs} GB/s
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Refinement */}
      <div className="h-[400px]">
        <ChatInterface
          context={chatContext}
          placeholder="Tell me about your data growth, dedup ratios, latency requirements..."
          starterPrompts={[
            "We expect 40% YoY data growth",
            "We need GPUDirect Storage support",
            "Compare with AFF A1K for this workload",
            "What AIDE features should we add?",
          ]}
          className="h-full"
        />
      </div>

      {/* Nav Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="border-netapp-border">
          <ArrowLeft size={14} className="mr-1" />
          Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-netapp-blue hover:bg-netapp-blue/90"
        >
          View Configuration
          <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}

/* ─── Step 3: Configuration Output ─── */

function StepThree({
  result,
  onReconfigure,
  onBack,
}: {
  result: SizingResult;
  formData: SizingInputs;
  onReconfigure: () => void;
  onBack: () => void;
}) {
  const { config, narrative, comparison, keystone_estimate } = result;

  const comparisonData = comparison.map((c) => ({
    name: c.metric,
    AFX: typeof c.afx === "number" ? c.afx : parseFloat(c.afx as string) || 0,
    "AFF A1K": typeof c.aff_a1k === "number" ? c.aff_a1k : parseFloat(c.aff_a1k as string) || 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Bill of Materials */}
      <Card className="border-netapp-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-netapp-dark">
            <Server size={20} className="text-netapp-blue" />
            AFX Cluster Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Components */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <Server size={18} className="text-netapp-blue" />
              <div className="flex-1">
                <p className="text-sm font-medium text-netapp-dark">
                  {config.controllers}x AFX 1K Controllers
                </p>
                <p className="text-xs text-netapp-muted">
                  2U, PCIe Gen 5, 400G Ethernet, HA pairs
                </p>
              </div>
              <Badge className="bg-netapp-blue text-white">Controller</Badge>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
              <HardDrive size={18} className="text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-netapp-dark">
                  {config.enclosures}x NX224 Enclosures ({config.drive_size_tb}TB NVMe)
                </p>
                <p className="text-xs text-netapp-muted">
                  {config.enclosures * 24} drives total | {formatTB(config.raw_tb)} raw
                </p>
              </div>
              <Badge className="bg-purple-600 text-white">Storage</Badge>
            </div>

            {config.dx50_nodes > 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <Cpu size={18} className="text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-netapp-dark">
                    {config.dx50_nodes}x DX50 Compute Nodes
                  </p>
                  <p className="text-xs text-netapp-muted">
                    AMD Genoa 64-core, 1TB RAM, NVIDIA L4
                  </p>
                </div>
                <Badge className="bg-green-600 text-white">Compute</Badge>
              </div>
            )}
          </div>

          {/* Performance Summary */}
          <div className="border-t border-netapp-border pt-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-netapp-blue">
                  {config.peak_throughput_gbs >= 1000
                    ? `${(config.peak_throughput_gbs / 1000).toFixed(1)} TB/s`
                    : `${config.peak_throughput_gbs} GB/s`}
                </p>
                <p className="text-xs text-netapp-muted">Peak Throughput</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-netapp-blue">
                  {formatTB(config.effective_tb)}
                </p>
                <p className="text-xs text-netapp-muted">Effective Capacity</p>
              </div>
              {keystone_estimate && (
                <div className="text-center">
                  <p className="text-xl font-bold text-netapp-blue">
                    {formatCurrency(keystone_estimate.totalMonthly.low)}&ndash;
                    {formatCurrency(keystone_estimate.totalMonthly.high)}
                  </p>
                  <p className="text-xs text-netapp-muted">Keystone Est/month</p>
                </div>
              )}
            </div>
          </div>

          {/* Warnings */}
          {config.warnings.length > 0 && (
            <div className="space-y-1">
              {config.warnings.map((w, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 rounded px-3 py-2"
                >
                  <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                  {w}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Keystone Breakdown */}
      {keystone_estimate && (
        <Card className="border-netapp-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-netapp-dark text-base">
              Keystone STaaS Estimate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="p-3 bg-netapp-surface rounded-lg text-center">
                <p className="text-sm font-bold text-netapp-dark">
                  {formatCurrency(keystone_estimate.performanceTierMonthly.low)}&ndash;
                  {formatCurrency(keystone_estimate.performanceTierMonthly.high)}
                </p>
                <p className="text-[10px] text-netapp-muted">Performance Tier / mo</p>
              </div>
              {config.dx50_nodes > 0 && (
                <div className="p-3 bg-netapp-surface rounded-lg text-center">
                  <p className="text-sm font-bold text-netapp-dark">
                    {formatCurrency(keystone_estimate.computeMonthly.low)}&ndash;
                    {formatCurrency(keystone_estimate.computeMonthly.high)}
                  </p>
                  <p className="text-[10px] text-netapp-muted">Compute (DX50) / mo</p>
                </div>
              )}
              <div className="p-3 bg-netapp-surface rounded-lg text-center">
                <p className="text-sm font-bold text-netapp-dark">
                  {formatCurrency(keystone_estimate.totalMonthly.low)}&ndash;
                  {formatCurrency(keystone_estimate.totalMonthly.high)}
                </p>
                <p className="text-[10px] text-netapp-muted">Total / mo</p>
              </div>
            </div>
            <p className="text-[10px] text-amber-700 bg-amber-50 rounded px-2 py-1">
              {keystone_estimate.disclaimer}
            </p>
          </CardContent>
        </Card>
      )}

      {/* AI Narrative */}
      {narrative && (
        <Card className="border-netapp-border">
          <CardContent className="p-4">
            <p className="text-sm text-netapp-dark leading-relaxed">{narrative}</p>
          </CardContent>
        </Card>
      )}

      {/* Comparison Chart */}
      <Card className="border-netapp-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-netapp-dark text-base">
            AFX vs AFF A1K Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={comparisonData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#D0D7DE" />
              <XAxis type="number" fontSize={11} />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                fontSize={11}
                tick={{ fill: "#6B7280" }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="AFX" fill="#0068B5" radius={[0, 4, 4, 0]} />
              <Bar dataKey="AFF A1K" fill="#00AAE4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="border-netapp-border">
          <ArrowLeft size={14} className="mr-1" />
          Back to Refinement
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onReconfigure}
            className="border-netapp-border"
          >
            <RefreshCw size={14} className="mr-1" />
            Reconfigure
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="border-netapp-border"
          >
            <FileText size={14} className="mr-1" />
            Export PDF
          </Button>
          <Button
            className="bg-netapp-blue hover:bg-netapp-blue/90"
            onClick={() => (window.location.href = "/proposal-generator")}
          >
            Start Proposal
            <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
