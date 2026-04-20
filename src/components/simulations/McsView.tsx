import React, { useState, useMemo } from 'react';
import { McsData, SimulationMode, riskColor } from './mcsTypes';
import { DistributionPanel } from './mcs-panels/DistributionPanel';
import { StatsPanel } from './mcs-panels/StatsPanel';
import { RiskPanel } from './mcs-panels/RiskPanel';
import { SensitivityPanel } from './mcs-panels/SensitivityPanel';
import { TechTree } from '@/lib/types';

type McsTab = 'distribution' | 'stats' | 'risk' | 'sensitivity';

interface Props {
  data: McsData;
  mode: SimulationMode;
  techTree: TechTree | null;
  onNodeSelect?: (nodeId: string) => void;
}

export const McsView: React.FC<Props> = ({ data, mode, techTree, onNodeSelect }) => {
  const [activeTab, setActiveTab] = useState<McsTab>('distribution');

  // Build label → id map once
  const labelToId = useMemo(() => {
    if (!techTree) return new Map<string, string>();
    const map = new Map<string, string>();
    for (const node of techTree.nodes) {
      map.set(node.data.label, node.id);
    }
    return map;
  }, [techTree]);

  const tabs = useMemo(() => {
    const base: { key: McsTab; label: string }[] = [
      { key: 'distribution', label: 'Completion Distributions' },
      { key: 'stats',        label: 'Summary Stats' },
      { key: 'risk',         label: 'Risk Assessment' },
    ];
    if (mode === 'option3') base.push({ key: 'sensitivity', label: 'Sensitivity' });
    return base;
  }, [mode]);

  const numIterations = useMemo(() => {
    const firstNode = Object.values(data.distributions)[0];
    if (!firstNode) return 0;
    return Object.values(firstNode).reduce((sum, count) => sum + count, 0);
  }, [data.distributions]);

  const highestRiskNode = useMemo(
    () => [...data.risk].sort((a, b) => b.Score - a.Score)[0],
    [data.risk],
  );

  const highestRiskStat = useMemo(
    () => data.stats.find((s) => s.Node === highestRiskNode?.Node),
    [data.stats, highestRiskNode],
  );

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-4 border">
          <p className="text-xs text-gray-500">Iterations run</p>
          <p className="text-2xl font-bold text-indigo-600">{numIterations}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border">
          <p className="text-xs text-gray-500">Highest risk node</p>
          <p
            className="text-sm font-bold truncate"
            style={{ color: highestRiskNode ? riskColor(highestRiskNode.Score) : '#6b7280' }}
            title={highestRiskNode?.Node}
          >
            {highestRiskNode?.Node ?? '—'}
          </p>
          {highestRiskStat && (
            <p className="text-xs text-gray-500 mt-1">
              {highestRiskStat.succ_count} downstream node{highestRiskStat.succ_count !== 1 ? 's' : ''} affected
            </p>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                activeTab === t.key
                  ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Panel content */}
      <div className="pt-2 min-h-[300px]">
        {activeTab === 'distribution' && (
          <DistributionPanel
            stats={data.stats}
            distributions={data.distributions}
            labelToId={labelToId}
            onNodeSelect={onNodeSelect}
          />
        )}
        {activeTab === 'stats' && (
          <StatsPanel
            stats={data.stats}
            labelToId={labelToId}
            onNodeSelect={onNodeSelect}
          />
        )}
        {activeTab === 'risk' && (
          <RiskPanel
            risk={data.risk}
            labelToId={labelToId}
            onNodeSelect={onNodeSelect}
          />
        )}
        {activeTab === 'sensitivity' && data.sensitivity && (
          <SensitivityPanel
            sensitivity={data.sensitivity}
            labelToId={labelToId}
            onNodeSelect={onNodeSelect}
          />
        )}
      </div>
    </div>
  );
};