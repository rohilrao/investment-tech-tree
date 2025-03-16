import { createEdgeFromNodes } from '@/lib/data';
import { Edge } from '@xyflow/react';
import {
  AlgorithmicContributionsToRepository,
  ModelRepositoryIsRobustToAdversarialBehavior,
  NonExpertsCanContributeToModelDevelopmentAnd,
} from '../level-3/level-3-nodes';
import { CriticalMassRepo } from '../level-4/level-4-nodes';
import {
  ContributionsAreIncentivizedInAWayThatReflectsThe,
  PlugAndPlaySystemForTestingFeedbackingOnModelsIn,
} from './level-2-nodes';

const ContributionsAreIncentivizedInAWayThatReflectsThe_FROM_ModelRepositoryIsRobustToAdversarialBehavior: Edge =
  createEdgeFromNodes(
    ContributionsAreIncentivizedInAWayThatReflectsThe,
    ModelRepositoryIsRobustToAdversarialBehavior,
  );

const ContributionsAreIncentivizedInAWayThatReflectsThe_FROM_AlgorithmicContributionsToRepository: Edge =
  createEdgeFromNodes(
    ContributionsAreIncentivizedInAWayThatReflectsThe,
    AlgorithmicContributionsToRepository,
  );

const PlugAndPlaySystemForTestingFeedbackingOnModelsIn_FROM_CriticalMassRepo: Edge =
  createEdgeFromNodes(
    PlugAndPlaySystemForTestingFeedbackingOnModelsIn,
    CriticalMassRepo,
  );

const PlugAndPlaySystemForTestingFeedbackingOnModelsIn_FROM_NonExpertsCanContributeToModelDevelopmentAnd: Edge =
  createEdgeFromNodes(
    PlugAndPlaySystemForTestingFeedbackingOnModelsIn,
    NonExpertsCanContributeToModelDevelopmentAnd,
  );

export const LEVEL_2_EDGES: Edge[] = [
  ContributionsAreIncentivizedInAWayThatReflectsThe_FROM_ModelRepositoryIsRobustToAdversarialBehavior,
  ContributionsAreIncentivizedInAWayThatReflectsThe_FROM_AlgorithmicContributionsToRepository,
  PlugAndPlaySystemForTestingFeedbackingOnModelsIn_FROM_CriticalMassRepo,
  PlugAndPlaySystemForTestingFeedbackingOnModelsIn_FROM_NonExpertsCanContributeToModelDevelopmentAnd,
];
