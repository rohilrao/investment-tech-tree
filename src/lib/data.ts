import { Edge, XYPosition } from '@xyflow/react';
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

/**
 * Converts a title to a camelCase variable name ending with "Node".
 * Only adds enough words so that the total length does not exceed 30 characters.
 *
 * @param title - Any string, e.g., a title
 * @returns A camelCase variable name, max 30 characters, ending with "Node"
 */
export const createNodeVariableName = (title: string): string => {
  // 1. Clean up the title: remove non-alphanumeric characters except spaces
  // 2. Split into words
  const words = title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map((word) => word.toLowerCase());

  // We want the final string to always end with "Node" (4 characters)
  // Therefore, the prefix (our constructed camelCase) can be at most MAX_TOTAL_LENGTH - 4 characters.
  const MAX_TOTAL_LENGTH = 50;
  const SUFFIX = 'Node';
  const MAX_PREFIX_LENGTH = MAX_TOTAL_LENGTH - SUFFIX.length;

  let result = '';

  for (let i = 0; i < words.length; i++) {
    // The first word is fully lowercased
    // Subsequent words have their first letter capitalized
    const camelCasedWord = words[i].charAt(0).toUpperCase() + words[i].slice(1);

    const tentative = result + camelCasedWord;

    // If adding the entire word fits, add it.
    if (tentative.length <= MAX_PREFIX_LENGTH) {
      result = tentative;
    } else {
      // If it doesn't fit entirely, check how many characters remain.
      const remain = MAX_PREFIX_LENGTH - result.length;
      if (remain > 0) {
        // Add as many characters of this word as will fit.
        result += camelCasedWord.slice(0, remain);
      }
      // Stop adding further words.
      break;
    }
  }

  // Finally, append "Node"
  const finalName = result + SUFFIX;

  return finalName.slice(0, MAX_TOTAL_LENGTH);
};
