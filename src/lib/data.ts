import { Edge } from '@xyflow/react';
import { UiNode } from './types';

export const createEdge = (target: UiNode, source: UiNode): Edge => ({
  id: `${target.id}-FROM-${source.id}`,
  target: target.id,
  source: source.id,
});
