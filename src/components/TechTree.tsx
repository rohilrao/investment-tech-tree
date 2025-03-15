'use client';

import { useGraphContext } from '@/app/GraphContext';
import { EDGES } from '@/data/edges';
import { createEdgeFromIds } from '@/lib/data';
import { createNode } from '@/lib/reactflow';
import { toastSuccess } from '@/lib/toast';
import { NODE_TYPES, UiNode } from '@/lib/types';
import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  MiniMap,
  NodeChange,
  Panel,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import React, { useCallback, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExportButton from './ExportButton';
import { Legend } from './Legend';
import NodeDetails from './NodeDetails';

interface TechTreeProps {
  loginForEdit: () => void;
}

const TechTree: React.FC<TechTreeProps> = ({ loginForEdit }: TechTreeProps) => {
  const [edges, setEdges] = useState<Edge[]>([...EDGES]);
  const { nodes, setNodes, selectedNode, setSelectedNode, isEditable } =
    useGraphContext();

  const { screenToFlowPosition } = useReactFlow();
  /**
   * NODES
   */

  const addNode = useCallback(async () => {
    const centeredPosition = screenToFlowPosition({
      x: window.innerWidth / 2.5,
      y: window.innerHeight / 2,
    });

    const createdNode = createNode(centeredPosition);

    setNodes((prevNodes) => [...prevNodes, { ...createdNode }]);
    setSelectedNode({ ...createdNode });
    toastSuccess('Node created!');
  }, [screenToFlowPosition, setNodes, setSelectedNode]);

  // Select node
  const onNodeClick = useCallback(
    (_: React.MouseEvent, newSelectedNode: UiNode) => {
      if (!selectedNode || selectedNode.id != newSelectedNode.id) {
        setSelectedNode(() => ({ ...newSelectedNode }));
      }
    },
    [selectedNode, setSelectedNode],
  );

  // TODO: Remove if it's working without
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, draggedNode: UiNode) => {
      setSelectedNode((prevNode) => ({
        ...prevNode!,
        position: draggedNode.position,
      }));
      setNodes((prevNodes) => [
        ...prevNodes.map((n) =>
          n.id === draggedNode.id ? { ...draggedNode } : n,
        ),
      ]);
    },
    [setNodes, setSelectedNode],
  );

  /**
   * EDGES
   */

  // Add edge
  const onConnect = useCallback((connection: Connection) => {
    const newEdge = createEdgeFromIds(connection.source, connection.target);
    setEdges((prevEdges) => [...prevEdges, { ...newEdge }]);
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (isEditable && changes[0].type != 'remove') {
        setNodes(
          (prevNodes) => applyNodeChanges(changes, prevNodes) as UiNode[],
        );
      }
    },
    [setNodes, isEditable],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (isEditable && changes[0].type != 'remove') {
        setEdges((prevEdges) => applyEdgeChanges(changes, prevEdges) as Edge[]);
      }
    },
    [setEdges, isEditable],
  );

  return (
    <div className="w-full h-screen bg-gray-100 flex">
      <div className="w-3/4 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={isEditable ? onConnect : undefined}
          onNodeClick={onNodeClick}
          onNodeDragStop={isEditable ? onNodeDragStop : undefined}
          colorMode={'light'}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          nodeTypes={NODE_TYPES}
          nodesDraggable={isEditable}
          nodesConnectable={isEditable}
          minZoom={0.3}
        >
          <Background bgColor="white" variant={BackgroundVariant.Dots} />
          <MiniMap />
          <Controls showInteractive={false} />
          <Panel position="top-right">
            <div className="flex space-x-10">
              {isEditable && (
                <button
                  className="p-2 bg-blue-500 text-white rounded h-10"
                  onClick={addNode}
                >
                  add node
                </button>
              )}
              {isEditable && <ExportButton />}
              <button
                className="p-2 bg-blue-500 text-white rounded h-10"
                onClick={loginForEdit}
              >
                {isEditable ? 'exit edit-mode' : 'edit-mode'}
              </button>
            </div>
          </Panel>
        </ReactFlow>
        <Legend />
      </div>
      {
        <div className="w-1/4 p-4 bg-white shadow-lg">
          <NodeDetails />
          <ToastContainer />
        </div>
      }
    </div>
  );
};

export default TechTree;
