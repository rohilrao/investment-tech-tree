import { createEdgeFromNodes } from '@/lib/data';
import { Edge } from '@xyflow/react';
import { PlugAndPlaySystemForTestingFeedbackingOnModelsNode } from '../level-2/level-2-nodes';
import { AlgorithmicContributionsToRepositoryNode } from '../level-3/level-3-nodes';
import { MinigaiaRepoForADefinedDomainNode } from './level-1-nodes';

const MiniGaiaRepoDefinedDomainFromAlgorithmicContributionsRepoEdge: Edge =
  createEdgeFromNodes(
    MinigaiaRepoForADefinedDomainNode,
    AlgorithmicContributionsToRepositoryNode,
  );

const MiniGaiaRepoDefinedDomainFromPlugPlaySystemTestingFeedbackingEdge: Edge =
  createEdgeFromNodes(
    MinigaiaRepoForADefinedDomainNode,
    PlugAndPlaySystemForTestingFeedbackingOnModelsNode,
  );

export const LEVEL_1_EDGES = [
  MiniGaiaRepoDefinedDomainFromAlgorithmicContributionsRepoEdge,
  MiniGaiaRepoDefinedDomainFromPlugPlaySystemTestingFeedbackingEdge,
];
