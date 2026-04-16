'use client';

import React, { useMemo, useState } from 'react';
import { RiskRow, riskColor, riskLabel } from '../mcsTypes';

interface Props {
  risk: RiskRow[];
}

const AXES = [
  { key: 'std_class',       label: 'Timing variance' },
  { key: 'Tail_Risiko',     label: 'Tail risk' },
  { key: 'succ_count_class',label: 'Downstream reach' },
  { key: 'dep_count_class', label: 'Dependency load' },
  { key: 'span_class',      label: 'Schedule span' },
] as const;

type AxisKey = (typeof AXES)[number]['key'];

const RISK_LEVELS = ['Very Low', 'Low', 'Medium', 'High', 'Very High'] as const;
const LEGEND_SCORES = [1.0, 2.0, 3.0, 4.0, 5.0];

const N = AXES.length;
const CX = 110;
const CY = 110;
const R = 80;          // outer radius at score = 5
const TICK_R = [16, 32, 48, 64, 80]; // radii for score levels 1–5

/** Convert polar (angle from top, radius) to Cartesian. */
function polar(angleDeg: number, r: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

/** Build the polygon points string for a set of 5 scores (1–5). */
function dataPolygon(scores: number[]): string {
  return scores
    .map((s, i) => {
      const angle = (i / N) * 360;
      const [x, y] = polar(angle, (s / 5) * R);
      return `${x},${y}`;
    })
    .join(' ');
}

/** Build the axis label position (slightly outside the outer ring). */
function labelPos(i: number): [number, number] {
  const angle = (i / N) * 360;
  return polar(angle, R + 18);
}

interface SpiderProps {
  row: RiskRow;
}

const Spider: React.FC<SpiderProps> = ({ row }) => {
  const scores = AXES.map((a) => row[a.key as AxisKey] as number);
  const color = riskColor(row.Score);

  // Hex color → rgba for fill (0.25 alpha)
  const fillColor = color + '40'; // 0x40 ≈ 0.25 alpha in hex

  return (
    <svg viewBox="0 0 220 220" width="220" height="220" aria-label={`Spider chart for ${row.Node}`}>
      {/* Background rings */}
      {TICK_R.map((r, lvl) => {
        const pts = Array.from({ length: N }, (_, i) => {
          const [x, y] = polar((i / N) * 360, r);
          return `${x},${y}`;
        }).join(' ');
        return (
          <polygon
            key={r}
            points={pts}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={lvl === 4 ? 1.5 : 0.75}
          />
        );
      })}

      {/* Axis spokes */}
      {AXES.map((_, i) => {
        const [x, y] = polar((i / N) * 360, R);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={x}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={dataPolygon(scores)}
        fill={fillColor}
        stroke={color}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {scores.map((s, i) => {
        const [x, y] = polar((i / N) * 360, (s / 5) * R);
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
      })}

      {/* Axis labels */}
      {AXES.map((a, i) => {
        const [lx, ly] = labelPos(i);
        // Anchor: left side → start, right side → end, top/bottom → middle
        const angleDeg = (i / N) * 360;
        const anchor =
          angleDeg < 15 || angleDeg > 345
            ? 'middle'
            : angleDeg < 180
            ? 'start'
            : angleDeg > 180
            ? 'end'
            : 'middle';
        // Wrap label text into up to two lines
        const words = a.label.split(' ');
        const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
        const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="central"
            fontSize="9"
            fill="#6b7280"
            fontFamily="monospace"
          >
            {line2 ? (
              <>
                <tspan x={lx} dy="-0.6em">{line1}</tspan>
                <tspan x={lx} dy="1.2em">{line2}</tspan>
              </>
            ) : (
              line1
            )}
          </text>
        );
      })}

      {/* Ring score labels (1–5) on the first axis) */}
      {TICK_R.map((r, lvl) => {
        const [x, y] = polar(0, r);
        return (
          <text
            key={lvl}
            x={x + 4}
            y={y}
            fontSize="7"
            fill="#9ca3af"
            dominantBaseline="central"
            fontFamily="monospace"
          >
            {lvl + 1}
          </text>
        );
      })}
    </svg>
  );
};

export const RiskPanel: React.FC<Props> = ({ risk }) => {
  const sorted = useMemo(() => [...risk].sort((a, b) => b.Score - a.Score), [risk]);
  const [selectedNode, setSelectedNode] = useState<string>(sorted[0]?.Node ?? '');

  const selectedRow = useMemo(
    () => sorted.find((r) => r.Node === selectedNode) ?? sorted[0],
    [sorted, selectedNode],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Composite risk score (1–5) based on timing variance, tail risk, successor count,
        dependency count, and schedule span. Click a node to inspect its risk profile.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {RISK_LEVELS.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: riskColor(LEGEND_SCORES[i]) }}
            />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Bar list ── */}
        <div className="flex-1 space-y-2 min-w-0">
          {sorted.map((row) => (
            <button
              key={row.Node}
              onClick={() => setSelectedNode(row.Node)}
              className={`w-full flex items-center gap-3 rounded-md px-2 py-1 text-left transition-colors ${
                row.Node === selectedNode
                  ? 'bg-gray-100 ring-1 ring-gray-300'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span
                className="w-52 text-xs text-gray-700 truncate flex-shrink-0"
                title={row.Node}
              >
                {row.Node}
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(row.Score / 5) * 100}%`,
                    backgroundColor: riskColor(row.Score),
                  }}
                />
              </div>
              <span
                className="text-xs font-semibold w-16 text-right flex-shrink-0"
                style={{ color: riskColor(row.Score) }}
              >
                {riskLabel(row.Score)}
              </span>
              <span className="text-xs text-gray-400 w-8 text-right flex-shrink-0">
                {row.Score.toFixed(1)}
              </span>
            </button>
          ))}
        </div>

        {/* ── Spider chart ── */}
        {selectedRow && (
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <p
              className="text-xs font-semibold text-center max-w-[220px] truncate"
              title={selectedRow.Node}
              style={{ color: riskColor(selectedRow.Score) }}
            >
              {selectedRow.Node}
            </p>
            <Spider row={selectedRow} />
            {/* Dimension breakdown table */}
            <div className="w-full max-w-[220px] text-xs text-gray-600 space-y-1">
              {AXES.map((a) => {
                const val = selectedRow[a.key as AxisKey] as number;
                return (
                  <div key={a.key} className="flex items-center gap-2">
                    <span className="w-32 truncate text-gray-500">{a.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(val / 5) * 100}%`,
                          backgroundColor: riskColor(selectedRow.Score),
                          opacity: 0.75,
                        }}
                      />
                    </div>
                    <span className="w-4 text-right font-mono">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};