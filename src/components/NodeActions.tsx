'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface NodeActionsProps {
  nodeId: string;
  onShowDetails: (nodeId: string) => void;
  onShowConnected: (nodeId: string) => void;
  onShowCompanies?: (nodeId: string) => void;
  companiesExpanded?: boolean;
}

export const NodeActions: React.FC<NodeActionsProps> = ({
  nodeId,
  onShowDetails,
  onShowConnected,
  onShowCompanies,
  companiesExpanded,
}) => {
  const handleShowDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShowDetails(nodeId);
  };

  const handleShowConnected = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShowConnected(nodeId);
  };

  const handleShowCompanies = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShowCompanies?.(nodeId);
  };

  return (
    <div className="flex gap-1 opacity-100">
      {onShowCompanies && (
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 border shadow-sm ${
            companiesExpanded
              ? 'bg-gray-200 border-gray-400 hover:bg-gray-300'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
          onClick={handleShowCompanies}
          title={companiesExpanded ? 'Hide Linked Companies' : 'Show Linked Companies'}
        >
          {/* Building / company icon */}
          <svg
            className="h-3 w-3 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
        onClick={handleShowDetails}
        title="Show Node Details"
      >
        <svg
          className="h-3 w-3 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
        onClick={handleShowConnected}
        title="Show Connected Nodes Only"
      >
        <svg
          className="h-3 w-3 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      </Button>
    </div>
  );
};
