"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Building2,
  Package,
  Calculator,
  Swords,
  Download,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

type Step = "customer" | "products" | "sizing" | "positioning" | "preview";

const steps: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "customer", label: "Customer Info", icon: Building2 },
  { id: "products", label: "Products", icon: Package },
  { id: "sizing", label: "Sizing", icon: Calculator },
  { id: "positioning", label: "Positioning", icon: Swords },
  { id: "preview", label: "Preview", icon: FileText },
];

export default function ProposalGeneratorPage() {
  const [currentStep, setCurrentStep] = useState<Step>("customer");
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    industry: "",
    contactName: "",
    contactTitle: "",
    painPoints: "",
    selectedProducts: [] as string[],
    capacityTB: "",
    workloadType: "",
    primaryCompetitor: "",
    keyDifferentiators: "",
  });
  const [proposal, setProposal] = useState("");

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  function handleNext() {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  }

  function handleBack() {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  }

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Generate a professional sales proposal for the following opportunity:

Customer: ${formData.customerName} (${formData.industry})
Contact: ${formData.contactName}, ${formData.contactTitle}
Pain Points: ${formData.painPoints}
Recommended Products: ${formData.selectedProducts.join(", ") || "NetApp AFX"}
Capacity Requirement: ${formData.capacityTB || "TBD"}TB
Workload: ${formData.workloadType || "Mixed"}
Primary Competitor: ${formData.primaryCompetitor || "N/A"}
Key Differentiators: ${formData.keyDifferentiators || "NetApp unified data services, hybrid cloud integration"}

Format the proposal with sections: Executive Summary, Recommended Solution, Key Benefits, Why NetApp, and Next Steps. Keep it professional and concise.`,
            },
          ],
          context:
            "Generate a customer-facing sales proposal. Be professional, specific, and persuasive.",
        }),
      });

      if (!response.ok) throw new Error("Failed to generate");
      const data = await response.json();
      setProposal(data.content);
      setCurrentStep("preview");
    } catch {
      setProposal(
        "Unable to generate proposal. Please ensure your API key is configured and try again."
      );
      setCurrentStep("preview");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-netapp-dark">
          Proposal Generator
        </h1>
        <p className="text-netapp-muted mt-1">
          Create customer-facing proposals with AI assistance
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ease-in-out whitespace-nowrap ${
                currentStep === step.id
                  ? "bg-netapp-blue text-white"
                  : index < currentStepIndex
                  ? "bg-netapp-surface text-netapp-blue"
                  : "bg-netapp-surface text-netapp-muted"
              }`}
            >
              <step.icon size={16} />
              {step.label}
            </button>
            {index < steps.length - 1 && (
              <ChevronRight size={16} className="text-netapp-muted flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="border-netapp-border">
        <CardContent className="p-6">
          {currentStep === "customer" && (
            <div className="space-y-4 max-w-xl">
              <h3 className="font-semibold text-netapp-dark">
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-netapp-dark mb-1">
                    Company Name
                  </label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    placeholder="Acme Corporation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-netapp-dark mb-1">
                    Industry
                  </label>
                  <Input
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    placeholder="Financial Services"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-netapp-dark mb-1">
                    Contact Name
                  </label>
                  <Input
                    value={formData.contactName}
                    onChange={(e) =>
                      setFormData({ ...formData, contactName: e.target.value })
                    }
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-netapp-dark mb-1">
                    Title
                  </label>
                  <Input
                    value={formData.contactTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, contactTitle: e.target.value })
                    }
                    placeholder="VP of Infrastructure"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-netapp-dark mb-1">
                  Key Pain Points
                </label>
                <textarea
                  value={formData.painPoints}
                  onChange={(e) =>
                    setFormData({ ...formData, painPoints: e.target.value })
                  }
                  placeholder="Describe the customer's primary challenges..."
                  className="w-full rounded-md border border-netapp-border px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-netapp-blue"
                />
              </div>
            </div>
          )}

          {currentStep === "products" && (
            <div className="space-y-4 max-w-xl">
              <h3 className="font-semibold text-netapp-dark">
                Recommended Products
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "NetApp AFX",
                  "AFF A900",
                  "AFF A800",
                  "AFF A400",
                  "AFF C800",
                  "Cloud Volumes ONTAP",
                  "Azure NetApp Files",
                  "StorageGRID",
                ].map((product) => (
                  <Badge
                    key={product}
                    variant={
                      formData.selectedProducts.includes(product)
                        ? "default"
                        : "outline"
                    }
                    className={`cursor-pointer transition-all duration-150 ease-in-out ${
                      formData.selectedProducts.includes(product)
                        ? "bg-netapp-blue hover:bg-netapp-blue/90"
                        : "hover:bg-netapp-surface"
                    }`}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        selectedProducts: formData.selectedProducts.includes(product)
                          ? formData.selectedProducts.filter((p) => p !== product)
                          : [...formData.selectedProducts, product],
                      });
                    }}
                  >
                    {product}
                  </Badge>
                ))}
              </div>
              {formData.selectedProducts.length > 0 && (
                <p className="text-sm text-netapp-muted">
                  Selected: {formData.selectedProducts.join(", ")}
                </p>
              )}
            </div>
          )}

          {currentStep === "sizing" && (
            <div className="space-y-4 max-w-xl">
              <h3 className="font-semibold text-netapp-dark">
                Sizing Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-netapp-dark mb-1">
                    Capacity (TB)
                  </label>
                  <Input
                    value={formData.capacityTB}
                    onChange={(e) =>
                      setFormData({ ...formData, capacityTB: e.target.value })
                    }
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-netapp-dark mb-1">
                    Primary Workload
                  </label>
                  <Input
                    value={formData.workloadType}
                    onChange={(e) =>
                      setFormData({ ...formData, workloadType: e.target.value })
                    }
                    placeholder="Databases, AI/ML, VDI..."
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === "positioning" && (
            <div className="space-y-4 max-w-xl">
              <h3 className="font-semibold text-netapp-dark">
                Competitive Positioning
              </h3>
              <div>
                <label className="block text-sm font-medium text-netapp-dark mb-1">
                  Primary Competitor
                </label>
                <select
                  value={formData.primaryCompetitor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primaryCompetitor: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-netapp-border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-netapp-blue"
                >
                  <option value="">None / Unknown</option>
                  <option value="Pure Storage">Pure Storage</option>
                  <option value="Dell EMC">Dell EMC</option>
                  <option value="HPE">HPE</option>
                  <option value="VAST Data">VAST Data</option>
                  <option value="Weka">Weka</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-netapp-dark mb-1">
                  Key Differentiators to Highlight
                </label>
                <textarea
                  value={formData.keyDifferentiators}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      keyDifferentiators: e.target.value,
                    })
                  }
                  placeholder="Hybrid cloud integration, data efficiency, ONTAP data services..."
                  className="w-full rounded-md border border-netapp-border px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-netapp-blue"
                />
              </div>
            </div>
          )}

          {currentStep === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-netapp-dark">
                  Generated Proposal
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-netapp-blue border-netapp-blue"
                  disabled
                >
                  <Download size={14} className="mr-1" />
                  Export PDF
                </Button>
              </div>
              {proposal ? (
                <div className="bg-white border border-netapp-border rounded-lg p-6 prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-netapp-dark">
                    {proposal}
                  </pre>
                </div>
              ) : (
                <p className="text-netapp-muted text-sm">
                  Complete the previous steps and generate a proposal.
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t border-netapp-border">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="transition-all duration-150 ease-in-out"
            >
              Back
            </Button>
            <div className="flex gap-2">
              {currentStep === "positioning" && (
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-netapp-blue hover:bg-netapp-blue/90 transition-all duration-150 ease-in-out"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText size={16} className="mr-2" />
                      Generate Proposal
                    </>
                  )}
                </Button>
              )}
              {currentStep !== "preview" && currentStep !== "positioning" && (
                <Button
                  onClick={handleNext}
                  className="bg-netapp-blue hover:bg-netapp-blue/90 transition-all duration-150 ease-in-out"
                >
                  Next
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
