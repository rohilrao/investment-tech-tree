import { Edge, Node } from '@xyflow/react';

export interface NodeProperties {
  label: string;
  nodeLabel: NodeLabel;
  description: string;
  detailedDescription?: string; // Detailed description for AI context
  references?: string[];
  // Group-related properties
  isGroup?: boolean;
  isExpanded?: boolean;
  childNodeIds?: string[];
  infact_analysis?: any;
  infact_analysis_html_content?: string;
  infact_status?: string;
}

export type UiNode = Node<Record<string, unknown> & NodeProperties>;

export type DataNode = Pick<UiNode, 'id' | 'data'>;

export interface TechTree {
  nodes: DataNode[];
  edges: Edge[];
}

export interface HighlightedElements {
  nodeIds: Set<string>;
  edgeIds: Set<string>;
}

export const NODE_LABELS = [
  'ReactorConcept',
  'Milestone',
  'EnablingTechnology',
] as const;

export type NodeLabel = (typeof NODE_LABELS)[number];

export const LABEL_COLORS: Record<NodeLabel, string> = {
  ['ReactorConcept']: 'blue-500',
  ['Milestone']: 'green-500',
  ['EnablingTechnology']: 'red-500',
};

export const LABEL_COLORS_VARIABLES: Record<NodeLabel, string> = {
  ['ReactorConcept']: 'oklch(62.3% 0.214 259.815)',
  ['Milestone']: 'oklch(72.3% 0.219 149.579)',
  ['EnablingTechnology']: 'oklch(0.637 0.237 25.331)',
};

export interface InvestTechTreeNode {
  id: string;
  label: string;
  type: NodeLabel;
  category?: string;
  subtype?: string;
  trl_current?: string;
  trl_projected_5_10_years?: string;
  references: string[];
  detailedDescription?: string;
  subTypeOf?: string;
}

export interface InvestTechTreeEdge {
  id: string;
  source: string;
  target: string;
}

export interface InvestTechTreeGraph {
  nodes: InvestTechTreeNode[];
  edges: InvestTechTreeEdge[];
}

// Chat-related types
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatHistory {
  messages: ChatMessage[];
  lastUpdated: number;
}

// Grouping-related types
export type GroupingMode = NodeLabel | 'None';

export interface GroupNode {
  id: string;
  type: 'group';
  groupType: NodeLabel;
  isExpanded: boolean;
  childNodeIds: string[];
}

export interface GroupState {
  mode: GroupingMode;
  expandedGroups: Set<string>;
}

// Company-related types
export interface CompanyInfo {
  id: string;
  canonical_name: string;
  country_iso?: string | null;
  country_tier?: number | null;
  country_tier_label?: string | null;
  trl_level?: number | null;
  trl_band?: string | null;
  trl_confidence?: number | null;
  primary_approach?: string | null;
  all_approaches?: string[];
  tech_tree_primary_node?: string | null;
  key_investors?: string[];
  manufacturing_countries?: string[];
  critical_material_deps?: string[];
  ownership_top_shareholders?: string[];
  is_primary?: boolean;
  relation_confidence?: number | null;
  relation_method?: string | null;
  relation_reasoning?: string | null;
  [key: string]: unknown;
}

export interface CompanyNodeData {
  label: string;
  nodeType: 'company';
  company: CompanyInfo;
  parentNodeId: string;
}