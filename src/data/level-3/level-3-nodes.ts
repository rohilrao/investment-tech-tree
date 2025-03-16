import { NodeLabel, UiNode } from '@/lib/types';

export const QueryUpdateProtocolValueMetricsNode: UiNode = {
  id: 'query-update-protocol-value-metrics',
  data: {
    label: 'Query and update protocol with built-in value metrics',
    description: '',
    nodeLabel: NodeLabel.Technology,
  },
  position: {
    x: -1447.1522064678936,
    y: -498.3498700482025,
  },
  width: 189,
  height: 157,
  className: 'border-blue-500 !rounded-lg',
  type: 'custom',
};

export const ModelRepoRobustAdversarialNode: UiNode = {
  id: 'model-repo-robust-adversarial',
  data: {
    label: 'Model repository is robust to adversarial behavior',
    description: '',
    nodeLabel: NodeLabel.Target,
  },
  position: {
    x: -1438.9832465654354,
    y: -266.2326952606426,
  },
  width: 187,
  height: 148,
};

export const AlgorithmicContributionsRepoNode: UiNode = {
  id: 'algorithmic-contributions-repo',
  data: {
    label: 'Algorithmic contributions to repository',
    description: '',
    nodeLabel: NodeLabel.Technology,
  },
  position: {
    x: -1437.50745695191,
    y: 30.80744324933501,
  },
  width: 182,
  height: 125,
};

export const NonExpertsContributeModelsValidationNode: UiNode = {
  id: 'non-experts-contribute-models-validation',
  data: {
    label: 'Non-experts can contribute to model development and validation',
    description: '',
    nodeLabel: NodeLabel.Target,
  },
  position: {
    x: -1440.4808958342262,
    y: 278.8441472744961,
  },
  width: 195,
  height: 126,
};

export const LEVEL_3_NODES: UiNode[] = [
  QueryUpdateProtocolValueMetricsNode,
  ModelRepoRobustAdversarialNode,
  AlgorithmicContributionsRepoNode,
  NonExpertsContributeModelsValidationNode,
];
