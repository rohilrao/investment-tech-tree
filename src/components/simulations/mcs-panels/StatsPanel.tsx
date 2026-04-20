import React, { useMemo, useState } from 'react';
import { NodeStat } from '../mcsTypes';

interface Props {
  stats: NodeStat[];
  labelToId: Map<string, string>;
  onNodeSelect?: (nodeId: string) => void;
}

const COLUMNS = [
  { key: 'Node',       label: 'Node',      align: 'left'   },
  { key: 'mean',       label: 'Mean yr',   align: 'right'  },
  { key: 'median',     label: 'Median',    align: 'right'  },
  { key: 'std',        label: 'Std dev',   align: 'right'  },
  { key: 'q05',        label: 'P5',        align: 'right'  },
  { key: 'q95',        label: 'P95',       align: 'right'  },
  { key: 'span',       label: 'Span',      align: 'right'  },
  { key: 'dep_count',  label: 'Deps',      align: 'center' },
  { key: 'succ_count', label: 'Succs',     align: 'center' },
] as const;

export const StatsPanel: React.FC<Props> = ({ stats, labelToId, onNodeSelect }) => {
  const sorted = useMemo(() => [...stats].sort((a, b) => a.mean - b.mean), [stats]);
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

  const handleRowClick = (label: string) => {
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
    <div className="overflow-x-auto">
      <p className="text-sm text-gray-500 mb-1">
        Sorted by mean completion year (earliest first). All years are calendar years.
      </p>
      {isClickable && (
        <p className="text-xs text-blue-600 mb-3 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Click a row to highlight that node in the tech tree
        </p>
      )}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-2 font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap text-${col.align}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const isHighlighted = highlightedNode === row.Node;
            const canClick = isClickable && labelToId.has(row.Node);
            return (
              <tr
                key={row.Node}
                onClick={() => canClick && handleRowClick(row.Node)}
                className={`border-b border-gray-100 transition-colors ${
                  canClick ? 'cursor-pointer' : ''
                } ${
                  isHighlighted
                    ? 'bg-orange-50 ring-1 ring-inset ring-orange-300'
                    : canClick
                    ? i % 2 === 0
                      ? 'bg-white hover:bg-blue-50'
                      : 'bg-gray-50 hover:bg-blue-50'
                    : i % 2 === 0
                    ? 'bg-white'
                    : 'bg-gray-50'
                }`}
              >
                <td className="px-3 py-2 font-medium text-gray-800 max-w-[220px]" title={row.Node}>
                  <span className="block truncate">{row.Node}</span>
                  {isHighlighted && (
                    <span className="text-xs text-orange-500 font-normal">↗ highlighted</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right text-gray-600">{Math.round(row.mean)}</td>
                <td className="px-3 py-2 text-right text-gray-600">{Math.round(row.median)}</td>
                <td className="px-3 py-2 text-right text-gray-600">{row.std.toFixed(2)}</td>
                <td className="px-3 py-2 text-right text-gray-600">{Math.round(row.q05)}</td>
                <td className="px-3 py-2 text-right text-gray-600">{Math.round(row.q95)}</td>
                <td className="px-3 py-2 text-right text-gray-600">{row.span.toFixed(1)}</td>
                <td className="px-3 py-2 text-center text-gray-600">{row.dep_count}</td>
                <td className="px-3 py-2 text-center text-gray-600">{row.succ_count}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};