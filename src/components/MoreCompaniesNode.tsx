'use client';

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export interface MoreCompaniesNodeData {
  label: string;
  nodeType: 'moreCompanies';
  parentNodeId: string;
}

interface MoreCompaniesNodeProps extends Omit<NodeProps, 'data'> {
  data: MoreCompaniesNodeData;
  onShowParentCompanies: (parentNodeId: string) => void;
}

export const MoreCompaniesNode: React.FC<MoreCompaniesNodeProps> = ({
  data,
  onShowParentCompanies,
}) => {
  return (
    <div
      className="w-full h-full flex items-center justify-center text-center cursor-pointer select-none"
      onClick={() => onShowParentCompanies(data.parentNodeId)}
      title="View all companies in the side panel"
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <span className="text-sm font-medium text-slate-500 px-2">{data.label}</span>
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
};
