import { createEdgeFromNodes } from '@/lib/data';
import { Edge } from '@xyflow/react';
import {
  CriticalMassRepo,
  GaiaCanBeEfficientlyQueriedInApplicationsIncluding,
} from '../level-4/level-4-nodes';
import {
  AlgorithmicContributionsToRepository,
  ModelRepositoryIsRobustToAdversarialBehavior,
  NonExpertsCanContributeToModelDevelopmentAnd,
  QueryAndUpdateProtocolWithBuiltInValueMetrics,
} from './level-3-nodes';

const QueryAndUpdateProtocolWithBuiltInValueMetrics_FROM_GaiaCanBeEfficientlyQueriedInApplicationsIncluding: Edge =
  createEdgeFromNodes(
    QueryAndUpdateProtocolWithBuiltInValueMetrics,
    GaiaCanBeEfficientlyQueriedInApplicationsIncluding,
  );

const QueryAndUpdateProtocolWithBuiltInValueMetrics_FROM_CriticalMassRepo: Edge =
  createEdgeFromNodes(
    QueryAndUpdateProtocolWithBuiltInValueMetrics,
    CriticalMassRepo,
  );

const ModelRepositoryIsRobustToAdversarialBehavior_FROM_CriticalMassRepo: Edge =
  createEdgeFromNodes(
    ModelRepositoryIsRobustToAdversarialBehavior,
    CriticalMassRepo,
  );

const AlgorithmicContributionsToRepository_FROM_CriticalMassRepo: Edge =
  createEdgeFromNodes(AlgorithmicContributionsToRepository, CriticalMassRepo);

const NonExpertsCanContributeToModelDevelopmentAnd_FROM_CriticalMassRepo: Edge =
  createEdgeFromNodes(
    NonExpertsCanContributeToModelDevelopmentAnd,
    CriticalMassRepo,
  );

export const LEVEL_3_EDGES: Edge[] = [
  QueryAndUpdateProtocolWithBuiltInValueMetrics_FROM_GaiaCanBeEfficientlyQueriedInApplicationsIncluding,
  QueryAndUpdateProtocolWithBuiltInValueMetrics_FROM_CriticalMassRepo,
  ModelRepositoryIsRobustToAdversarialBehavior_FROM_CriticalMassRepo,
  AlgorithmicContributionsToRepository_FROM_CriticalMassRepo,
  NonExpertsCanContributeToModelDevelopmentAnd_FROM_CriticalMassRepo,
];
