import { updateNodeSize } from '@/app/actions';
import { useGraphContext } from '@/app/GraphContext';
import { Handle, NodeProps, NodeResizer, Position } from '@xyflow/react';

const CustomNode = ({ id, data }: NodeProps) => {
  const { isEditable } = useGraphContext();

  return (
    <div className="p-1">
      <NodeResizer
        onResizeEnd={(_, params) =>
          updateNodeSize(id, params.width, params.height)
        }
        isVisible={isEditable}
        color="transparent"
      />

      <Handle type="source" position={Position.Left} />
      <div className="text-center">{data.label as string}</div>
      <Handle type="target" position={Position.Right} />
    </div>
  );
};

export default CustomNode;
