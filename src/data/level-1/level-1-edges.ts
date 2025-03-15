import { createEdgeFromNodes } from '@/lib/data';
import { Edge } from '@xyflow/react';
import { PlugPlaySystemTestingFeedbackingNode } from '../level-2/level-2-nodes';
import { AlgorithmicContributionsRepoNode } from '../level-3/level-3-nodes';
import { MiniGaiaRepoDefinedDomainNode } from './level-1-nodes';

const MiniGaiaRepoDefinedDomainFromAlgorithmicContributionsRepoEdge: Edge =
  createEdgeFromNodes(
    MiniGaiaRepoDefinedDomainNode,
    AlgorithmicContributionsRepoNode,
  );

const MiniGaiaRepoDefinedDomainFromPlugPlaySystemTestingFeedbackingEdge: Edge =
  createEdgeFromNodes(
    MiniGaiaRepoDefinedDomainNode,
    PlugPlaySystemTestingFeedbackingNode,
  );

export const LEVEL_1_EDGES = [
  MiniGaiaRepoDefinedDomainFromAlgorithmicContributionsRepoEdge,
  MiniGaiaRepoDefinedDomainFromPlugPlaySystemTestingFeedbackingEdge,
];
