import { UiNode } from '@/lib/types';

export const GaiaNodesUpdateStateBasedOnObservations: UiNode = {
  id: 'gaia-nodes-update-state-based-on-observations',
  data: {
    label: 'Gaia nodes update state based on observations',
    description: '',
    nodeLabel: 'Target',
  },
  position: {
    x: -1069.6871366914304,
    y: -850.6213555415413,
  },
  width: 238,
  height: 140,
};

export const GaiaNodesCanInstantiateLocalModelsByAssembling: UiNode = {
  id: 'gaia-nodes-can-instantiate-local-models-by-assembling-components-from-repository',
  data: {
    label:
      'Gaia nodes can instantiate local models by assembling components from repository',
    description: '',
    nodeLabel: 'Target',
  },
  position: {
    x: -1071.231682031374,
    y: -680.7185137434158,
  },
  width: 241,
  height: 166,
};

export const GaiaCanBeEfficientlyQueriedInApplicationsIncluding: UiNode = {
  id: 'gaia-can-be-efficiently-queried-in-applications-including-queries-across-nodes',
  data: {
    label:
      'Gaia can be efficiently queried in applications, including queries across nodes',
    description: '',
    nodeLabel: 'Target',
  },
  position: {
    x: -1065.8419247062825,
    y: -485.49192297239136,
  },
  width: 218,
  height: 124,
};

export const CriticalMassRepo: UiNode = {
  id: 'critical-mass-repo',
  data: {
    label: 'Critical mass repo',
    description:
      'A repository of high-quality models with critical mass in terms of size and diversity',
    nodeLabel: 'Technology',
  },
  position: {
    x: -1030.5387088875286,
    y: 173.54935773250497,
  },
  width: 153,
  height: 123,
};

export const LEVEL_4_NODES: UiNode[] = [
  GaiaNodesUpdateStateBasedOnObservations,
  GaiaNodesCanInstantiateLocalModelsByAssembling,
  GaiaCanBeEfficientlyQueriedInApplicationsIncluding,
  CriticalMassRepo,
];
