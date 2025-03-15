import { NodeLabel, UiNode } from '@/lib/types';

export const GaiaNodesUpdateStateNode: UiNode = {
  id: 'gaia-nodes-update-state',
  data: {
    label: 'Gaia nodes update state based on observations',
    description: '',
    nodeLabel: NodeLabel.Target,
  },
  position: {
    x: -1069.6871366914304,
    y: -850.6213555415413,
  },
  width: 238,
  height: 140,
  className: 'border-green-500 !rounded-lg',
  type: 'custom',
};

export const GaiaNodesInstantiateLocalModelsNode: UiNode = {
  id: 'gaia-nodes-instantiate-local-models',
  data: {
    label:
      'Gaia nodes can instantiate local models by assembling components from repository',
    description: '',
    nodeLabel: NodeLabel.Target,
  },
  position: {
    x: -1071.231682031374,
    y: -680.7185137434158,
  },
  width: 241,
  height: 166,
  className: 'border-green-500 !rounded-lg',
  type: 'custom',
};

export const GaiaEfficientlyQueriedAppsNode: UiNode = {
  id: 'gaia-efficiently-queried-apps',
  data: {
    label:
      'Gaia can be efficiently queried in applications, including queries across nodes',
    description: '',
    nodeLabel: NodeLabel.Target,
  },
  position: {
    x: -1065.8419247062825,
    y: -485.49192297239136,
  },
  width: 218,
  height: 124,
  className: 'border-green-500 !rounded-lg',
  type: 'custom',
};

export const CriticalMassRepoNode: UiNode = {
  id: 'critical-mass-repo',
  data: {
    label: 'Critical mass repo',
    description:
      'A repository of high-quality models with critical mass in terms of size and diversity',
    nodeLabel: NodeLabel.Technology,
  },
  position: {
    x: -1030.5387088875286,
    y: 173.54935773250497,
  },
  width: 153,
  height: 123,
  className: 'border-blue-500 !rounded-lg',
  type: 'custom',
};

export const LEVEL_4_NODES: UiNode[] = [
  GaiaNodesUpdateStateNode,
  GaiaNodesInstantiateLocalModelsNode,
  GaiaEfficientlyQueriedAppsNode,
  CriticalMassRepoNode,
];
