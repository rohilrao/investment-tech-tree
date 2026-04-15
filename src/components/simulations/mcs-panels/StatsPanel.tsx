import React, { useMemo } from 'react';
import { NodeStat } from '../mcsTypes';

interface Props {
  stats: NodeStat[];
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

export const StatsPanel: React.FC<Props> = ({ stats }) => {
  const sorted = useMemo(() => [...stats].sort((a, b) => a.mean - b.mean), [stats]);

  return (
    <div className="overflow-x-auto">
      <p className="text-sm text-gray-500 mb-3">
        Sorted by mean completion year (earliest first). All years are calendar years.
      </p>
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
          {sorted.map((row, i) => (
            <tr
              key={row.Node}
              className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <td className="px-3 py-2 font-medium text-gray-800 max-w-[220px] truncate" title={row.Node}>
                {row.Node}
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
          ))}
        </tbody>
      </table>
    </div>
  );
};