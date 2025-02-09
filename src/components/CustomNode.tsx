import { LABEL_COLORS, NodeLabel } from '@/lib/types';
import { Handle, NodeProps, Position } from '@xyflow/react';
import { clsx } from 'clsx';

const CustomNode = ({ data, sourcePosition, targetPosition }: NodeProps) => {
  return (
    <div
      className={clsx(
        'p-2',
        'rounded',
        `bg-${LABEL_COLORS[data.nodeLabel as NodeLabel]}`,
      )}
    >
      <Handle type="target" position={targetPosition as Position} />
      <div className="text-center">{data.label as string}</div>
      <Handle type="source" position={sourcePosition as Position} />
    </div>
  );
};

export default CustomNode;
