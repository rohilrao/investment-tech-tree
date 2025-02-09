import { LABEL_COLORS, NodeLabel } from '@/lib/types';
import { Handle, NodeProps, Position } from '@xyflow/react';
import clsx from 'clsx';

const CustomNode = ({ data, sourcePosition, targetPosition }: NodeProps) => {
  return (
    <div
      className={clsx(
        'p-4 rounded shadow-md text-white',
        LABEL_COLORS[data.nodeLabel as NodeLabel] || 'bg-gray-500',
      )}
    >
      <Handle type="target" position={targetPosition as Position} />
      <div className="text-center font-bold">{data.label as string}</div>
      <Handle type="source" position={sourcePosition as Position} />
    </div>
  );
};

export default CustomNode;
