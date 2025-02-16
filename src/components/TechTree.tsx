'use client';

import {
  createEdge,
  createNode,
  deleteEdge,
  deleteNode,
  getNodesAndEdges,
  updateNodePosition,
} from '@/app/actions/server';
import { useGraphContext } from '@/app/GraphContext';
import { toastError, toastSuccess } from '@/lib/toast';
import { NODE_TYPES, QueryTypeMessage, UiNode } from '@/lib/types';
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
import React, { useCallback, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExportButton from './ExportButton';
import { Legend } from './Legend';
import { LoadingSpinner } from './LoadingSpinner';
import NodeEditor from './NodeEditor';

interface TechTreeProps {
  loginForEdit: () => void;
}

const TechTree: React.FC<TechTreeProps> = ({ loginForEdit }: TechTreeProps) => {
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const { nodes, setNodes, selectedNode, setSelectedNode, isEditable } =
    useGraphContext();

  const { screenToFlowPosition } = useReactFlow();

  // Initial get
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { nodes, edges } = await getNodesAndEdges();
        setNodes(() => [...nodes]);
        setEdges(() => [...edges]);
        setLoading(false);
      } catch (err) {
        toastError(QueryTypeMessage.GET_NODES_AND_EDGES, err as Error);
        setLoading(false);
      }
    };

    fetchData();
  }, [setEdges, setNodes]);

  /**
   * NODES
   */

  const addNode = useCallback(async () => {
    const centeredPosition = screenToFlowPosition({
      x: window.innerWidth / 2.5,
      y: window.innerHeight / 2,
    });

    try {
      const createdNode = await createNode(centeredPosition);

      setNodes((prevNodes) => [...prevNodes, { ...createdNode }]);
      setSelectedNode({ ...createdNode });
      toastSuccess('Created node!');
    } catch (err) {
      toastError(QueryTypeMessage.CREATE_NODE, err as Error);
    }
  }, [screenToFlowPosition, setNodes, setSelectedNode]);

  // Delete node
  const onNodesDelete = useCallback(
    async (nodesToDelete: UiNode[]) => {
      for (const nodeToDelete of nodesToDelete) {
        const prevState = [...nodes];
        try {
          await deleteNode(nodeToDelete.id);
          setNodes((prevNodes) => [
            ...prevNodes.filter((n) => n.id !== nodeToDelete.id),
          ]);
          setSelectedNode(null);
          toastSuccess(
            `Deleted node '${nodeToDelete.data.label.slice(0, 10)}'!`,
          );
        } catch (err) {
          // setNodes((prevNodes) => [...prevNodes, nodeToDelete]);
          setNodes([...prevState]);
          toastError(QueryTypeMessage.DELETE_NODE, err as Error);
        }
      }
    },
    [setNodes, setSelectedNode, nodes],
  );

  // Change position of node
  const onNodeDragStop = useCallback(
    async (_: React.MouseEvent, draggedNode: UiNode) => {
      try {
        const updatedNode = await updateNodePosition(
          draggedNode.id,
          draggedNode.position.x,
          draggedNode.position.y,
        );
        setNodes((prevNodes) => [
          ...prevNodes.map((n) =>
            n.id === draggedNode.id ? { ...updatedNode } : n,
          ),
        ]);
      } catch (err) {
        toastError(QueryTypeMessage.UPDATE_NODE_POSITION, err as Error);
      }
    },
    [setNodes],
  );

  // Select node
  const onNodeClick = useCallback(
    (_: React.MouseEvent, newSelectedNode: UiNode) => {
      if (!selectedNode || selectedNode.id != newSelectedNode.id) {
        setSelectedNode(() => ({ ...newSelectedNode }));
      }
    },
    [selectedNode, setSelectedNode],
  );

  /**
   * EDGES
   */

  // Add edge
  const onConnect = useCallback(
    async (connection: Connection) => {
      const prevState = [...edges];
      try {
        const newEdge = await createEdge(connection.source, connection.target);
        setEdges((prevEdges) => [...prevEdges, { ...newEdge }]);
        toastSuccess('Created edge!');
      } catch (err) {
        setEdges([...prevState]);
        toastError(QueryTypeMessage.CREATE_EDGE, err as Error);
      }
    },
    [setEdges, edges],
  );

  // Delete edge
  const onEdgesDelete = useCallback(
    async (edgesToDelete: Edge[]) => {
      for (const edgeToDelete of edgesToDelete) {
        try {
          await deleteEdge(edgeToDelete.source, edgeToDelete.target);
          setEdges((prevEdges) => [
            ...prevEdges.filter(
              (e) =>
                !(
                  e.source === edgeToDelete.source &&
                  e.target === edgeToDelete.target
                ),
            ),
          ]);
          toastSuccess(`Deleted edge!`);
        } catch (err) {
          setEdges((prevEdges) => [...prevEdges, edgeToDelete]);
          toastError(QueryTypeMessage.DELETE_EDGE, err as Error);
        }
      }
    },
    [setEdges],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (isEditable) {
        setNodes(
          (prevNodes) => applyNodeChanges(changes, prevNodes) as UiNode[],
        );
      }
    },
    [setNodes, isEditable],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (isEditable) {
        setEdges((prevEdges) => applyEdgeChanges(changes, prevEdges) as Edge[]);
      }
    },
    [setEdges, isEditable],
  );

  if (loading) return <LoadingSpinner />;

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
          onEdgesDelete={isEditable ? onEdgesDelete : undefined}
          onNodesDelete={isEditable ? onNodesDelete : undefined}
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
          <NodeEditor />
          <ToastContainer />
        </div>
      }
    </div>
  );
};

export default TechTree;
