export type WorkloadType =
  | "AI_training"
  | "AI_inference"
  | "HPC_EDA"
  | "media_rendering"
  | "general_nas"
  | "mixed";

export interface SizingInputs {
  workloadType: WorkloadType;
  rawCapacityTB: number;
  peakThroughputGBs: number;
  gpuNodeCount: number;
  aideFeatures: string[];
  deploymentModel: "capex" | "keystone" | "both";
}

export interface KeystoneEstimate {
  performanceTierMonthly: { low: number; high: number };
  capacityTierMonthly: { low: number; high: number };
  computeMonthly: { low: number; high: number };
  totalMonthly: { low: number; high: number };
  disclaimer: string;
}

export interface AFXComparison {
  metric: string;
  afx: string | number;
  aff_a1k: string | number;
}

export interface AFXConfiguration {
  controllers: number;
  enclosures: number;
  dx50_nodes: number;
  drive_size_tb: number;
  raw_tb: number;
  effective_tb: number;
  peak_throughput_gbs: number;
  keystone_estimate: KeystoneEstimate | null;
  dedup_ratio: number;
  compress_ratio: number;
  warnings: string[];
  comparison: AFXComparison[];
}

const OVERHEAD = 0.15;

const DEDUP_RATIOS: Record<string, number> = {
  AI_training: 1.2,
  AI_inference: 1.2,
  HPC_EDA: 1.5,
  media_rendering: 1.1,
  general_nas: 2.0,
  mixed: 1.4,
};

const COMPRESS_RATIOS: Record<string, number> = {
  AI_training: 1.3,
  AI_inference: 1.3,
  HPC_EDA: 1.8,
  media_rendering: 1.0,
  general_nas: 1.5,
  mixed: 1.4,
};

const DRIVE_OPTIONS_TB = [7.6, 15.3, 30.6, 60];
const DRIVES_PER_ENCLOSURE = 24;
const THROUGHPUT_PER_PAIR_GBS = 62.5;
const MAX_CONTROLLERS = 128;
const MAX_ENCLOSURES = 52;
const MAX_DX50 = 10;

function selectDriveSize(rawCapacityTB: number): number {
  // Pick the smallest drive that keeps enclosure count within limits
  for (const drive of DRIVE_OPTIONS_TB) {
    const enclosures = Math.ceil(rawCapacityTB / (DRIVES_PER_ENCLOSURE * drive));
    if (enclosures <= MAX_ENCLOSURES) return drive;
  }
  return DRIVE_OPTIONS_TB[DRIVE_OPTIONS_TB.length - 1];
}

export function calculateAFX(inputs: SizingInputs): AFXConfiguration {
  const warnings: string[] = [];

  const dedupRatio = DEDUP_RATIOS[inputs.workloadType] || 1.4;
  const compressRatio = COMPRESS_RATIOS[inputs.workloadType] || 1.4;

  // Capacity sizing: effective = raw / (1 - overhead) * dedup * compress
  const rawNeeded = inputs.rawCapacityTB / (1 - OVERHEAD);
  // Performance: each controller pair = 62.5 GB/s, single controller = 31.25 GB/s
  let controllersNeeded = Math.ceil(inputs.peakThroughputGBs / 31.25);
  // Must be even (HA pairs), minimum 2
  if (controllersNeeded < 2) controllersNeeded = 2;
  if (controllersNeeded % 2 !== 0) controllersNeeded++;

  // Select drive size and calculate enclosures
  const driveSize = selectDriveSize(rawNeeded);
  let enclosuresNeeded = Math.ceil(rawNeeded / (DRIVES_PER_ENCLOSURE * driveSize));
  if (enclosuresNeeded < 1) enclosuresNeeded = 1;

  // DX50 nodes: needed for AI inference or AIDE features
  const needsAIDE = inputs.aideFeatures.length > 0;
  const needsInference = inputs.workloadType === "AI_inference";
  let dx50Nodes = inputs.gpuNodeCount;
  if ((needsAIDE || needsInference) && dx50Nodes === 0) {
    dx50Nodes = needsAIDE ? Math.max(1, Math.ceil(inputs.aideFeatures.length / 2)) : 1;
  }

  // Validate limits
  if (controllersNeeded > MAX_CONTROLLERS) {
    warnings.push(`Controller count (${controllersNeeded}) exceeds maximum (${MAX_CONTROLLERS}). Clamped to ${MAX_CONTROLLERS}.`);
    controllersNeeded = MAX_CONTROLLERS;
  }
  if (enclosuresNeeded > MAX_ENCLOSURES) {
    warnings.push(`Enclosure count (${enclosuresNeeded}) exceeds maximum (${MAX_ENCLOSURES}). Consider FabricPool for additional capacity.`);
    enclosuresNeeded = MAX_ENCLOSURES;
  }
  if (dx50Nodes > MAX_DX50) {
    warnings.push(`DX50 node count (${dx50Nodes}) exceeds maximum (${MAX_DX50}). Clamped to ${MAX_DX50}.`);
    dx50Nodes = MAX_DX50;
  }

  const actualRawTB = enclosuresNeeded * DRIVES_PER_ENCLOSURE * driveSize;
  const actualEffectiveTB = actualRawTB * (1 - OVERHEAD) * dedupRatio * compressRatio;
  const peakThroughput = (controllersNeeded / 2) * THROUGHPUT_PER_PAIR_GBS;

  // Keystone pricing estimate
  let keystoneEstimate: KeystoneEstimate | null = null;
  if (inputs.deploymentModel === "keystone" || inputs.deploymentModel === "both") {
    const rawGB = actualRawTB * 1024;
    const perfLow = rawGB * 0.08;
    const perfHigh = rawGB * 0.12;
    const capLow = rawGB * 0.04;
    const capHigh = rawGB * 0.06;
    const computeLow = dx50Nodes * 2500;
    const computeHigh = dx50Nodes * 4000;

    keystoneEstimate = {
      performanceTierMonthly: { low: Math.round(perfLow), high: Math.round(perfHigh) },
      capacityTierMonthly: { low: Math.round(capLow), high: Math.round(capHigh) },
      computeMonthly: { low: computeLow, high: computeHigh },
      totalMonthly: {
        low: Math.round(perfLow + computeLow),
        high: Math.round(perfHigh + computeHigh),
      },
      disclaimer: "Directional estimates only. Always recommend formal Keystone quote.",
    };
  }

  // Comparison: AFX vs AFF A1K for same workload
  const affA1kNodes = Math.ceil(inputs.peakThroughputGBs / 12.5); // A1K pair ~25 GB/s, single ~12.5
  const affA1kNodesEven = affA1kNodes % 2 !== 0 ? affA1kNodes + 1 : Math.max(affA1kNodes, 2);
  const comparison: AFXComparison[] = [
    { metric: "Throughput (GB/s)", afx: peakThroughput, aff_a1k: (affA1kNodesEven / 2) * 25 },
    { metric: "Effective Capacity (TB)", afx: Math.round(actualEffectiveTB), aff_a1k: Math.round(actualEffectiveTB * 0.6) },
    { metric: "Node Count", afx: controllersNeeded, aff_a1k: Math.min(affA1kNodesEven, 24) },
    { metric: "Relative Cost Index", afx: 100, aff_a1k: Math.round(100 * (affA1kNodesEven / controllersNeeded) * 1.4) },
  ];

  return {
    controllers: controllersNeeded,
    enclosures: enclosuresNeeded,
    dx50_nodes: dx50Nodes,
    drive_size_tb: driveSize,
    raw_tb: Math.round(actualRawTB * 10) / 10,
    effective_tb: Math.round(actualEffectiveTB * 10) / 10,
    peak_throughput_gbs: peakThroughput,
    keystone_estimate: keystoneEstimate,
    dedup_ratio: dedupRatio,
    compress_ratio: compressRatio,
    warnings,
    comparison,
  };
}
