import { createEdgeFromNodes } from '@/lib/data';
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
  createEdgeFromNodes(
    QueryUpdateProtocolValueMetricsNode,
    GaiaEfficientlyQueriedAppsNode,
  );

const QueryUpdateProtocolValueMetricsFromCriticalMassRepoEdge: Edge =
  createEdgeFromNodes(
    QueryUpdateProtocolValueMetricsNode,
    CriticalMassRepoNode,
  );

const ModelRepoRobustAdversarialFromCriticalMassRepoEdge: Edge =
  createEdgeFromNodes(ModelRepoRobustAdversarialNode, CriticalMassRepoNode);

const AlgorithmicContributionsRepoFromCriticalMassRepoEdge: Edge =
  createEdgeFromNodes(AlgorithmicContributionsRepoNode, CriticalMassRepoNode);

const NonExpertsContributeModelsValidationFromCriticalMassRepoEdge: Edge =
  createEdgeFromNodes(
    NonExpertsContributeModelsValidationNode,
    CriticalMassRepoNode,
  );

export const LEVEL_3_EDGES: Edge[] = [
  QueryUpdateProtocolValueMetricsFromGaiaEfficientlyQueriedAppsEdge,
  QueryUpdateProtocolValueMetricsFromCriticalMassRepoEdge,
  ModelRepoRobustAdversarialFromCriticalMassRepoEdge,
  AlgorithmicContributionsRepoFromCriticalMassRepoEdge,
  NonExpertsContributeModelsValidationFromCriticalMassRepoEdge,
];
