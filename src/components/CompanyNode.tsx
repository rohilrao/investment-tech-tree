'use client';

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CompanyNodeData } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface CompanyNodeProps extends Omit<NodeProps, 'data'> {
  data: CompanyNodeData;
  onShowCompanyDetails: (companyId: string) => void;
}

export const CompanyNode: React.FC<CompanyNodeProps> = ({
  data,
  onShowCompanyDetails,
}) => {
  return (
    <div className="w-full h-full relative">
      <Handle type="target" position={Position.Left} className="opacity-0" />

      <div className="w-full h-full flex items-center justify-center text-center px-1 text-sm font-medium overflow-hidden">
        <span className="line-clamp-3 break-words" title={data.label}>
          {data.label}
        </span>
      </div>

      <Handle type="source" position={Position.Right} className="opacity-0" />

      {/* Action buttons — same position as CustomNode (bottom-right, translated outside) */}
      <div className="absolute bottom-14 right-0 transform translate-x-2 -translate-y-2 z-10 pointer-events-auto">
        <div className="flex gap-1 opacity-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
            onClick={(e) => {
              e.stopPropagation();
              onShowCompanyDetails(data.company.id);
            }}
            title="Show Company Details"
          >
            <svg className="h-3 w-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};
