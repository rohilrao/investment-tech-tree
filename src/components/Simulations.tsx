import React, { useState, useMemo, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { TopicKey } from '@/lib/topicConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

type SimulationMode = 'deterministic' | 'option1' | 'option2' | 'option3';

interface SimulationData {
  impactData: Record<string, Record<string, number>>;
  statusData: Record<string, Record<string, string>>;
}

// Stats per node (stats_optionX.json)
interface NodeStat {
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

// Raw simulation run (simulation_runs_optionX.json)
interface SimRun {
  Iteration: number;
  Node: string;
  Year: number;
  RandomDelay?: number;
  YearsPerTRL?: number;
}

// Risk assessment row (risk_assessment_optionX.json)
interface RiskRow {
  Node: string;
  std_class: number;
  Tail_Risiko: number;
  succ_count_class: number;
  dep_count_class: number;
  span_class: number;
  Score: number;
}

// Sensitivity row (sensitivity.json — option3 only)
interface SensitivityRow {
  Node: string;
  n_obs: number;
  YearsPerTRL_rho: number | null;
  YearsPerTRL_p: number | null;
  RandomDelay_rho: number | null;
  RandomDelay_p: number | null;
}

interface McsData {
  stats: NodeStat[];
  runs: SimRun[];
  risk: RiskRow[];
  sensitivity: SensitivityRow[] | null;
}

interface SimulationsProps {
  topic: TopicKey;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TREE_FOLDER: Record<TopicKey, string> = {
  nuclear: 'nuclear_tt',
  fossil_fuels: 'fossil_fuel_tt_v2',
};

const MODE_LABELS: Record<SimulationMode, string> = {
  deterministic: 'Baseline',
  option1: 'MCS Option 1 — Global Uncertainty',
  option2: 'MCS Option 2 — Local Node Uncertainty',
  option3: 'MCS Option 3 — Combined Risk (LHS)',
};

const STATUS_COLORS: Record<string, string> = {
  Active: '#3b82f6',
  Pending: '#f59e0b',
  Completed: '#10b981',
};

function riskColor(score: number): string {
  if (score <= 1.5) return '#10b981';
  if (score <= 2.5) return '#84cc16';
  if (score <= 3.5) return '#f59e0b';
  if (score <= 4.5) return '#f97316';
  return '#ef4444';
}

function riskLabel(score: number): string {
  if (score <= 1.5) return 'Very Low';
  if (score <= 2.5) return 'Low';
  if (score <= 3.5) return 'Medium';
  if (score <= 4.5) return 'High';
  return 'Very High';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Completion year distribution — mini bar-chart per node */
function DistributionPanel({ stats, runs }: { stats: NodeStat[]; runs: SimRun[] }) {
  const [selected, setSelected] = useState<string>(stats[0]?.Node ?? '');

  const nodeRuns = useMemo(
    () => runs.filter((r) => r.Node === selected).map((r) => r.Year),
    [runs, selected],
  );

  // Build histogram bins
  const histogram = useMemo(() => {
    if (!nodeRuns.length) return [];
    const min = Math.min(...nodeRuns);
    const max = Math.max(...nodeRuns);
    const binCount = Math.min(20, max - min + 1);
    const binSize = (max - min) / binCount || 1;
    const bins: { label: string; count: number }[] = [];
    for (let i = 0; i < binCount; i++) {
      const lo = min + i * binSize;
      const hi = lo + binSize;
      bins.push({
        label: `${Math.round(lo)}`,
        count: nodeRuns.filter((y) => y >= lo && (i === binCount - 1 ? y <= hi : y < hi)).length,
      });
    }
    return bins;
  }, [nodeRuns]);

  const maxCount = Math.max(...histogram.map((b) => b.count), 1);
  const stat = stats.find((s) => s.Node === selected);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm font-medium text-gray-700">Node:</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {stats.map((s) => (
            <option key={s.Node} value={s.Node}>
              {s.Node}
            </option>
          ))}
        </select>
      </div>

      {stat && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Mean year', value: stat.mean.toFixed(1) },
            { label: 'Median year', value: stat.median.toFixed(1) },
            { label: 'Std dev', value: stat.std.toFixed(2) },
            { label: 'P5 – P95', value: `${Math.round(stat.q05)} – ${Math.round(stat.q95)}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3 border">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-lg font-semibold text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      )}

      {histogram.length > 0 ? (
        <div>
          <p className="text-xs text-gray-500 mb-2">
            Completion year distribution ({nodeRuns.length} iterations)
          </p>
          <div className="flex items-end gap-0.5 h-36 bg-gray-50 rounded-lg p-3 border overflow-x-auto">
            {histogram.map((bin, i) => (
              <div key={i} className="flex flex-col items-center flex-1 min-w-[12px]">
                <div
                  className="w-full bg-blue-400 rounded-t transition-all"
                  style={{ height: `${(bin.count / maxCount) * 100}%` }}
                  title={`~${bin.label}: ${bin.count} runs`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1 px-3">
            <span>{histogram[0]?.label}</span>
            <span>Year →</span>
            <span>{histogram[histogram.length - 1]?.label}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No completion data for this node.</p>
      )}
    </div>
  );
}

/** Summary stats table */
function StatsPanel({ stats }: { stats: NodeStat[] }) {
  const sorted = useMemo(() => [...stats].sort((a, b) => a.mean - b.mean), [stats]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            {['Node', 'Mean yr', 'Median', 'Std', 'P5', 'P95', 'Span', 'Deps', 'Succs'].map(
              (h) => (
                <th key={h} className="px-3 py-2 font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap">
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.Node}
              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                i % 2 === 0 ? '' : 'bg-gray-50/50'
              }`}
            >
              <td className="px-3 py-2 font-medium text-gray-800 max-w-[200px] truncate" title={row.Node}>
                {row.Node}
              </td>
              <td className="px-3 py-2 text-gray-600">{row.mean.toFixed(1)}</td>
              <td className="px-3 py-2 text-gray-600">{row.median.toFixed(1)}</td>
              <td className="px-3 py-2 text-gray-600">{row.std.toFixed(2)}</td>
              <td className="px-3 py-2 text-gray-600">{Math.round(row.q05)}</td>
              <td className="px-3 py-2 text-gray-600">{Math.round(row.q95)}</td>
              <td className="px-3 py-2 text-gray-600">{row.span.toFixed(1)}</td>
              <td className="px-3 py-2 text-center text-gray-600">{row.dep_count}</td>
              <td className="px-3 py-2 text-center text-gray-600">{row.succ_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Risk assessment — sorted bar list */
function RiskPanel({ risk }: { risk: RiskRow[] }) {
  const sorted = useMemo(() => [...risk].sort((a, b) => b.Score - a.Score), [risk]);
  const maxScore = 5;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Composite risk score (1 = lowest, 5 = highest) based on timing variance, tail risk,
        dependency count, and schedule span.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {['Very Low', 'Low', 'Medium', 'High', 'Very High'].map((l, i) => (
          <div key={l} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: riskColor(i * 1.25 + 1) }}
            />
            <span className="text-gray-600">{l}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {sorted.map((row) => (
          <div key={row.Node} className="flex items-center gap-3">
            <span
              className="w-44 text-xs text-gray-700 truncate flex-shrink-0"
              title={row.Node}
            >
              {row.Node}
            </span>
            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(row.Score / maxScore) * 100}%`,
                  backgroundColor: riskColor(row.Score),
                }}
              />
            </div>
            <span className="text-xs font-semibold w-12 text-right" style={{ color: riskColor(row.Score) }}>
              {riskLabel(row.Score)}
            </span>
            <span className="text-xs text-gray-400 w-8 text-right">{row.Score.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Sensitivity — Option 3 only */
function SensitivityPanel({ sensitivity }: { sensitivity: SensitivityRow[] }) {
  const sorted = useMemo(
    () =>
      [...sensitivity]
        .filter((r) => r.YearsPerTRL_rho !== null || r.RandomDelay_rho !== null)
        .sort(
          (a, b) =>
            Math.abs(b.YearsPerTRL_rho ?? 0) + Math.abs(b.RandomDelay_rho ?? 0) -
            (Math.abs(a.YearsPerTRL_rho ?? 0) + Math.abs(a.RandomDelay_rho ?? 0)),
        ),
    [sensitivity],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Spearman rank correlation between uncertainty inputs and completion year. Higher absolute
        value = that input drives more of the timing uncertainty for this node.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-3 py-2 font-semibold text-gray-700 border-b border-gray-200">Node</th>
              <th className="px-3 py-2 font-semibold text-gray-700 border-b border-gray-200">
                Global delay ρ
              </th>
              <th className="px-3 py-2 font-semibold text-gray-700 border-b border-gray-200">
                Local delay ρ
              </th>
              <th className="px-3 py-2 font-semibold text-gray-700 border-b border-gray-200">
                Dominant driver
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const g = row.YearsPerTRL_rho ?? 0;
              const l = row.RandomDelay_rho ?? 0;
              const dominant = Math.abs(g) >= Math.abs(l) ? 'Global' : 'Local';
              return (
                <tr
                  key={row.Node}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    i % 2 === 0 ? '' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="px-3 py-2 font-medium text-gray-800 max-w-[200px] truncate" title={row.Node}>
                    {row.Node}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className="font-mono"
                      style={{ color: g >= 0 ? '#3b82f6' : '#ef4444' }}
                    >
                      {g.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className="font-mono"
                      style={{ color: l >= 0 ? '#3b82f6' : '#ef4444' }}
                    >
                      {l.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        dominant === 'Global'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {dominant}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const Simulations: React.FC<SimulationsProps> = ({ topic }) => {
  // ── Deterministic state (unchanged) ──
  const [selectedYears, setSelectedYears] = useState<string>('30');
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [detIsLoading, setDetIsLoading] = useState(true);
  const [detError, setDetError] = useState<string | null>(null);

  // ── MCS state ──
  const [mode, setMode] = useState<SimulationMode>('deterministic');
  const [mcsData, setMcsData] = useState<McsData | null>(null);
  const [mcsLoading, setMcsLoading] = useState(false);
  const [mcsError, setMcsError] = useState<string | null>(null);
  const [mcsTab, setMcsTab] = useState<'distribution' | 'stats' | 'risk' | 'sensitivity'>(
    'distribution',
  );

  const yearOptions = useMemo(() => {
    const opts = [];
    for (let i = 5; i <= 30; i += 5) opts.push(i.toString());
    return opts;
  }, []);

  // ── Fetch deterministic data ──
  useEffect(() => {
    if (mode !== 'deterministic') return;
    const fetch_ = async () => {
      setDetIsLoading(true);
      setDetError(null);
      try {
        const res = await fetch(
          `/investment-tech-tree/api/simulation?years=${selectedYears}&topic=${topic}`,
        );
        if (!res.ok) throw new Error('Failed to fetch simulation data');
        setSimulationData(await res.json());
      } catch (err) {
        setDetError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setDetIsLoading(false);
      }
    };
    fetch_();
  }, [selectedYears, topic, mode]);

  // ── Fetch MCS data ──
  useEffect(() => {
    if (mode === 'deterministic') return;
    const folder = TREE_FOLDER[topic];
    const base = `/investment-tech-tree/outputs/${folder}`;
    const suffix = mode === 'option1' ? 'option1' : mode === 'option2' ? 'option2' : 'option3';

    const load = async () => {
      setMcsLoading(true);
      setMcsError(null);
      setMcsData(null);
      try {
        const [statsRes, runsRes, riskRes] = await Promise.all([
          fetch(`${base}/stats_${suffix}.json`),
          fetch(`${base}/simulation_runs_${suffix}.json`),
          fetch(`${base}/risk_assessment_${suffix}.json`),
        ]);
        if (!statsRes.ok || !runsRes.ok || !riskRes.ok)
          throw new Error('One or more MCS files could not be loaded. Make sure the JSON files are in public/outputs/.');

        const [stats, runs, risk] = await Promise.all([
          statsRes.json(),
          runsRes.json(),
          riskRes.json(),
        ]);

        let sensitivity: SensitivityRow[] | null = null;
        if (mode === 'option3') {
          const sensRes = await fetch(`${base}/sensitivity.json`);
          if (sensRes.ok) sensitivity = await sensRes.json();
        }

        setMcsData({ stats, runs, risk, sensitivity });
        // Default to distribution tab; if option3 also show sensitivity
        setMcsTab('distribution');
      } catch (err) {
        setMcsError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setMcsLoading(false);
      }
    };
    load();
  }, [mode, topic]);

  // ── Deterministic derived data (unchanged logic) ──
  const heatmapData = useMemo(() => {
    if (!simulationData) return { years: [], technologies: [], data: [] };
    const { impactData } = simulationData;
    const allYears = new Set<string>();
    Object.values(impactData).forEach((t) => Object.keys(t).forEach((y) => allYears.add(y)));
    const sortedYears = Array.from(allYears).sort((a, b) => parseInt(a) - parseInt(b));
    const technologies = Object.keys(impactData);
    return {
      years: sortedYears,
      technologies,
      data: technologies.map((tech) => ({
        technology: tech,
        yearlyData: sortedYears.map((year) => ({
          year,
          impact: impactData[tech][year] || 0,
        })),
      })),
    };
  }, [simulationData]);

  const timelineData = useMemo(() => {
    if (!simulationData) return { years: [], technologies: [], data: [] };
    const { statusData } = simulationData;
    const allYears = new Set<string>();
    Object.values(statusData).forEach((t) => Object.keys(t).forEach((y) => allYears.add(y)));
    const sortedYears = Array.from(allYears).sort((a, b) => parseInt(a) - parseInt(b));
    const technologies = Object.keys(statusData);
    return {
      years: sortedYears,
      technologies,
      data: technologies.map((tech) => ({
        technology: tech,
        yearlyData: sortedYears.map((year) => ({
          year,
          status: statusData[tech][year] || 'Pending',
        })),
      })),
    };
  }, [simulationData]);

  const summaryStats = useMemo(() => {
    if (!simulationData) return { totalTechs: 0, maxImpact: 0, activeNow: 0 };
    const totalTechs = Object.keys(simulationData.impactData).length;
    const maxImpact = Math.max(
      ...Object.values(simulationData.impactData).flatMap((t) => Object.values(t)),
      0,
    );
    const currentYear = '2026';
    const activeNow = Object.values(simulationData.statusData).filter(
      (t) => t[currentYear] === 'Active',
    ).length;
    return { totalTechs, maxImpact, activeNow };
  }, [simulationData]);

  const getImpactColor = (impact: number) => {
    if (impact === 0 || !simulationData) return '#f3f4f6';
    const maxImpact = Math.max(
      ...Object.values(simulationData.impactData).flatMap((t) => Object.values(t)),
    );
    const intensity = Math.min(impact / maxImpact, 1);
    return `rgba(59,130,246,${0.1 + intensity * 0.9})`;
  };

  const downloadJson = (data: object, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── MCS tabs available ──
  const mcsTabs = useMemo(() => {
    const tabs: { key: typeof mcsTab; label: string }[] = [
      { key: 'distribution', label: 'Completion Distributions' },
      { key: 'stats', label: 'Summary Stats' },
      { key: 'risk', label: 'Risk Assessment' },
    ];
    if (mode === 'option3') tabs.push({ key: 'sensitivity', label: 'Sensitivity' });
    return tabs;
  }, [mode]);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 bg-white">
      {/* ── Header + controls ── */}
      <div className="mb-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Investment Simulation Results</h2>

        {/* Simulation mode dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Simulation Model:
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as SimulationMode)}
            className="block w-80 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {(Object.keys(MODE_LABELS) as SimulationMode[]).map((m) => (
              <option key={m} value={m}>
                {MODE_LABELS[m]}
              </option>
            ))}
          </select>
        </div>

        {/* Years selector — only shown for deterministic */}
        {mode === 'deterministic' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Horizon:
            </label>
            <select
              value={selectedYears}
              onChange={(e) => setSelectedYears(e.target.value)}
              disabled={detIsLoading}
              className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y} years
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DETERMINISTIC VIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {mode === 'deterministic' && (
        <>
          {detError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-600 text-sm mt-1">{detError}</p>
            </div>
          )}

          {detIsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600">Running simulation…</span>
            </div>
          ) : simulationData ? (
            <div className="space-y-8">
              {/* Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Summary ({selectedYears} years)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-gray-600">Total Technologies</h4>
                    <p className="text-2xl font-bold text-blue-600">{summaryStats.totalTechs}</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-gray-600">Active Technologies</h4>
                    <p className="text-2xl font-bold text-green-600">{summaryStats.activeNow}</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium text-gray-600">Max Impact (TWh)</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {summaryStats.maxImpact.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Impact heatmap */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Technology Impact Heatmap (TWh)
                </h3>
                <p className="text-sm text-gray-600 mb-4">Only impact &gt; 0.01 TWh shown</p>
                <div className="overflow-x-auto">
                  <div className="min-w-max">
                    <div className="flex">
                      <div className="w-64 p-2 font-medium text-sm text-gray-700">Technology</div>
                      {heatmapData.years.map((y) => (
                        <div key={y} className="w-16 p-2 text-center font-medium text-sm text-gray-700">
                          {y}
                        </div>
                      ))}
                    </div>
                    {heatmapData.data.map((tech) => (
                      <div key={tech.technology} className="flex border-t border-gray-200">
                        <div
                          className="w-64 p-2 text-sm text-gray-800 truncate"
                          title={tech.technology}
                        >
                          {tech.technology}
                        </div>
                        {tech.yearlyData.map(({ year, impact }) => (
                          <div
                            key={year}
                            className="w-16 p-2 text-center text-xs border-l border-gray-200"
                            style={{ backgroundColor: getImpactColor(impact) }}
                            title={`${tech.technology} (${year}): ${impact.toFixed(3)} TWh`}
                          >
                            {impact > 0 ? impact.toFixed(2) : ''}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status timeline */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Technology Status Timeline
                </h3>
                <div className="mb-4 flex items-center space-x-4 text-sm">
                  {Object.entries(STATUS_COLORS).map(([label, color]) => (
                    <div key={label} className="flex items-center">
                      <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: color }} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-max">
                    <div className="flex">
                      <div className="w-64 p-2 font-medium text-sm text-gray-700">Technology</div>
                      {timelineData.years.map((y) => (
                        <div key={y} className="w-16 p-2 text-center font-medium text-sm text-gray-700">
                          {y}
                        </div>
                      ))}
                    </div>
                    {timelineData.data.map((tech) => (
                      <div key={tech.technology} className="flex border-t border-gray-200">
                        <div
                          className="w-64 p-2 text-sm text-gray-800 truncate"
                          title={tech.technology}
                        >
                          {tech.technology}
                        </div>
                        {tech.yearlyData.map(({ year, status }) => (
                          <div
                            key={year}
                            className="w-16 p-1 text-center border-l border-gray-200"
                            title={`${tech.technology} (${year}): ${status}`}
                          >
                            <div
                              className="w-full h-6 rounded"
                              style={{ backgroundColor: STATUS_COLORS[status] ?? '#6b7280' }}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Download */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() =>
                    downloadJson(
                      simulationData.impactData,
                      `impact-data-${selectedYears}yr-${topic}.json`,
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                >
                  Download Impact Data
                </button>
                <button
                  onClick={() =>
                    downloadJson(
                      simulationData.statusData,
                      `status-data-${selectedYears}yr-${topic}.json`,
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-md transition-colors"
                >
                  Download Status Data
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MCS VIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {mode !== 'deterministic' && (
        <>
          {mcsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-semibold">Could not load MCS data</p>
              <p className="text-red-600 text-sm mt-1">{mcsError}</p>
            </div>
          )}

          {mcsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600">Loading Monte Carlo results…</span>
            </div>
          ) : mcsData ? (
            <div className="space-y-4">
              {/* MCS summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-xs text-gray-500">Nodes analysed</p>
                  <p className="text-2xl font-bold text-blue-600">{mcsData.stats.length}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-xs text-gray-500">Simulations run</p>
                  <p className="text-2xl font-bold text-indigo-600">
                  {mcsData.runs.length > 0 ? '10,000' : '—'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-xs text-gray-500">Highest risk node</p>
                  <p
                    className="text-sm font-bold text-orange-600 truncate"
                    title={mcsData.risk.sort((a, b) => b.Score - a.Score)[0]?.Node}
                  >
                    {mcsData.risk.sort((a, b) => b.Score - a.Score)[0]?.Node ?? '—'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-xs text-gray-500">Avg completion year</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {mcsData.stats.length
                      ? Math.round(
                          mcsData.stats.reduce((s, r) => s + r.mean, 0) / mcsData.stats.length,
                        )
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Tab bar */}
              <div className="border-b border-gray-200">
                <nav className="flex gap-1">
                  {mcsTabs.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setMcsTab(t.key)}
                      className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                        mcsTab === t.key
                          ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab content */}
              <div className="bg-white rounded-b-lg pt-2">
                {mcsTab === 'distribution' && (
                  <DistributionPanel stats={mcsData.stats} runs={mcsData.runs} />
                )}
                {mcsTab === 'stats' && <StatsPanel stats={mcsData.stats} />}
                {mcsTab === 'risk' && <RiskPanel risk={mcsData.risk} />}
                {mcsTab === 'sensitivity' && mcsData.sensitivity && (
                  <SensitivityPanel sensitivity={mcsData.sensitivity} />
                )}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default Simulations;