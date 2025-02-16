'use client';

import { updateNodeSize } from '@/app/actions/server';
import { useGraphContext } from '@/app/GraphContext';
import { toastError } from '@/lib/toast';
import { QueryTypeMessage } from '@/lib/types';
import {
  Handle,
  NodeProps,
  NodeResizeControl,
  Position,
  ResizeDragEvent,
  ResizeParams,
} from '@xyflow/react';
import { Scaling } from 'lucide-react';
import { useCallback } from 'react';

const CustomNode = ({ id, data }: NodeProps) => {
  const { isEditable, nodes, setNodes } = useGraphContext();

  const onResizeEnd = useCallback(
    async (_: ResizeDragEvent, params: ResizeParams) => {
      const prevState = [...nodes];
      try {
        const updatedNode = await updateNodeSize(
          id,
          params.width,
          params.height,
        );
        setNodes((prevNodes) => [
          ...prevNodes.map((node) =>
            node.id === id
              ? {
                  ...node,
                  width: updatedNode.width,
                  height: updatedNode.height,
                }
              : node,
          ),
        ]);
      } catch (err) {
        setNodes([...prevState]);
        toastError(QueryTypeMessage.UPDATE_NODE_SIZE, err as Error);
      }
    },
    [],
  );

  return (
    <div className="p-1">
      {isEditable && (
        <NodeResizeControl
          minWidth={100}
          minHeight={50}
          onResizeEnd={onResizeEnd}
        >
          <Scaling size={20} className="absolute right-2 bottom-2" />
        </NodeResizeControl>
      )}

      <Handle
        type="source"
        position={Position.Left}
        className={isEditable ? '!w-3 !h-3' : ''}
      />
      <div className="text-center text-base Roboto">{data.label as string}</div>
      <Handle
        type="target"
        position={Position.Right}
        className={isEditable ? isEditable && '!w-3 !h-3' : ''}
      />
    </div>
  );
};

export default CustomNode;
