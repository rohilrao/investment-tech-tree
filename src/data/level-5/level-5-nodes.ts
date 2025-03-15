import { NodeLabel, UiNode } from '@/lib/types';

export const GaiaUsefulRepresentationDecisionsNode: UiNode = {
  id: 'gaia-useful-representation-decisions',
  data: {
    label:
      'Gaia is a useful representation of reality for agents to make decisions on',
    description: '',
    nodeLabel: NodeLabel.Target,
  },
  position: {
    x: -701.3772296191432,
    y: -480.3196861573883,
  },
  width: 235,
  height: 135,
  className: 'border-green-500 !rounded-lg',
  type: 'custom',
};

export const GaiaVetOwnModelsNode: UiNode = {
  id: 'gaia-vet-own-models',
  data: {
    label: 'Gaia allows to vet own models',
    description: '',
    nodeLabel: NodeLabel.Target,
  },
  position: {
    x: -712.7977563897704,
    y: -146.97188971081135,
  },
  width: 211,
  height: 104,
  className: 'border-green-500 !rounded-lg',
  type: 'custom',
};

export const ChallengingScenariosModelsCompeteNode: UiNode = {
  id: 'challenging-scenarios-models-compete',
  data: {
    label: 'Create challenging scenarios for models to compete vs. each other',
    description: '',
    nodeLabel: NodeLabel.Target,
  },
  position: {
    x: -717.757796535813,
    y: 9.831634040750068,
  },
  width: 221,
  height: 111,
  className: 'border-green-500 !rounded-lg',
  type: 'custom',
};

export const GaiaOpenAiBlackBoxesNode: UiNode = {
  id: 'gaia-open-ai-black-boxes',
  data: {
    label: 'Gaia allows to open AI Black Boxes',
    description: '',
    nodeLabel: NodeLabel.Target,
  },
  position: {
    x: -716.5067159507486,
    y: 189.9021754373705,
  },
  width: 218,
  height: 90,
  className: 'border-green-500 !rounded-lg',
  type: 'custom',
};

export const EnvironmentsTestHumanForEvalNode: UiNode = {
  id: 'environments-test-human-for-eval',
  data: {
    label:
      'Create environments to test human-to-agent coordination scenarios for evaluation',
    description: '',
    nodeLabel: NodeLabel.Target,
  },
  position: {
    x: -712.4428023472274,
    y: 334.30301893514854,
  },
  width: 211,
  height: 115,
  className: 'border-green-500 !rounded-lg',
  type: 'custom',
};

export const EnvironmentsTestAgentAgentForEvalNode: UiNode = {
  id: 'environments-test-agent-agent-for-eval',
  data: {
    label:
      'Create environments to test agent-to-agent coordination scenarios for evaluation',
    description: '',
    nodeLabel: NodeLabel.Target,
  },
  position: {
    x: -712.5653116161151,
    y: 467.76207767195626,
  },
  width: 213,
  height: 112,
  className: 'border-green-500 !rounded-lg',
  type: 'custom',
};

export const LEVEL_5_NODES: UiNode[] = [
  GaiaUsefulRepresentationDecisionsNode,
  GaiaVetOwnModelsNode,
  ChallengingScenariosModelsCompeteNode,
  GaiaOpenAiBlackBoxesNode,
  EnvironmentsTestHumanForEvalNode,
  EnvironmentsTestAgentAgentForEvalNode,
];
