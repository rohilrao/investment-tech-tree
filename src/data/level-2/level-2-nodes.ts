import { NodeLabel, UiNode } from '@/lib/types';

export const ContributionsIncentivizedReflectsDecisionValueNode: UiNode = {
  id: 'contributions-incentivized-reflects-decision-value',
  data: {
    label:
      'Contributions are incentivized in a way that reflects the contributors decision value',
    description: '',
    nodeLabel: NodeLabel.Target,
  },
  position: {
    x: -1899.8570649809928,
    y: -255.14139845375544,
  },
  width: 237,
  height: 133,
  className: 'border-green-500 !rounded-lg',
  type: 'custom',
};

export const PlugPlaySystemTestingFeedbackingNode: UiNode = {
  id: 'plug-play-system-testing-feedbacking',
  data: {
    label:
      'Plug and Play System for Testing + Feedbacking on Models in Gaia or own environments',
    description: '',
    nodeLabel: NodeLabel.Technology,
  },
  position: {
    x: -1899.255757693702,
    y: 259.116621158238,
  },
  width: 246,
  height: 164,
  className: 'border-blue-500 !rounded-lg',
  type: 'custom',
};

export const LEVEL_2_NODES: UiNode[] = [
  ContributionsIncentivizedReflectsDecisionValueNode,
  PlugPlaySystemTestingFeedbackingNode,
];
