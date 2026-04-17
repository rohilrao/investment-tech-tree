import React, { useMemo, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { TopicKey } from '@/lib/topicConfig';

const TREE_FOLDER: Record<TopicKey, string> = {
  nuclear: 'nuclear_tt',
  fossil_fuels: 'fossil_fuel_tt_v2',
};

interface SimulationData {
  impactData: Record<string, Record<string, number>>;
  statusData: Record<string, Record<string, string>>;
}

interface YearEntry {
  status?: string;
  delta_twh?: number;
  baseline_twh?: number;
  accelerated_twh?: number;
}

interface NodeAnalysis {
  downstream_count: number;
  yearly: Record<string, YearEntry>;
}

type DeterministicAnalysis = Record<string, NodeAnalysis | { [key: string]: unknown }>;

const STATUS_COLORS: Record<string, string> = {
  Active: '#3b82f6',
  Pending: '#f59e0b',
  Completed: '#10b981',
};

interface Props {
  selectedYears: string;
  onYearsChange: (y: string) => void;
  isLoading: boolean;
  error: string | null;
  data: SimulationData | null;
  topic: TopicKey;
  yearOptions: string[];
}

function downloadJson(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const DeterministicView: React.FC<Props> = ({
  selectedYears,
  onYearsChange,
  isLoading,
  error,
  data,
  topic,
  yearOptions,
}) => {
  const [topN, setTopN] = useState(3);
  const [selectedPanelYear, setSelectedPanelYear] = useState<string>('');

  const [analysis, setAnalysis] = useState<DeterministicAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Load deterministic_analysis.json from public/outputs whenever topic changes
  useEffect(() => {
    const folder = TREE_FOLDER[topic];
    if (!folder) return;
    setAnalysis(null);
    setAnalysisError(null);
    setAnalysisLoading(true);
    fetch(`/investment-tech-tree/outputs/${folder}/deterministic_analysis.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`Could not load deterministic_analysis.json (${r.status})`);
        return r.json();
      })
      .then((json: DeterministicAnalysis) => setAnalysis(json))
      .catch((e: Error) => setAnalysisError(e.message))
      .finally(() => setAnalysisLoading(false));
  }, [topic]);

  // Reset panel year when topic or time horizon changes
  useEffect(() => {
    setSelectedPanelYear('');
    setTopN(3);
  }, [topic, selectedYears]);

  const allSortedYears = useMemo(() => {
    if (!data) return [];
    const allYears = new Set<string>();
    Object.values(data.impactData).forEach((t) =>
      Object.keys(t).forEach((y) => allYears.add(y)),
    );
    return Array.from(allYears).sort((a, b) => parseInt(a) - parseInt(b));
  }, [data]);

  const panelYear = selectedPanelYear || allSortedYears[0] || '';

  // All active nodes in selected year that have a positive delta — used for slider max
  const activeNodesInYear = useMemo(() => {
    if (!analysis || !panelYear) return [];
    return Object.entries(analysis).filter(([key, value]) => {
      if (key === '__meta__') return false;
      const node = value as NodeAnalysis;
      const yearData = node.yearly?.[panelYear];
      return yearData?.status === 'Active' && (yearData?.delta_twh ?? 0) > 0;
    });
  }, [analysis, panelYear]);

  const topNNodes = useMemo(() => {
    return activeNodesInYear
      .map(([label, value]) => {
        const node = value as NodeAnalysis;
        const yearData = node.yearly[panelYear];
        return {
          label,
          baseline_twh: yearData.baseline_twh ?? 0,
          accelerated_twh: yearData.accelerated_twh ?? 0,
          delta_twh: yearData.delta_twh ?? 0,
          downstream_count: node.downstream_count ?? 0,
        };
      })
      .sort((a, b) => b.delta_twh - a.delta_twh)
      .slice(0, topN);
  }, [activeNodesInYear, panelYear, topN]);

  const heatmapData = useMemo(() => {
    if (!data) return { years: [], data: [] };
    return {
      years: allSortedYears,
      data: Object.keys(data.impactData).map((tech) => ({
        technology: tech,
        yearlyData: allSortedYears.map((year) => ({
          year,
          impact: data.impactData[tech][year] || 0,
        })),
      })),
    };
  }, [data, allSortedYears]);

  const timelineData = useMemo(() => {
    if (!data) return { years: [], data: [] };
    const allYears = new Set<string>();
    Object.values(data.statusData).forEach((t) =>
      Object.keys(t).forEach((y) => allYears.add(y)),
    );
    const sortedYears = Array.from(allYears).sort((a, b) => parseInt(a) - parseInt(b));
    return {
      years: sortedYears,
      data: Object.keys(data.statusData).map((tech) => ({
        technology: tech,
        yearlyData: sortedYears.map((year) => ({
          year,
          status: data.statusData[tech][year] || 'Pending',
        })),
      })),
    };
  }, [data]);

  const summaryStats = useMemo(() => {
    if (!data) return { totalTechs: 0, maxImpact: 0, activeNow: 0 };
    const totalTechs = Object.keys(data.impactData).length;
    const maxImpact = Math.max(
      ...Object.values(data.impactData).flatMap((t) => Object.values(t)),
      0,
    );
    const activeNow = Object.values(data.statusData).filter(
      (t) => t['2026'] === 'Active',
    ).length;
    return { totalTechs, maxImpact, activeNow };
  }, [data]);

  const getImpactColor = (impact: number) => {
    if (impact === 0 || !data) return '#f3f4f6';
    const maxImpact = Math.max(
      ...Object.values(data.impactData).flatMap((t) => Object.values(t)),
    );
    const intensity = Math.min(impact / maxImpact, 1);
    return `rgba(59,130,246,${0.1 + intensity * 0.9})`;
  };

  return (
    <>
      {/* Time horizon selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time Horizon:
        </label>
        <select
          value={selectedYears}
          onChange={(e) => onYearsChange(e.target.value)}
          disabled={isLoading}
          className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y} years
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 font-semibold">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600">Running simulation…</span>
        </div>
      ) : data ? (
        <div className="space-y-8">

          {/* Summary cards */}
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

          {/* ── Top Investment Priorities ── */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-1">
              Top Investment Priorities
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Active nodes ranked by acceleration gain for the selected year. Baseline and
              accelerated are total discounted pathway MWh (TWh) across all downstream reactor
              concepts. Delta is the gain from completing this node one year earlier. Downstream
              is the count of all nodes transitively unlocked by this node in the full tech tree.
            </p>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-6 mb-5">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Show top
                </label>
                <input
                  type="range"
                  min={1}
                  max={Math.max(activeNodesInYear.length, 1)}
                  step={1}
                  value={Math.min(topN, Math.max(activeNodesInYear.length, 1))}
                  onChange={(e) => setTopN(parseInt(e.target.value))}
                  className="w-28"
                />
                <span className="text-sm font-semibold text-blue-600 min-w-[20px]">
                  {Math.min(topN, activeNodesInYear.length)}
                </span>
                <span className="text-xs text-gray-400">
                  of {activeNodesInYear.length} active
                </span>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Year
                </label>
                <select
                  value={panelYear}
                  onChange={(e) => {
                    setSelectedPanelYear(e.target.value);
                    setTopN(3);
                  }}
                  className="block px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {allSortedYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            {analysisLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading analysis data…
              </div>
            ) : analysisError ? (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                {analysisError}
              </div>
            ) : topNNodes.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                No active nodes with a positive acceleration gain in {panelYear}. Try a different year.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200 text-left">
                      <th className="py-2 pr-3 font-medium text-gray-500 w-6">#</th>
                      <th className="py-2 pr-4 font-medium text-gray-500">Node</th>
                      <th className="py-2 pr-4 font-medium text-gray-500 text-right whitespace-nowrap">
                        Baseline (TWh)
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-500 text-right whitespace-nowrap">
                        Accelerated (TWh)
                      </th>
                      <th className="py-2 pr-4 font-medium text-gray-500 text-right whitespace-nowrap">
                        Delta (TWh)
                      </th>
                      <th className="py-2 font-medium text-gray-500 text-right whitespace-nowrap">
                        Downstream nodes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topNNodes.map(
                      ({ label, baseline_twh, accelerated_twh, delta_twh, downstream_count }, idx) => (
                        <tr
                          key={label}
                          className="border-b border-gray-100 hover:bg-white transition-colors"
                        >
                          <td className="py-3 pr-3 text-gray-400 text-xs font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-3 pr-4 font-medium text-gray-800 max-w-[200px]">
                            <span className="block truncate" title={label}>
                              {label}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-right font-mono text-gray-700">
                            {baseline_twh.toFixed(3)}
                          </td>
                          <td className="py-3 pr-4 text-right font-mono text-green-600">
                            {accelerated_twh.toFixed(3)}
                          </td>
                          <td className="py-3 pr-4 text-right">
                            <span className="font-mono text-blue-600 font-medium">
                              +{delta_twh.toFixed(4)}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <span
                              className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                background:
                                  downstream_count > 10
                                    ? '#dbeafe'
                                    : downstream_count > 5
                                    ? '#fef3c7'
                                    : '#f3f4f6',
                                color:
                                  downstream_count > 10
                                    ? '#1e40af'
                                    : downstream_count > 5
                                    ? '#92400e'
                                    : '#6b7280',
                              }}
                            >
                              {downstream_count}
                            </span>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
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
                    <div
                      key={y}
                      className="w-16 p-2 text-center font-medium text-sm text-gray-700"
                    >
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
                    <div
                      key={y}
                      className="w-16 p-2 text-center font-medium text-sm text-gray-700"
                    >
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

          {/* Downloads */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() =>
                downloadJson(data.impactData, `impact-data-${selectedYears}yr-${topic}.json`)
              }
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
            >
              Download Impact Data
            </button>
            <button
              onClick={() =>
                downloadJson(data.statusData, `status-data-${selectedYears}yr-${topic}.json`)
              }
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-md transition-colors"
            >
              Download Status Data
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};