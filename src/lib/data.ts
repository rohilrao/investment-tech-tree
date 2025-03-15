import { Edge } from '@xyflow/react';
import { UiNode } from './types';

export const createEdgeFromNodes = (target: UiNode, source: UiNode): Edge =>
  createEdgeFromIds(target.id, source.id);

export const createEdgeFromIds = (
  targetId: string,
  sourceId: string,
): Edge => ({
  id: `${targetId}-FROM-${sourceId}`,
  target: targetId,
  source: sourceId,
});
