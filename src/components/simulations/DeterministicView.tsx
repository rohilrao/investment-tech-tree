import React, { useMemo } from 'react';
import { Loader2 } from 'lucide-react';

interface SimulationData {
  impactData: Record<string, Record<string, number>>;
  statusData: Record<string, Record<string, string>>;
}

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
  topic: string;
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
  const heatmapData = useMemo(() => {
    if (!data) return { years: [], data: [] };
    const allYears = new Set<string>();
    Object.values(data.impactData).forEach((t) =>
      Object.keys(t).forEach((y) => allYears.add(y)),
    );
    const sortedYears = Array.from(allYears).sort((a, b) => parseInt(a) - parseInt(b));
    return {
      years: sortedYears,
      data: Object.keys(data.impactData).map((tech) => ({
        technology: tech,
        yearlyData: sortedYears.map((year) => ({
          year,
          impact: data.impactData[tech][year] || 0,
        })),
      })),
    };
  }, [data]);

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
                    <div className="w-64 p-2 text-sm text-gray-800 truncate" title={tech.technology}>
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
                    <div className="w-64 p-2 text-sm text-gray-800 truncate" title={tech.technology}>
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