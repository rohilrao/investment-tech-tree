import { Node } from 'reactflow';

export interface SkillTreeNode extends Node {
  data: {
    name: string;
    description?: string;
    level: number;
  };
}


// in neo4j muss der name=name sein, in neo4-driver = label... annoying
export interface SkillTreeNodeNeo extends Node {
  data: {
    label: string;
    description?: string;
    level: number;
  };
}

export type EdgeProps = {
  id: string;
  source: string;
  target: string;
  type: string;
};
