'use client';

import React, { useMemo, useState } from 'react';
import { RiskRow, riskColor, riskLabel } from '../mcsTypes';

interface Props {
  risk: RiskRow[];
  labelToId: Map<string, string>;
  onNodeSelect?: (nodeId: string) => void;
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
const R = 80;
const TICK_R = [16, 32, 48, 64, 80];

function polar(angleDeg: number, r: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
}

function dataPolygon(scores: number[]): string {
  return scores
    .map((s, i) => {
      const angle = (i / N) * 360;
      const [x, y] = polar(angle, (s / 5) * R);
      return `${x},${y}`;
    })
    .join(' ');
}

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
  const fillColor = color + '40';

  return (
    <svg viewBox="0 0 220 220" width="220" height="220" aria-label={`Spider chart for ${row.Node}`}>
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

      {AXES.map((_, i) => {
        const [x, y] = polar((i / N) * 360, R);
        return (
          <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#e5e7eb" strokeWidth="1" />
        );
      })}

      <polygon
        points={dataPolygon(scores)}
        fill={fillColor}
        stroke={color}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {scores.map((s, i) => {
        const [x, y] = polar((i / N) * 360, (s / 5) * R);
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
      })}

      {AXES.map((a, i) => {
        const [lx, ly] = labelPos(i);
        const angleDeg = (i / N) * 360;
        const anchor =
          angleDeg < 15 || angleDeg > 345
            ? 'middle'
            : angleDeg < 180
            ? 'start'
            : angleDeg > 180
            ? 'end'
            : 'middle';
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

export const RiskPanel: React.FC<Props> = ({ risk, labelToId, onNodeSelect }) => {
  const sorted = useMemo(() => [...risk].sort((a, b) => b.Score - a.Score), [risk]);
  const [selectedNode, setSelectedNode] = useState<string>(sorted[0]?.Node ?? '');
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

  const selectedRow = useMemo(
    () => sorted.find((r) => r.Node === selectedNode) ?? sorted[0],
    [sorted, selectedNode],
  );

  const handleNodeClick = (label: string) => {
    // Always update spider chart selection
    setSelectedNode(label);

    if (!onNodeSelect) return;
    const nodeId = labelToId.get(label);
    if (!nodeId) return;

    if (highlightedNode === label) {
      setHighlightedNode(null);
    } else {
      setHighlightedNode(label);
      onNodeSelect(nodeId);
    }
  };

  const isClickable = !!onNodeSelect;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Composite risk score (1–5) based on timing variance, tail risk, successor count,
        dependency count, and schedule span. Click a node to inspect its risk profile
        {isClickable ? ' and highlight it in the tech tree' : ''}.
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

      {isClickable && (
        <p className="text-xs text-blue-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Click a row to highlight that node and its connections in the tech tree
        </p>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Bar list ── */}
        <div className="flex-1 space-y-2 min-w-0">
          {sorted.map((row) => {
            const isHighlighted = highlightedNode === row.Node;
            const canClick = labelToId.has(row.Node);
            return (
              <button
                key={row.Node}
                onClick={() => handleNodeClick(row.Node)}
                className={`w-full flex items-center gap-3 rounded-md px-2 py-1 text-left transition-colors ${
                  isHighlighted
                    ? 'bg-orange-50 ring-1 ring-orange-300'
                    : row.Node === selectedNode
                    ? 'bg-gray-100 ring-1 ring-gray-300'
                    : canClick
                    ? 'hover:bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span
                  className="w-52 text-xs text-gray-700 truncate flex-shrink-0"
                  title={row.Node}
                >
                  {row.Node}
                  {isHighlighted && (
                    <span className="ml-1 text-orange-500">↗</span>
                  )}
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
            );
          })}
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
              {highlightedNode === selectedRow.Node && (
                <span className="ml-1 text-orange-500">↗</span>
              )}
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