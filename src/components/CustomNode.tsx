'use client';

import { useGraphContext } from '@/app/GraphContext';
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
  const { isEditable, setNodes, selectedNode, setSelectedNode } =
    useGraphContext();

  const onResizeEnd = useCallback(
    (_: ResizeDragEvent, { height, width }: ResizeParams) => {
      // Update selected node
      if (id === selectedNode?.id) {
        setSelectedNode((prevNode) => ({
          ...prevNode!,
          width,
          height,
        }));
      }

      // Update all nodes
      setNodes((prevNodes) => [
        ...prevNodes.map((node) =>
          node.id === id
            ? {
                ...node,
                width,
                height,
              }
            : node,
        ),
      ]);
    },
    [id, setNodes, setSelectedNode, selectedNode?.id],
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
