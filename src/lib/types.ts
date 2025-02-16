import CustomNode from '@/components/CustomNode';
import { NodeTypes, Node as ReactFlowNode } from '@xyflow/react';
import { Node as Neo4jNode, Relationship } from 'neo4j-driver';

export interface NodeProperties {
  label: string;
  nodeLabel: NodeLabel;
  description: string;
}

export type UiNode = ReactFlowNode<Record<string, unknown> & NodeProperties>;

export type DbNode = Omit<Neo4jNode, "identity">;

export interface Neo4jTriple {
  source: DbNode;
  relationship: Relationship;
  target: DbNode;
}

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
export const RETURNED_NODE_ALIAS = 'returnedNode';
export const RETURNED_ID_ALIAS = 'elementId';

export enum QueryType {
  GET_NODES_AND_EDGES = 'GET_NODES_AND_EDGES',
  CREATE_NODE = 'CREATE_NODE',
  UPDATE_NODE_CONTENT = 'UPDATE_NODE_CONTENT',
  UPDATE_NODE_CONTENT_AND_EMBEDDING = 'UPDATE_NODE_CONTENT_WITH_EMBEDDING',
  UPDATE_NODE_POSITION = 'UPDATE_NODE_POSITION',
  UPDATE_NODE_SIZE = 'UPDATE_NODE_SIZE',
  DELETE_NODE = 'DELETE_NODE',
  CREATE_EDGE = 'CREATE_EDGE',
  DELETE_EDGE = 'DELETE_EDGE',
  EXPORT = 'EXPORT'
}

export const QueryTypeMessage: Record<QueryType, string> = {
  [QueryType.GET_NODES_AND_EDGES]: 'Error while getting nodes and edges',
  [QueryType.CREATE_NODE]: 'Error while creating node',
  [QueryType.UPDATE_NODE_CONTENT]: 'Error while updating node content',
  [QueryType.UPDATE_NODE_CONTENT_AND_EMBEDDING]:
    'Error while updating node content with embedding',
  [QueryType.UPDATE_NODE_POSITION]: 'Error while updating node position',
  [QueryType.UPDATE_NODE_SIZE]: 'Error while updating node size',
  [QueryType.DELETE_NODE]: 'Error while deleting node',
  [QueryType.CREATE_EDGE]: 'Error while creating edge',
  [QueryType.DELETE_EDGE]: 'Error while deleting edge',
  [QueryType.EXPORT]: 'Error while exporting graph'
};
