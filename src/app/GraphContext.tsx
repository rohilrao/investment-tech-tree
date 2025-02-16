'use client';

import { UiNode } from '@/lib/types';
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
  const [nodes, setNodes] = useState<UiNode[]>([]);
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
