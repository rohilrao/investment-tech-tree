import { Edge } from '@xyflow/react';
import { LEVEL_1_EDGES } from './level-1/level-1-edges';
import { LEVEL_2_EDGES } from './level-2/level-2-edges';
import { LEVEL_3_EDGES } from './level-3/level-3-edges';
import { LEVEL_4_EDGES } from './level-4/level-4-edges';

export const EDGES: Edge[] = [
  ...LEVEL_1_EDGES,
  ...LEVEL_2_EDGES,
  ...LEVEL_3_EDGES,
  ...LEVEL_4_EDGES,
];
