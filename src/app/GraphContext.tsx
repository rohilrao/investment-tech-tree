'use client';

import { DATA } from '@/data/DATA';
import { LABEL_COLORS, UiNode } from '@/lib/types';
import { createContext, ReactNode, useContext, useState } from 'react';

interface GraphContextType {
  nodes: UiNode[];
  setNodes: React.Dispatch<React.SetStateAction<UiNode[]>>;
  selectedNode: UiNode | null;
  setSelectedNode: React.Dispatch<React.SetStateAction<UiNode | null>>;
  isEditable: boolean;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export const GraphProvider = ({ children }: { children: ReactNode }) => {
  const [nodes, setNodes] = useState<UiNode[]>([...getEnrichedNodes()]);
  const [selectedNode, setSelectedNode] = useState<UiNode | null>(null);
  const isEditable = process.env.NEXT_PUBLIC_ENVIRONMENT === 'development';

  return (
    <GraphContext.Provider
      value={{
        nodes,
        setNodes,
        selectedNode,
        setSelectedNode,
        isEditable,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export const useGraphContext = () => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraph must be used within a GraphProvider');
  }
  return context;
};

const getEnrichedNodes = (): UiNode[] =>
  DATA.nodes.map((node) => ({
    ...node,
    className: `border-${LABEL_COLORS[node.data.nodeLabel]} !rounded-lg`,
    type: 'custom',
  }));
