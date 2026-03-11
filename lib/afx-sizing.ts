export interface SizingInput {
  workloadType: WorkloadType;
  capacityTB: number;
  iopsRequired: number;
  throughputGBs: number;
  protocolType: string;
  growthPercent: number;
  haRequired: boolean;
}

export type WorkloadType =
  | "VDI"
  | "Databases"
  | "VMware"
  | "AI/ML"
  | "File Services"
  | "EDA"
  | "Analytics"
  | "Mixed";

export interface SizingResult {
  computeNodes: {
    model: string;
    type: string;
    count: number;
    totalCores: number;
    totalRAMGB: number;
  };
  storageShelves: {
    model: string;
    type: string;
    count: number;
    rawCapacityTB: number;
    effectiveCapacityTB: number;
  };
  network: {
    fabricType: string;
    portsRequired: number;
    bandwidthGbps: number;
  };
  performance: {
    estimatedIOPS: number;
    estimatedThroughputGBs: number;
    latencyMs: string;
  };
  costTier: "Standard" | "Performance" | "Premium" | "Enterprise";
  summary: string;
  projections: {
    year1CapacityTB: number;
    year2CapacityTB: number;
    year3CapacityTB: number;
    headroomPercent: number;
  };
}

interface WorkloadProfile {
  dataReductionRatio: number;
  iopsPerComputeNode: number;
  preferredShelf: "AFX-SS1" | "AFX-SS2" | "AFX-SS3";
  preferredCompute: "AFX-CN1" | "AFX-CN2" | "AFX-CN3";
  latencyTarget: string;
}

const WORKLOAD_PROFILES: Record<WorkloadType, WorkloadProfile> = {
  VDI: {
    dataReductionRatio: 3.0,
    iopsPerComputeNode: 150000,
    preferredShelf: "AFX-SS2",
    preferredCompute: "AFX-CN1",
    latencyTarget: "<1ms",
  },
  Databases: {
    dataReductionRatio: 2.0,
    iopsPerComputeNode: 200000,
    preferredShelf: "AFX-SS1",
    preferredCompute: "AFX-CN2",
    latencyTarget: "<0.5ms",
  },
  VMware: {
    dataReductionRatio: 2.5,
    iopsPerComputeNode: 120000,
    preferredShelf: "AFX-SS2",
    preferredCompute: "AFX-CN1",
    latencyTarget: "<1ms",
  },
  "AI/ML": {
    dataReductionRatio: 1.5,
    iopsPerComputeNode: 250000,
    preferredShelf: "AFX-SS1",
    preferredCompute: "AFX-CN2",
    latencyTarget: "<0.3ms",
  },
  "File Services": {
    dataReductionRatio: 2.0,
    iopsPerComputeNode: 80000,
    preferredShelf: "AFX-SS3",
    preferredCompute: "AFX-CN3",
    latencyTarget: "<2ms",
  },
  EDA: {
    dataReductionRatio: 1.3,
    iopsPerComputeNode: 200000,
    preferredShelf: "AFX-SS1",
    preferredCompute: "AFX-CN2",
    latencyTarget: "<0.5ms",
  },
  Analytics: {
    dataReductionRatio: 2.5,
    iopsPerComputeNode: 180000,
    preferredShelf: "AFX-SS2",
    preferredCompute: "AFX-CN2",
    latencyTarget: "<1ms",
  },
  Mixed: {
    dataReductionRatio: 2.0,
    iopsPerComputeNode: 130000,
    preferredShelf: "AFX-SS2",
    preferredCompute: "AFX-CN1",
    latencyTarget: "<1ms",
  },
};

const SHELF_SPECS = {
  "AFX-SS1": { rawTB: 92.16, effectiveTB: 184.32, iops: 500000, throughput: 12.0 },
  "AFX-SS2": { rawTB: 184.32, effectiveTB: 368.64, iops: 400000, throughput: 10.0 },
  "AFX-SS3": { rawTB: 368.64, effectiveTB: 737.28, iops: 200000, throughput: 8.0 },
};

const COMPUTE_SPECS = {
  "AFX-CN1": { cores: 32, ramGB: 256, ports: 4 },
  "AFX-CN2": { cores: 64, ramGB: 512, ports: 8 },
  "AFX-CN3": { cores: 16, ramGB: 128, ports: 2 },
};

export function calculateSizing(input: SizingInput): SizingResult {
  const profile = WORKLOAD_PROFILES[input.workloadType];

  // Calculate capacity with growth projection (3-year)
  const growthMultiplier = Math.pow(1 + input.growthPercent / 100, 3);
  const projectedCapacityTB = input.capacityTB * growthMultiplier;
  const rawCapacityNeeded = projectedCapacityTB / profile.dataReductionRatio;

  // Determine storage shelves
  const shelfSpec = SHELF_SPECS[profile.preferredShelf];
  const shelvesForCapacity = Math.ceil(rawCapacityNeeded / shelfSpec.rawTB);
  const shelvesForIOPS = Math.ceil(input.iopsRequired / shelfSpec.iops);
  const shelvesForThroughput = Math.ceil(input.throughputGBs / shelfSpec.throughput);
  const shelfCount = Math.max(shelvesForCapacity, shelvesForIOPS, shelvesForThroughput, 1);

  // Determine compute nodes
  const computeSpec = COMPUTE_SPECS[profile.preferredCompute];
  const computeForIOPS = Math.ceil(input.iopsRequired / profile.iopsPerComputeNode);
  let computeCount = Math.max(computeForIOPS, 2); // minimum 2 for HA
  if (input.haRequired) {
    computeCount = Math.max(computeCount, 2);
    // Ensure even number for HA pairs
    if (computeCount % 2 !== 0) computeCount++;
  }

  // Network calculation
  const totalPorts = computeCount * computeSpec.ports;
  const bandwidthGbps = totalPorts * 100;

  // Performance estimates
  const estimatedIOPS = Math.min(shelfCount * shelfSpec.iops, computeCount * profile.iopsPerComputeNode);
  const estimatedThroughput = shelfCount * shelfSpec.throughput;

  // Cost tier
  let costTier: SizingResult["costTier"] = "Standard";
  if (computeCount >= 8 || shelfCount >= 12) costTier = "Enterprise";
  else if (computeCount >= 4 || shelfCount >= 6) costTier = "Premium";
  else if (profile.preferredCompute === "AFX-CN2") costTier = "Performance";

  // Growth projections
  const year1Capacity = input.capacityTB;
  const year2Capacity = input.capacityTB * (1 + input.growthPercent / 100);
  const year3Capacity = projectedCapacityTB;
  const totalEffectiveCapacity = shelfCount * shelfSpec.effectiveTB;
  const headroom = ((totalEffectiveCapacity - projectedCapacityTB) / totalEffectiveCapacity) * 100;

  const result: SizingResult = {
    computeNodes: {
      model: profile.preferredCompute,
      type: profile.preferredCompute === "AFX-CN1" ? "Standard" : profile.preferredCompute === "AFX-CN2" ? "Performance" : "Capacity-Optimized",
      count: computeCount,
      totalCores: computeCount * computeSpec.cores,
      totalRAMGB: computeCount * computeSpec.ramGB,
    },
    storageShelves: {
      model: profile.preferredShelf,
      type: profile.preferredShelf === "AFX-SS1" ? "Performance NVMe" : profile.preferredShelf === "AFX-SS2" ? "Balanced NVMe" : "Capacity NVMe",
      count: shelfCount,
      rawCapacityTB: shelfCount * shelfSpec.rawTB,
      effectiveCapacityTB: totalEffectiveCapacity,
    },
    network: {
      fabricType: "100GbE Ethernet",
      portsRequired: totalPorts,
      bandwidthGbps,
    },
    performance: {
      estimatedIOPS,
      estimatedThroughputGBs: estimatedThroughput,
      latencyMs: profile.latencyTarget,
    },
    costTier,
    summary: "",
    projections: {
      year1CapacityTB: Math.round(year1Capacity * 10) / 10,
      year2CapacityTB: Math.round(year2Capacity * 10) / 10,
      year3CapacityTB: Math.round(year3Capacity * 10) / 10,
      headroomPercent: Math.round(headroom * 10) / 10,
    },
  };

  result.summary = generateSizingSummary(result, input);
  return result;
}

function generateSizingSummary(result: SizingResult, input: SizingInput): string {
  return `Recommended AFX Configuration for ${input.workloadType}:
• ${result.computeNodes.count}x ${result.computeNodes.model} (${result.computeNodes.type}) compute nodes — ${result.computeNodes.totalCores} cores, ${result.computeNodes.totalRAMGB}GB RAM
• ${result.storageShelves.count}x ${result.storageShelves.model} (${result.storageShelves.type}) storage shelves — ${Math.round(result.storageShelves.effectiveCapacityTB)}TB effective capacity
• ${result.network.fabricType} fabric with ${result.network.portsRequired} ports (${result.network.bandwidthGbps}Gbps aggregate)
• Estimated performance: ${(result.performance.estimatedIOPS / 1000).toFixed(0)}K IOPS, ${result.performance.estimatedThroughputGBs.toFixed(1)}GB/s throughput, ${result.performance.latencyMs} latency
• 3-year capacity headroom: ${result.projections.headroomPercent}%
• Cost tier: ${result.costTier}`;
}
