import React, { useMemo } from 'react';
import { RiskRow, riskColor, riskLabel } from '../mcsTypes';

interface Props {
  risk: RiskRow[];
}

const RISK_LEVELS = ['Very Low', 'Low', 'Medium', 'High', 'Very High'] as const;
const LEGEND_SCORES = [1.0, 2.0, 3.0, 4.0, 5.0];

export const RiskPanel: React.FC<Props> = ({ risk }) => {
  const sorted = useMemo(() => [...risk].sort((a, b) => b.Score - a.Score), [risk]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Composite risk score (1–5) based on timing variance, tail risk, successor count,
        dependency count, and schedule span. Sorted highest to lowest.
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

      {/* Bars */}
      <div className="space-y-2">
        {sorted.map((row) => (
          <div key={row.Node} className="flex items-center gap-3">
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
          </div>
        ))}
      </div>
    </div>
  );
};