import { createEdgeFromNodes } from '@/lib/data';
import { Edge } from '@xyflow/react';
import {
  AlgorithmicContributionsToRepositoryNode,
  ModelRepositoryIsRobustToAdversarialBehaviorNode,
  NonexpertsCanContributeToModelDevelopmentAndNode,
} from '../level-3/level-3-nodes';
import { CriticalMassRepoNode } from '../level-4/level-4-nodes';
import {
  ContributionsAreIncentivizedInAWayThatReflectsNode,
  PlugAndPlaySystemForTestingFeedbackingOnModelsNode,
} from './level-2-nodes';

const ContributionsIncentivizedReflectsDecisionValueFromAlgorithmicContributionsRepoEdge: Edge =
  createEdgeFromNodes(
    ContributionsAreIncentivizedInAWayThatReflectsNode,
    AlgorithmicContributionsToRepositoryNode,
  );

const ContributionsIncentivizedReflectsDecisionValueFromModelRepoRobustAdversarialEdge: Edge =
  createEdgeFromNodes(
    ContributionsAreIncentivizedInAWayThatReflectsNode,
    ModelRepositoryIsRobustToAdversarialBehaviorNode,
  );

const PlugPlaySystemTestingFeedbackingFromCriticalMassRepoEdge: Edge =
  createEdgeFromNodes(
    PlugAndPlaySystemForTestingFeedbackingOnModelsNode,
    CriticalMassRepoNode,
  );

const PlugPlaySystemTestingFeedbackingFromNonExpertsContributeModelsValidationEdge: Edge =
  createEdgeFromNodes(
    PlugAndPlaySystemForTestingFeedbackingOnModelsNode,
    NonexpertsCanContributeToModelDevelopmentAndNode,
  );

export const LEVEL_2_EDGES: Edge[] = [
  ContributionsIncentivizedReflectsDecisionValueFromAlgorithmicContributionsRepoEdge,
  ContributionsIncentivizedReflectsDecisionValueFromModelRepoRobustAdversarialEdge,
  PlugPlaySystemTestingFeedbackingFromCriticalMassRepoEdge,
  PlugPlaySystemTestingFeedbackingFromNonExpertsContributeModelsValidationEdge,
];
