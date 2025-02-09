import CustomNode from '@/components/CustomNode';
import { NodeTypes, Node as ReactFlowNode } from '@xyflow/react';
import { Node as Neo4jNode, Relationship } from 'neo4j-driver';

export interface NodeProperties {
  label: string;
  nodeLabel: NodeLabel;
  description: string;
}

export type UiNode = ReactFlowNode<Record<string, unknown> & NodeProperties>;

export type DbNode = Neo4jNode;

// Relationship in Neo4j, Edge in Reactflow
export interface Neo4jTriple {
  source: DbNode;
  relationship: Relationship;
  target: DbNode;
}

export enum NodeLabel {
  'Technology' = 'Technology',
  'Method' = 'Method',
}

export const LABEL_COLORS: Record<NodeLabel, string> = {
  [NodeLabel.Technology]: 'bg-blue-500 text-white',
  [NodeLabel.Method]: 'bg-green-500 text-white',
};

export const NODE_TYPES: NodeTypes = {
  custom: CustomNode,
};