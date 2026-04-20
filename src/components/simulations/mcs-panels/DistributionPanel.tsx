import React, { useState, useMemo, useEffect } from 'react';
import { NodeStat, DistributionData } from '../mcsTypes';

interface Props {
  stats: NodeStat[];
  distributions: DistributionData;
  labelToId: Map<string, string>;
  onNodeSelect?: (nodeId: string) => void;
}

const BIN_COUNT = 20;
const SVG_W = 600;
const SVG_H = 160;
const PAD = { top: 16, right: 16, bottom: 32, left: 36 };

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export const DistributionPanel: React.FC<Props> = ({
  stats,
  distributions,
  labelToId,
  onNodeSelect,
}) => {
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    if (stats.length > 0) setSelected(stats[0].Node);
  }, [stats]);

  const handleSelect = (label: string) => {
    setSelected(label);
    if (onNodeSelect) {
      const nodeId = labelToId.get(label);
      if (nodeId) onNodeSelect(nodeId);
    }
  };

  const nodeDist = useMemo(
    () => (selected ? distributions[selected] ?? {} : {}),
    [distributions, selected],
  );

  const sortedEntries = useMemo(
    () =>
      Object.entries(nodeDist)
        .map(([year, count]) => ({ year: parseInt(year, 10), count }))
        .sort((a, b) => a.year - b.year),
    [nodeDist],
  );

  const { bins, minYear, maxYear } = useMemo(() => {
    if (!sortedEntries.length) return { bins: [], minYear: 0, maxYear: 0 };

    const minYear = sortedEntries[0].year;
    const maxYear = sortedEntries[sortedEntries.length - 1].year;
    const range = maxYear - minYear || 1;
    const binCount = Math.min(BIN_COUNT, range + 1);
    const binSize = range / binCount;

    const bins: { year: number; lo: number; hi: number; count: number }[] = [];
    for (let i = 0; i < binCount; i++) {
      const lo = minYear + i * binSize;
      const hi = i === binCount - 1 ? maxYear + 0.001 : minYear + (i + 1) * binSize;
      bins.push({ year: Math.round(lo + binSize / 2), lo, hi, count: 0 });
    }

    for (const { year, count } of sortedEntries) {
      const idx = bins.findIndex((b) => year >= b.lo && year < b.hi);
      if (idx !== -1) bins[idx].count += count;
    }

    return { bins, minYear, maxYear };
  }, [sortedEntries]);

  const stat = stats.find((s) => s.Node === selected);

  const chartW = SVG_W - PAD.left - PAD.right;
  const chartH = SVG_H - PAD.top - PAD.bottom;
  const maxCount = Math.max(...bins.map((b) => b.count), 1);

  const points = useMemo(
    () =>
      bins.map((b, i) => ({
        x: PAD.left + (i / (bins.length - 1 || 1)) * chartW,
        y: PAD.top + chartH - (b.count / maxCount) * chartH,
        count: b.count,
        year: b.year,
      })),
    [bins, chartW, chartH, maxCount],
  );

  const areaPath = useMemo(() => {
    if (!points.length) return '';
    const line = smoothPath(points);
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const baseY = PAD.top + chartH;
    return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  }, [points, chartH]);

  const linePath = useMemo(() => smoothPath(points), [points]);

  const xLabels = useMemo(() => {
    if (!bins.length) return [];
    const step = Math.max(1, Math.floor(bins.length / 5));
    const labels: { x: number; year: number }[] = [];
    for (let i = 0; i < bins.length; i += step) {
      labels.push({
        x: PAD.left + (i / (bins.length - 1 || 1)) * chartW,
        year: bins[i].year,
      });
    }
    const last = bins.length - 1;
    if (labels[labels.length - 1]?.year !== bins[last].year) {
      labels.push({ x: PAD.left + chartW, year: bins[last].year });
    }
    return labels;
  }, [bins, chartW]);

  const medianX = useMemo(() => {
    if (!stat || !bins.length) return null;
    const med = stat.median;
    const t = (med - minYear) / (maxYear - minYear || 1);
    return PAD.left + t * chartW;
  }, [stat, bins, minYear, maxYear, chartW]);

  const isClickable = !!onNodeSelect;

  return (
    <div className="space-y-5">
      {/* Node selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm font-medium text-gray-700">Node:</label>
        <select
          value={selected}
          onChange={(e) => handleSelect(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {stats.map((s) => (
            <option key={s.Node} value={s.Node}>
              {s.Node}
            </option>
          ))}
        </select>
        {isClickable && selected && labelToId.has(selected) && (
          <span className="text-xs text-orange-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 8v4m0 4h.01" />
            </svg>
            highlighted in tree
          </span>
        )}
      </div>

      {/* Stat cards */}
      {stat && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Mean year',     value: Math.round(stat.mean).toString() },
            { label: 'Median year',   value: Math.round(stat.median).toString() },
            { label: 'Std dev (yrs)', value: stat.std.toFixed(2) },
            { label: 'P5 – P95',      value: `${Math.round(stat.q05)} – ${Math.round(stat.q95)}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3 border">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-lg font-semibold text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* SVG curve */}
      {bins.length > 0 ? (
        <div className="bg-gray-50 rounded-lg border p-2">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full"
            style={{ height: '180px' }}
          >
            <defs>
              <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.03" />
              </linearGradient>
            </defs>

            {[0.25, 0.5, 0.75, 1].map((t) => (
              <line
                key={t}
                x1={PAD.left}
                y1={PAD.top + chartH - t * chartH}
                x2={PAD.left + chartW}
                y2={PAD.top + chartH - t * chartH}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}

            <path d={areaPath} fill="url(#distGrad)" />

            {medianX !== null && (
              <>
                <line
                  x1={medianX}
                  y1={PAD.top}
                  x2={medianX}
                  y2={PAD.top + chartH}
                  stroke="#f97316"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <text
                  x={medianX + 4}
                  y={PAD.top + 11}
                  fontSize="9"
                  fill="#f97316"
                  fontFamily="monospace"
                >
                  median
                </text>
              </>
            )}

            <path
              d={linePath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            <line
              x1={PAD.left}
              y1={PAD.top + chartH}
              x2={PAD.left + chartW}
              y2={PAD.top + chartH}
              stroke="#d1d5db"
              strokeWidth="1"
            />

            {xLabels.map(({ x, year }) => (
              <text
                key={year}
                x={x}
                y={SVG_H - 6}
                textAnchor="middle"
                fontSize="10"
                fill="#9ca3af"
                fontFamily="monospace"
              >
                {year}
              </text>
            ))}

            <text
              x={PAD.left - 4}
              y={PAD.top + chartH / 2}
              textAnchor="middle"
              fontSize="9"
              fill="#9ca3af"
              transform={`rotate(-90, ${PAD.left - 18}, ${PAD.top + chartH / 2})`}
            >
              count
            </text>
          </svg>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">
          No completion data found for this node in the distribution data.
        </p>
      )}
    </div>
  );
};