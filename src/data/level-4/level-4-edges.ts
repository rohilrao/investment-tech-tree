import { Edge } from '@xyflow/react';

const GaiaNodesUpdateStateFromGaiaUsefulRepresentationDecisionsEdge: Edge = {
  id: 'gaia-nodes-update-state-FROM-gaia-useful-representation-decisions',
  source: 'gaia-useful-representation-decisions',
  target: 'gaia-nodes-update-state',
};

const GaiaNodesInstantiateLocalModelsFromGaiaUsefulRepresentationDecisionsEdge: Edge =
  {
    id: 'gaia-nodes-instantiate-local-models-FROM-gaia-useful-representation-decisions',
    source: 'gaia-useful-representation-decisions',
    target: 'gaia-nodes-instantiate-local-models',
  };

const GaiaEfficientlyQueriedAppsFromGaiaUsefulRepresentationDecisionsEdge: Edge =
  {
    id: 'gaia-efficiently-queried-apps-FROM-gaia-useful-representation-decisions',
    source: 'gaia-useful-representation-decisions',
    target: 'gaia-efficiently-queried-apps',
  };

const CriticalMassRepoFromGaiaUsefulRepresentationDecisionsEdge: Edge = {
  id: 'critical-mass-repo-FROM-gaia-useful-representation-decisions',
  source: 'gaia-useful-representation-decisions',
  target: 'critical-mass-repo',
};

const CriticalMassRepoFromGaiaVetOwnModelsEdge: Edge = {
  id: 'critical-mass-repo-FROM-gaia-vet-own-models',
  source: 'gaia-vet-own-models',
  target: 'critical-mass-repo',
};

const CriticalMassRepoFromChallengingScenariosModelsCompeteEdge: Edge = {
  id: 'critical-mass-repo-FROM-challenging-scenarios-models-compete',
  source: 'challenging-scenarios-models-compete',
  target: 'critical-mass-repo',
};

const CriticalMassRepoFromGaiaOpenAiBlackBoxesEdge: Edge = {
  id: 'critical-mass-repo-FROM-gaia-open-ai-black-boxes',
  source: 'gaia-open-ai-black-boxes',
  target: 'critical-mass-repo',
};

const CriticalMassRepoFromEnvironmentsTestHumanForEvalEdge: Edge = {
  id: 'critical-mass-repo-FROM-environments-test-human-for-eval',
  source: 'environments-test-human-for-eval',
  target: 'critical-mass-repo',
};

const CriticalMassRepoFromEnvironmentsTestAgentAgentForEvalEdge: Edge = {
  id: 'critical-mass-repo-FROM-environments-test-agent-agent-for-eval',
  source: 'environments-test-agent-agent-for-eval',
  target: 'critical-mass-repo',
};

export const LEVEL_4_EDGES: Edge[] = [
  GaiaNodesUpdateStateFromGaiaUsefulRepresentationDecisionsEdge,
  GaiaNodesInstantiateLocalModelsFromGaiaUsefulRepresentationDecisionsEdge,
  GaiaEfficientlyQueriedAppsFromGaiaUsefulRepresentationDecisionsEdge,
  CriticalMassRepoFromGaiaUsefulRepresentationDecisionsEdge,
  CriticalMassRepoFromGaiaVetOwnModelsEdge,
  CriticalMassRepoFromChallengingScenariosModelsCompeteEdge,
  CriticalMassRepoFromGaiaOpenAiBlackBoxesEdge,
  CriticalMassRepoFromEnvironmentsTestHumanForEvalEdge,
  CriticalMassRepoFromEnvironmentsTestAgentAgentForEvalEdge,
];
