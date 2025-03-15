import { createEdgeFromNodes } from '@/lib/data';
import { Edge } from '@xyflow/react';
import {
  AlgorithmicContributionsRepoNode,
  ModelRepoRobustAdversarialNode,
  NonExpertsContributeModelsValidationNode,
} from '../level-3/level-3-nodes';
import { CriticalMassRepoNode } from '../level-4/level-4-nodes';
import {
  ContributionsIncentivizedReflectsDecisionValueNode,
  PlugPlaySystemTestingFeedbackingNode,
} from './level-2-nodes';

const ContributionsIncentivizedReflectsDecisionValueFromAlgorithmicContributionsRepoEdge: Edge =
  createEdgeFromNodes(
    ContributionsIncentivizedReflectsDecisionValueNode,
    AlgorithmicContributionsRepoNode,
  );

const ContributionsIncentivizedReflectsDecisionValueFromModelRepoRobustAdversarialEdge: Edge =
  createEdgeFromNodes(
    ContributionsIncentivizedReflectsDecisionValueNode,
    ModelRepoRobustAdversarialNode,
  );

const PlugPlaySystemTestingFeedbackingFromCriticalMassRepoEdge: Edge =
  createEdgeFromNodes(
    PlugPlaySystemTestingFeedbackingNode,
    CriticalMassRepoNode,
  );

const PlugPlaySystemTestingFeedbackingFromNonExpertsContributeModelsValidationEdge: Edge =
  createEdgeFromNodes(
    PlugPlaySystemTestingFeedbackingNode,
    NonExpertsContributeModelsValidationNode,
  );

export const LEVEL_2_EDGES: Edge[] = [
  ContributionsIncentivizedReflectsDecisionValueFromAlgorithmicContributionsRepoEdge,
  ContributionsIncentivizedReflectsDecisionValueFromModelRepoRobustAdversarialEdge,
  PlugPlaySystemTestingFeedbackingFromCriticalMassRepoEdge,
  PlugPlaySystemTestingFeedbackingFromNonExpertsContributeModelsValidationEdge,
];
