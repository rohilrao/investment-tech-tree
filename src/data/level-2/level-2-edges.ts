import { createEdge } from '@/lib/data';
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
  createEdge(
    ContributionsIncentivizedReflectsDecisionValueNode,
    AlgorithmicContributionsRepoNode,
  );

const ContributionsIncentivizedReflectsDecisionValueFromModelRepoRobustAdversarialEdge: Edge =
  createEdge(
    ContributionsIncentivizedReflectsDecisionValueNode,
    ModelRepoRobustAdversarialNode,
  );

const PlugPlaySystemTestingFeedbackingFromCriticalMassRepoEdge: Edge =
  createEdge(PlugPlaySystemTestingFeedbackingNode, CriticalMassRepoNode);

const PlugPlaySystemTestingFeedbackingFromNonExpertsContributeModelsValidationEdge: Edge =
  createEdge(
    PlugPlaySystemTestingFeedbackingNode,
    NonExpertsContributeModelsValidationNode,
  );

export const LEVEL_2_EDGES: Edge[] = [
  ContributionsIncentivizedReflectsDecisionValueFromAlgorithmicContributionsRepoEdge,
  ContributionsIncentivizedReflectsDecisionValueFromModelRepoRobustAdversarialEdge,
  PlugPlaySystemTestingFeedbackingFromCriticalMassRepoEdge,
  PlugPlaySystemTestingFeedbackingFromNonExpertsContributeModelsValidationEdge,
];
