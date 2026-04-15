// ─── MCS JSON shapes ──────────────────────────────────────────────────────────

export interface NodeStat {
  Node: string;
  mean: number;
  median: number;
  min: number;
  max: number;
  std: number;
  span: number;
  q05: number;
  q25: number;
  q75: number;
  q95: number;
  dep_count: number;
  succ_count: number;
}

export interface SimRun {
  Iteration: number;
  Node: string;
  Year: number;
  RandomDelay?: number;
  YearsPerTRL?: number;
}

export interface RiskRow {
  Node: string;
  std_class: number;
  Tail_Risiko: number;
  succ_count_class: number;
  dep_count_class: number;
  span_class: number;
  Score: number;
}

export interface SensitivityRow {
  Node: string;
  n_obs: number;
  YearsPerTRL_rho: number | null;
  YearsPerTRL_p: number | null;
  RandomDelay_rho: number | null;
  RandomDelay_p: number | null;
}

export interface McsData {
  stats: NodeStat[];
  runs: SimRun[];
  risk: RiskRow[];
  sensitivity: SensitivityRow[] | null;
}

// ─── Simulation mode ─────────────────────────────────────────────────────────

export type SimulationMode = 'deterministic' | 'option1' | 'option2' | 'option3';

export const MODE_LABELS: Record<SimulationMode, string> = {
  deterministic: 'Baseline (Deterministic)',
  option1: 'MCS Option 1 — Global Uncertainty',
  option2: 'MCS Option 2 — Local Node Uncertainty',
  option3: 'MCS Option 3 — Combined Risk',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function riskColor(score: number): string {
  if (score <= 1.5) return '#10b981';
  if (score <= 2.5) return '#84cc16';
  if (score <= 3.5) return '#f59e0b';
  if (score <= 4.5) return '#f97316';
  return '#ef4444';
}

export function riskLabel(score: number): string {
  if (score <= 1.5) return 'Very Low';
  if (score <= 2.5) return 'Low';
  if (score <= 3.5) return 'Medium';
  if (score <= 4.5) return 'High';
  return 'Very High';
}