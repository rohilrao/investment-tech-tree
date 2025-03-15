import { createEdge } from '@/lib/data';
import { Edge } from '@xyflow/react';
import {
  CriticalMassRepoNode,
  GaiaEfficientlyQueriedAppsNode,
} from '../level-4/level-4-nodes';
import {
  AlgorithmicContributionsRepoNode,
  ModelRepoRobustAdversarialNode,
  NonExpertsContributeModelsValidationNode,
  QueryUpdateProtocolValueMetricsNode,
} from './level-3-nodes';

const QueryUpdateProtocolValueMetricsFromGaiaEfficientlyQueriedAppsEdge: Edge =
  createEdge(
    QueryUpdateProtocolValueMetricsNode,
    GaiaEfficientlyQueriedAppsNode,
  );

const QueryUpdateProtocolValueMetricsFromCriticalMassRepoEdge: Edge =
  createEdge(QueryUpdateProtocolValueMetricsNode, CriticalMassRepoNode);

const ModelRepoRobustAdversarialFromCriticalMassRepoEdge: Edge = createEdge(
  ModelRepoRobustAdversarialNode,
  CriticalMassRepoNode,
);

const AlgorithmicContributionsRepoFromCriticalMassRepoEdge: Edge = createEdge(
  AlgorithmicContributionsRepoNode,
  CriticalMassRepoNode,
);

const NonExpertsContributeModelsValidationFromCriticalMassRepoEdge: Edge =
  createEdge(NonExpertsContributeModelsValidationNode, CriticalMassRepoNode);

export const LEVEL_3_EDGES: Edge[] = [
  QueryUpdateProtocolValueMetricsFromGaiaEfficientlyQueriedAppsEdge,
  QueryUpdateProtocolValueMetricsFromCriticalMassRepoEdge,
  ModelRepoRobustAdversarialFromCriticalMassRepoEdge,
  AlgorithmicContributionsRepoFromCriticalMassRepoEdge,
  NonExpertsContributeModelsValidationFromCriticalMassRepoEdge,
];
