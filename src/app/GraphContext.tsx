'use client';

import { NODES } from '@/data/nodes';
import { LABEL_COLORS, UiNode } from '@/lib/types';
import { createContext, ReactNode, useContext, useState } from 'react';

interface GraphContextType {
  nodes: UiNode[];
  setNodes: React.Dispatch<React.SetStateAction<UiNode[]>>;
  selectedNode: UiNode | null;
  setSelectedNode: React.Dispatch<React.SetStateAction<UiNode | null>>;
  isEditable: boolean;
  setIsEditable: React.Dispatch<React.SetStateAction<boolean>>;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export const GraphProvider = ({ children }: { children: ReactNode }) => {
  const [nodes, setNodes] = useState<UiNode[]>([...getEnrichedNodes()]);
  const [selectedNode, setSelectedNode] = useState<UiNode | null>(null);
  const [isEditable, setIsEditable] = useState(false);

  return (
    <GraphContext.Provider
      value={{
        nodes,
        setNodes,
        selectedNode,
        setSelectedNode,
        isEditable,
        setIsEditable,
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
  NODES.map((node) => ({
    ...node,
    className: `border-${LABEL_COLORS[node.data.nodeLabel]} !rounded-lg`,
    type: 'custom',
  }));
