'use client';

import {
  createNode,
  createRelationship,
  deleteNode,
  deleteRelationship,
  getNodesAndEdges,
} from '@/app/actions';
import { getLayoutedElements } from '@/lib/dagrejs';
import { NODE_TYPES, NodeLabel, UiNode } from '@/lib/types';
import {
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Controls,
  Edge,
  EdgeChange,
  NodeChange,
  Panel,
  ReactFlow,
} from '@xyflow/react';
import React, { useCallback, useEffect, useState } from 'react';
import { Legend } from './Legend';
import NodeEditor from './NodeEditor';

interface TechTreeProps {
  isEditable: boolean;
  loginForEdit: () => void;
}

const TechTree: React.FC<TechTreeProps> = ({
  isEditable,
  loginForEdit: loginForEdit,
}: TechTreeProps) => {
  const [loading, setLoading] = useState(true);

  const [nodes, setNodes] = useState<UiNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [direction, setDirection] = useState<string>('LR');

  const [selectedNode, setSelectedNode] = useState<UiNode | null>(null);

  /**
   * Initial get
   */
  useEffect(() => {
    getNodesAndEdges().then((data) => {
      layoutGraph(data.nodes, data.edges);
      setLoading(false);
    });
  }, []);

  const layoutGraph = (
    nodesToLayout: UiNode[],
    edgesToLayout: Edge[],
    newDirection = direction,
  ) => {
    const { layoutedNodes, layoutedEdges } = getLayoutedElements(
      nodesToLayout,
      edgesToLayout,
      newDirection,
    );
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    setDirection(newDirection);
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
      position: { x: 0, y: 0 },
    };

    createNode(newNode).then((savedNode) => {
      layoutGraph([...nodes, savedNode], edges);
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
        layoutGraph([...nodes], [...edges, newEdge]);
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

  const onLayout = useCallback(
    (direction: string) => {
      layoutGraph(nodes, edges, direction);
    },
    [nodes, edges],
  );

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
          colorMode={'dark'}
          fitView
          nodeTypes={NODE_TYPES}
          nodesDraggable={isEditable}
          nodesConnectable={isEditable}
        >
          <Controls showInteractive={false} />
          <Panel position="top-right">
            <div className="flex space-x-10">
              {isEditable && <button onClick={addNode}>add node</button>}
              <button onClick={() => onLayout('TB')}>vertical layout</button>
              <button onClick={() => onLayout('LR')}>horizontal layout</button>
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
