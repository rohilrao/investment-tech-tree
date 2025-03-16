import CustomNode from '@/components/CustomNode';
import { NodeTypes, Node as ReactFlowNode } from '@xyflow/react';

export interface NodeProperties {
  label: string;
  nodeLabel: NodeLabel;
  description: string;
}

export type UiNode = ReactFlowNode<Record<string, unknown> & NodeProperties>;

export enum NodeLabel {
  'New' = 'New',
  'Technology' = 'Technology',
  'Target' = 'Target',
}

export const LABEL_COLORS: Record<NodeLabel, string> = {
  [NodeLabel.New]: 'red-500',
  [NodeLabel.Technology]: 'blue-500',
  [NodeLabel.Target]: 'green-500',
};

export const NODE_TYPES: NodeTypes = {
  custom: CustomNode,
};
