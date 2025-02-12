'use client';

import {
  createNode,
  createRelationship,
  deleteNode,
  deleteRelationship,
  getNodesAndEdges,
  updateNodePosition,
} from '@/app/actions';
import { useGraphContext } from '@/app/GraphContext';
import { NODE_TYPES, NodeLabel, UiNode } from '@/lib/types';
import {
  applyEdgeChanges,
  applyNodeChanges,
  Background,
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
import { Legend } from './Legend';
import NodeEditor from './NodeEditor';

interface TechTreeProps {
  loginForEdit: () => void;
}

const TechTree: React.FC<TechTreeProps> = ({ loginForEdit }: TechTreeProps) => {
  const [loading, setLoading] = useState(true);
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    selectedNode,
    setSelectedNode,
    isEditable,
  } = useGraphContext();

  const { screenToFlowPosition } = useReactFlow();

  /**
   * Initial get
   */
  useEffect(() => {
    getNodesAndEdges().then((data) => {
      updateGraph(data.nodes, data.edges);
      setLoading(false);
    });
  }, []);

  const updateGraph = (nodesToLayout: UiNode[], edgesToLayout: Edge[]) => {
    setNodes([...nodesToLayout]);
    setEdges([...edgesToLayout]);
  };

  /**
   * Edit nodes
   */
  const addNode = useCallback(() => {
    const newNode: UiNode = {
      id: 'will be ignored',
      data: {
        label: 'New Node',
        description: '',
        nodeLabel: NodeLabel.Technology,
      },
      // centered position
      position: screenToFlowPosition({
        x: window.innerWidth / 2.5,
        y: window.innerHeight / 2,
      }),
    };

    createNode(newNode).then((savedNode) => {
      updateGraph([...nodes, savedNode], edges);
      setSelectedNode(savedNode);
    });
  }, [edges, nodes]);

  const removeNode = useCallback((id: string) => {
    deleteNode(id).then(() => {
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== id && edge.target !== id),
      );
      setSelectedNode(null);
    });
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds) as UiNode[]);
      changes.forEach((change) => {
        if (change.type === 'remove' && change.id) {
          removeNode(change.id);
        }
      });
    },
    [removeNode],
  );

  /* Change position */
  const onNodeDragStop = async (_: React.MouseEvent, node: UiNode) => {
    const updatedNode = await updateNodePosition(
      node.id,
      node.position.x,
      node.position.y,
    );
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === node.id ? { ...n, position: updatedNode.position } : n,
      ),
    );
  };

  const onNodeClick = useCallback((_: React.MouseEvent, node: UiNode) => {
    setSelectedNode(node);
  }, []);

  /**
   * Edit edges
   */
  const onConnect = useCallback(
    (connection: Connection) => {
      createRelationship(
        Number(connection.source),
        Number(connection.target),
      ).then((newEdge) => {
        updateGraph([...nodes], [...edges, newEdge]);
      });
    },
    [nodes, edges],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));

      changes.forEach((change) => {
        if (change.type === 'remove') {
          const edgeToDelete = edges.find((edge) => edge.id === change.id);
          if (edgeToDelete) {
            onEdgeDelete(edgeToDelete);
          }
        }
      });
    },
    [edges],
  );

  const onEdgeDelete = useCallback((edge: Edge) => {
    deleteRelationship(Number(edge.source), Number(edge.target)).then(() => {
      setEdges((prevEdges) =>
        prevEdges.filter(
          (e) => !(e.source === edge.source && e.target === edge.target),
        ),
      );
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-100 flex">
      <div className="w-3/4 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={isEditable ? onNodesChange : undefined}
          onEdgesChange={isEditable ? onEdgesChange : undefined}
          onConnect={isEditable ? onConnect : undefined}
          onNodeClick={onNodeClick}
          onNodeDragStop={isEditable ? onNodeDragStop : undefined}
          colorMode={'light'}
          fitView
          nodeTypes={NODE_TYPES}
          nodesDraggable={isEditable}
          nodesConnectable={isEditable}
        >
          <Background />
          <MiniMap />
          <Controls showInteractive={false} />
          <Panel position="top-right">
            <div className="flex space-x-10">
              {isEditable && <button onClick={addNode}>add node</button>}
              <button onClick={() => loginForEdit()}>
                {isEditable ? 'exit edit-mode' : 'edit-mode'}
              </button>
            </div>
          </Panel>
        </ReactFlow>
        <Legend />
      </div>
      {
        <div className="w-1/4 p-4 bg-white shadow-lg">
          <NodeEditor
            node={selectedNode}
            setNodes={setNodes}
            isEditable={isEditable}
          />
        </div>
      }
    </div>
  );
};

export default TechTree;
