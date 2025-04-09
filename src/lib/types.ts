import { Edge, Node } from '@xyflow/react';

export interface NodeProperties {
  label: string;
  nodeLabel: NodeLabel;
  description: string;
}

export type UiNode = Node<Record<string, unknown> & NodeProperties>;

export type DataNode = Pick<UiNode, 'id' | 'data'>;

export interface NodesAndEdges {
  nodes: DataNode[];
  edges: Edge[];
}

export const NODE_LABELS = ['Technology', 'Target'] as const;

export type NodeLabel = (typeof NODE_LABELS)[number];

export const LABEL_COLORS: Record<NodeLabel, string> = {
  ['Technology']: 'blue-500',
  ['Target']: 'green-500',
};

export const LABEL_COLORS_VARIABLES: Record<NodeLabel, string> = {
  ['Technology']: 'oklch(62.3% 0.214 259.815)',
  ['Target']: 'oklch(72.3% 0.219 149.579)',
};
