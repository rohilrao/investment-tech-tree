import React, { useState, useMemo, useEffect } from 'react';
import { NodeStat, SimRun } from '../mcsTypes';

interface Props {
  stats: NodeStat[];
  runs: SimRun[];
}

const BAR_COUNT = 15;

export const DistributionPanel: React.FC<Props> = ({ stats, runs }) => {
  const [selected, setSelected] = useState<string>('');

  // Initialise / reset whenever stats changes (e.g. switching MCS option)
  useEffect(() => {
    if (stats.length > 0) setSelected(stats[0].Node);
  }, [stats]);

  // Completion years for the selected node
  const nodeYears = useMemo(() => {
    console.log('[DistributionPanel] runs.length:', runs.length);
    console.log('[DistributionPanel] selected:', JSON.stringify(selected));
    if (runs.length > 0) {
      console.log('[DistributionPanel] runs[0].Node:', JSON.stringify(runs[0].Node));
      console.log('[DistributionPanel] exact match:', runs[0].Node === selected);
      // Check for hidden characters
      console.log('[DistributionPanel] selected charCodes:', [...selected].map((c) => c.charCodeAt(0)));
      console.log('[DistributionPanel] runs[0] charCodes:', [...runs[0].Node].map((c) => c.charCodeAt(0)));
    }
    const filtered = runs.filter((r) => r.Node === selected);
    console.log('[DistributionPanel] filtered count:', filtered.length);
    return filtered.map((r) => Number(r.Year));
  }, [runs, selected]);

  // Fixed-width integer bins so every year lands in exactly one bucket
  const { bins, minYear, maxYear } = useMemo(() => {
    if (!nodeYears.length) return { bins: [], minYear: 0, maxYear: 0 };

    const minYear = Math.min(...nodeYears);
    const maxYear = Math.max(...nodeYears);
    const range = maxYear - minYear || 1;

    const binCount = Math.min(BAR_COUNT, range + 1);
    const binSize = range / binCount;

    const bins: { label: string; lo: number; hi: number; count: number }[] = [];
    for (let i = 0; i < binCount; i++) {
      const lo = minYear + i * binSize;
      const hi = i === binCount - 1 ? maxYear + 0.001 : minYear + (i + 1) * binSize;
      bins.push({ label: String(Math.round(lo)), lo, hi, count: 0 });
    }

    for (const y of nodeYears) {
      const idx = bins.findIndex((b) => y >= b.lo && y < b.hi);
      if (idx !== -1) bins[idx].count++;
    }

    return { bins, minYear, maxYear };
  }, [nodeYears]);

  const maxCount = Math.max(...bins.map((b) => b.count), 1);
  const stat = stats.find((s) => s.Node === selected);

  return (
    <div className="space-y-5">
      {/* Node selector */}
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
        <span className="text-xs text-gray-400">{nodeYears.length} iterations</span>
      </div>

      {/* Stat cards */}
      {stat && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Mean year', value: Math.round(stat.mean).toString() },
            { label: 'Median year', value: Math.round(stat.median).toString() },
            { label: 'Std dev (yrs)', value: stat.std.toFixed(2) },
            { label: 'P5 – P95', value: `${Math.round(stat.q05)} – ${Math.round(stat.q95)}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3 border">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-lg font-semibold text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Histogram */}
      {bins.length > 0 ? (
        <div>
          <p className="text-xs text-gray-500 mb-2">
            Completion year distribution across {nodeYears.length} Monte Carlo iterations
          </p>
          <div className="flex items-end gap-1 h-40 bg-gray-50 rounded-lg px-4 pt-4 pb-2 border">
            {bins.map((bin, i) => (
              <div key={i} className="flex flex-col items-center justify-end flex-1 h-full">
                <span className="text-xs text-gray-500 mb-0.5">
                  {bin.count > 0 ? bin.count : ''}
                </span>
                <div
                  className="w-full bg-blue-400 rounded-t transition-all duration-200 hover:bg-blue-500"
                  style={{
                    height: `${(bin.count / maxCount) * 100}%`,
                    minHeight: bin.count > 0 ? '2px' : '0',
                  }}
                  title={`~${bin.label}: ${bin.count} iterations`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
            <span>{minYear}</span>
            <span>Completion year →</span>
            <span>{maxYear}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">
          No completion data found for this node in the simulation runs.
        </p>
      )}
    </div>
  );
};