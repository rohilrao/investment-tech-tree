import { createEdgeFromNodes } from '@/lib/data';
import { Edge } from '@xyflow/react';
import { PlugAndPlaySystemForTestingFeedbackingOnModelsIn } from '../level-2/level-2-nodes';
import { AlgorithmicContributionsToRepository } from '../level-3/level-3-nodes';
import { MiniGaiaRepoForADefinedDomain } from './level-1-nodes';

const MiniGaiaRepoForADefinedDomain_FROM_AlgorithmicContributionsToRepository: Edge =
  createEdgeFromNodes(
    MiniGaiaRepoForADefinedDomain,
    AlgorithmicContributionsToRepository,
  );

const MiniGaiaRepoForADefinedDomain_FROM_PlugAndPlaySystemForTestingFeedbackingOnModelsIn: Edge =
  createEdgeFromNodes(
    MiniGaiaRepoForADefinedDomain,
    PlugAndPlaySystemForTestingFeedbackingOnModelsIn,
  );

export const LEVEL_1_EDGES = [
  MiniGaiaRepoForADefinedDomain_FROM_AlgorithmicContributionsToRepository,
  MiniGaiaRepoForADefinedDomain_FROM_PlugAndPlaySystemForTestingFeedbackingOnModelsIn,
];
