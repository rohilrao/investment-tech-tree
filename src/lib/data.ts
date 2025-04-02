import { Edge, XYPosition } from '@xyflow/react';
import { toastError, toastSuccess } from './toast';
import { LABEL_COLORS, UiNode } from './types';

export const NEW_NODE_ID =
  'WILL_BE_REPLACED_WITH_UNIQUE_ID_AFTER_CHANGING_NODE_NAME_AND_SAVING';

export const NEW_NODE_NAME = 'NEW NODE';

export const createNode = ({ x, y }: XYPosition): UiNode => ({
  id: NEW_NODE_ID,
  data: {
    label: NEW_NODE_NAME,
    description: '',
    nodeLabel: 'New',
  },
  position: {
    x,
    y,
  },
  width: 150,
  height: 50,
  className: `border-${LABEL_COLORS['New']} !rounded-lg`,
  type: 'custom',
});

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

export const copyNodeToClipboard = (nodeToCopy: UiNode) => {
  const node = { ...nodeToCopy };
  node.className = undefined;
  node.type = undefined;
  node.measured = undefined;
  node.selected = undefined;
  node.dragging = undefined;
  const nodeAsString = JSON.stringify(node, null, 2);

  navigator.clipboard.writeText(nodeAsString).catch((err) => {
    toastError('Error while copying node to clipboard!', err);
  });
};

export const copyEdgeToClipboard = (source: string, target: string) => {
  const edgeAsCode = `{
  id: '${target}-FROM-${source}',
  target: '${target}',
  source: '${source}'
},`;

  navigator.clipboard
    .writeText(edgeAsCode)
    .then(() => toastSuccess('Edge copied to clipboard!'))
    .catch((err) => {
      toastError('Error while copying edge to clipboard!', err);
    });
};

/**
 * Converts a given string into a slug-like ID.
 * Removes special characters, transforms everything into lower case,
 * and replaces spaces with hyphens.
 *
 * @param title - Any string, e.g., a title
 * @returns A cleaned-up, lowercased, hyphen-separated string
 */
export const createIdFromTitle = (title: string): string => {
  return (
    title
      .trim()
      .toLowerCase()
      // Remove everything except letters, digits, whitespace, and hyphens
      .replace(/[^a-z0-9\s-]/g, '')
      // Replace all whitespace with hyphens
      .replace(/\s+/g, '-')
      // Replace multiple consecutive hyphens with a single hyphen
      .replace(/-+/g, '-')
      // Remove leading or trailing hyphens
      .replace(/^-+|-+$/g, '')
  );
};
