import { NodeLabel, UiNode } from '@/lib/types';

export const MiniGaiaRepoDefinedDomainNode: UiNode = {
  id: 'mini-gaia-repo-defined-domain',
  data: {
    label: 'Mini-Gaia repo for a defined domain',
    description: '',
    nodeLabel: NodeLabel.Technology,
  },
  position: {
    x: -2305.515958170196,
    y: 139.92689055120908,
  },
  width: 198,
  height: 121,
  className: 'border-blue-500 !rounded-lg',
  type: 'custom',
};

export const LEVEL_1_NODES: UiNode[] = [MiniGaiaRepoDefinedDomainNode];
