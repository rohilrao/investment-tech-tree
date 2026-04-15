import React, { useMemo } from 'react';
import { SensitivityRow } from '../mcsTypes';

interface Props {
  sensitivity: SensitivityRow[];
}

export const SensitivityPanel: React.FC<Props> = ({ sensitivity }) => {
  const sorted = useMemo(
    () =>
      [...sensitivity]
        .filter((r) => r.YearsPerTRL_rho !== null || r.RandomDelay_rho !== null)
        .sort(
          (a, b) =>
            Math.abs(b.YearsPerTRL_rho ?? 0) + Math.abs(b.RandomDelay_rho ?? 0) -
            (Math.abs(a.YearsPerTRL_rho ?? 0) + Math.abs(a.RandomDelay_rho ?? 0)),
        ),
    [sensitivity],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Spearman rank correlation (ρ) between each uncertainty input and a node's completion
        year. A higher absolute value means that input drives more of the timing variance.
        Positive ρ = later completion when the input is larger.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 font-semibold text-gray-700 border-b border-gray-200 text-left">
                Node
              </th>
              <th className="px-3 py-2 font-semibold text-gray-700 border-b border-gray-200 text-right">
                Global delay ρ
              </th>
              <th className="px-3 py-2 font-semibold text-gray-700 border-b border-gray-200 text-right">
                Local delay ρ
              </th>
              <th className="px-3 py-2 font-semibold text-gray-700 border-b border-gray-200 text-center">
                Dominant driver
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const g = row.YearsPerTRL_rho ?? 0;
              const l = row.RandomDelay_rho ?? 0;
              const dominant = Math.abs(g) >= Math.abs(l) ? 'Global' : 'Local';

              return (
                <tr
                  key={row.Node}
                  className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td
                    className="px-3 py-2 font-medium text-gray-800 max-w-[220px] truncate"
                    title={row.Node}
                  >
                    {row.Node}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className="font-mono"
                      style={{ color: g >= 0 ? '#3b82f6' : '#ef4444' }}
                    >
                      {g.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className="font-mono"
                      style={{ color: l >= 0 ? '#3b82f6' : '#ef4444' }}
                    >
                      {l.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        dominant === 'Global'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {dominant}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};