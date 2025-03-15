import { Edge } from '@xyflow/react';

const QueryUpdateProtocolValueMetricsFromGaiaEfficientlyQueriedAppsEdge: Edge =
  {
    id: 'query-update-protocol-value-metrics-FROM-gaia-efficiently-queried-apps',
    source: 'gaia-efficiently-queried-apps',
    target: 'query-update-protocol-value-metrics',
  };

const QueryUpdateProtocolValueMetricsFromCriticalMassRepoEdge: Edge = {
  id: 'query-update-protocol-value-metrics-FROM-critical-mass-repo',
  source: 'critical-mass-repo',
  target: 'query-update-protocol-value-metrics',
};

const ModelRepoRobustAdversarialFromCriticalMassRepoEdge: Edge = {
  id: 'model-repo-robust-adversarial-FROM-critical-mass-repo',
  source: 'critical-mass-repo',
  target: 'model-repo-robust-adversarial',
};

const AlgorithmicContributionsRepoFromCriticalMassRepoEdge: Edge = {
  id: 'algorithmic-contributions-repo-FROM-critical-mass-repo',
  source: 'critical-mass-repo',
  target: 'algorithmic-contributions-repo',
};

const NonExpertsContributeModelsValidationFromCriticalMassRepoEdge: Edge = {
  id: 'non-experts-contribute-models-validation-FROM-critical-mass-repo',
  source: 'critical-mass-repo',
  target: 'non-experts-contribute-models-validation',
};

export const LEVEL_3_EDGES: Edge[] = [
  QueryUpdateProtocolValueMetricsFromGaiaEfficientlyQueriedAppsEdge,
  QueryUpdateProtocolValueMetricsFromCriticalMassRepoEdge,
  ModelRepoRobustAdversarialFromCriticalMassRepoEdge,
  AlgorithmicContributionsRepoFromCriticalMassRepoEdge,
  NonExpertsContributeModelsValidationFromCriticalMassRepoEdge,
];
