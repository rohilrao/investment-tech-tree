import { UiNode } from '@/lib/types';
import { LEVEL_1_NODES } from './level-1/level-1-nodes';
import { LEVEL_2_NODES } from './level-2/level-2-nodes';
import { LEVEL_3_NODES } from './level-3/level-3-nodes';
import { LEVEL_4_NODES } from './level-4/level-4-nodes';
import { LEVEL_5_NODES } from './level-5/level-5-nodes';

export const NODES: UiNode[] = [
  ...LEVEL_1_NODES,
  ...LEVEL_2_NODES,
  ...LEVEL_3_NODES,
  ...LEVEL_4_NODES,
  ...LEVEL_5_NODES,
];
