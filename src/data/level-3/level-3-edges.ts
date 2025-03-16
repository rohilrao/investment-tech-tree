import { createEdgeFromNodes } from '@/lib/data';
import { Edge } from '@xyflow/react';
import {
  CriticalMassRepoNode,
  GaiaCanBeEfficientlyQueriedInApplicationsNode,
} from '../level-4/level-4-nodes';
import {
  AlgorithmicContributionsToRepositoryNode,
  ModelRepositoryIsRobustToAdversarialBehaviorNode,
  NonexpertsCanContributeToModelDevelopmentAndNode,
  QueryAndUpdateProtocolWithBuiltinValueMetricsNode,
} from './level-3-nodes';

const QueryUpdateProtocolValueMetricsFromGaiaEfficientlyQueriedAppsEdge: Edge =
  createEdgeFromNodes(
    QueryAndUpdateProtocolWithBuiltinValueMetricsNode,
    GaiaCanBeEfficientlyQueriedInApplicationsNode,
  );

const QueryUpdateProtocolValueMetricsFromCriticalMassRepoEdge: Edge =
  createEdgeFromNodes(
    QueryAndUpdateProtocolWithBuiltinValueMetricsNode,
    CriticalMassRepoNode,
  );

const ModelRepoRobustAdversarialFromCriticalMassRepoEdge: Edge =
  createEdgeFromNodes(
    ModelRepositoryIsRobustToAdversarialBehaviorNode,
    CriticalMassRepoNode,
  );

const AlgorithmicContributionsRepoFromCriticalMassRepoEdge: Edge =
  createEdgeFromNodes(
    AlgorithmicContributionsToRepositoryNode,
    CriticalMassRepoNode,
  );

const NonExpertsContributeModelsValidationFromCriticalMassRepoEdge: Edge =
  createEdgeFromNodes(
    NonexpertsCanContributeToModelDevelopmentAndNode,
    CriticalMassRepoNode,
  );

export const LEVEL_3_EDGES: Edge[] = [
  QueryUpdateProtocolValueMetricsFromGaiaEfficientlyQueriedAppsEdge,
  QueryUpdateProtocolValueMetricsFromCriticalMassRepoEdge,
  ModelRepoRobustAdversarialFromCriticalMassRepoEdge,
  AlgorithmicContributionsRepoFromCriticalMassRepoEdge,
  NonExpertsContributeModelsValidationFromCriticalMassRepoEdge,
];
