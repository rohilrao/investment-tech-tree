import React, { useState, useMemo, useEffect } from 'react';
import { NodeStat, SimRun } from '../mcsTypes';

interface Props {
  stats: NodeStat[];
  runs: SimRun[];
  totalIterations: number;
}

const BIN_COUNT = 20;
const SVG_W = 600;
const SVG_H = 160;
const PAD = { top: 16, right: 16, bottom: 32, left: 36 };

/** Catmull-Rom spline through a set of points → SVG path d string */
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

export const DistributionPanel: React.FC<Props> = ({ stats, runs, totalIterations }) => {
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    if (stats.length > 0) setSelected(stats[0].Node);
  }, [stats]);

  const nodeYears = useMemo(
    () => runs.filter((r) => r.Node === selected).map((r) => Number(r.Year)),
    [runs, selected],
  );

  const { bins, minYear, maxYear } = useMemo(() => {
    if (!nodeYears.length) return { bins: [], minYear: 0, maxYear: 0 };
    const minYear = Math.min(...nodeYears);
    const maxYear = Math.max(...nodeYears);
    const range = maxYear - minYear || 1;
    const binCount = Math.min(BIN_COUNT, range + 1);
    const binSize = range / binCount;

    const bins: { year: number; lo: number; hi: number; count: number }[] = [];
    for (let i = 0; i < binCount; i++) {
      const lo = minYear + i * binSize;
      const hi = i === binCount - 1 ? maxYear + 0.001 : minYear + (i + 1) * binSize;
      bins.push({ year: Math.round(lo + binSize / 2), lo, hi, count: 0 });
    }
    for (const y of nodeYears) {
      const idx = bins.findIndex((b) => y >= b.lo && y < b.hi);
      if (idx !== -1) bins[idx].count++;
    }
    return { bins, minYear, maxYear };
  }, [nodeYears]);

  const stat = stats.find((s) => s.Node === selected);

  // Map bins to SVG coordinates
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

  // Area fill path (closed)
  const areaPath = useMemo(() => {
    if (!points.length) return '';
    const line = smoothPath(points);
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const baseY = PAD.top + chartH;
    return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  }, [points, chartH]);

  const linePath = useMemo(() => smoothPath(points), [points]);

  // X-axis year labels — pick ~5 evenly spaced
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
    // Always include last
    const last = bins.length - 1;
    if (labels[labels.length - 1]?.year !== bins[last].year) {
      labels.push({
        x: PAD.left + chartW,
        year: bins[last].year,
      });
    }
    return labels;
  }, [bins, chartW]);

  // Median line position
  const medianX = useMemo(() => {
    if (!stat || !bins.length) return null;
    const med = stat.median;
    const t = (med - minYear) / (maxYear - minYear || 1);
    return PAD.left + t * chartW;
  }, [stat, bins, minYear, maxYear, chartW]);

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

            {/* Horizontal grid lines */}
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

            {/* Area fill */}
            <path d={areaPath} fill="url(#distGrad)" />

            {/* Median dashed line */}
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

            {/* Curve line */}
            <path
              d={linePath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* X-axis baseline */}
            <line
              x1={PAD.left}
              y1={PAD.top + chartH}
              x2={PAD.left + chartW}
              y2={PAD.top + chartH}
              stroke="#d1d5db"
              strokeWidth="1"
            />

            {/* X-axis year labels */}
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

            {/* Y-axis label */}
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
          No completion data found for this node in the simulation runs.
        </p>
      )}
    </div>
  );
};