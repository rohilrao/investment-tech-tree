import CustomNode from '@/components/CustomNode';
import { Edge, NodeTypes, Node as ReactFlowNode } from '@xyflow/react';

export interface NodeProperties {
  label: string;
  nodeLabel: NodeLabel;
  description: string;
}

export type UiNode = ReactFlowNode<Record<string, unknown> & NodeProperties>;

export interface NodesAndEdges {
  nodes: UiNode[];
  edges: Edge[];
}

export const NODE_LABELS = ['New', 'Technology', 'Target'] as const;

export type NodeLabel = (typeof NODE_LABELS)[number];

export const LABEL_COLORS: Record<NodeLabel, string> = {
  ['New']: 'red-500',
  ['Technology']: 'blue-500',
  ['Target']: 'green-500',
};

export const NODE_TYPES: NodeTypes = {
  custom: CustomNode,
};
