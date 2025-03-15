import { XYPosition } from '@xyflow/react';
import { LABEL_COLORS, NodeLabel, UiNode } from './types';

export const createNode = ({ x, y }: XYPosition): UiNode => ({
  id: `REPLACE_WITH_HUMAN_READABLE_ID_${new Date()}`,
  data: {
    label: 'New node',
    description: '',
    nodeLabel: NodeLabel.New,
  },
  position: {
    x,
    y,
  },
  width: 150,
  height: 50,
  className: `border-${LABEL_COLORS[NodeLabel.New]} !rounded-lg`,
  type: 'custom',
});
