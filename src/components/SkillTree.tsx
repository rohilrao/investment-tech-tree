'use client';

import React, {useCallback, useEffect, useState} from 'react';
import ReactFlow, {
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Connection,
    Controls,
    Edge,
    EdgeChange,
    MiniMap,
    NodeChange,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodeEditor from './NodeEditor';
import {SkillTreeNode, SkillTreeNodeNeo} from '@/libs/types';
import {
    createRelationship,
    createTechnology,
    deleteRelationship,
    deleteTechnology,
    getTechnologies
} from "@/app/actions";

const LEVEL_SPACING_X = 200;
const NODE_SPACING_Y = 100;

const SkillTree: React.FC = () => {
  const [nodes, setNodes] = useState<SkillTreeNodeNeo[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<SkillTreeNodeNeo | null>(null);

  useEffect(() => {
    getTechnologies()
        .then((data) => {
          const positionedNodes = positionNodes(data.nodes);
          setNodes(positionedNodes);
          setEdges(data.edges);
        })
        .catch((error) => console.error('Error fetching technologies:', error));
  }, []);


  const positionNodes = (nodes: SkillTreeNodeNeo[]) => {
    const levels: { [key: number]: SkillTreeNodeNeo[] } = {};
    nodes.forEach((node) => {
      if (!levels[node.data.level]) {
        levels[node.data.level] = [];
      }
      levels[node.data.level].push(node);
    });

    const positionedNodes: SkillTreeNodeNeo[] = [];
    Object.keys(levels).forEach((level) => {
      const lvl = parseInt(level);
      levels[lvl].forEach((node, index) => {
        node.position = {
          x: lvl * LEVEL_SPACING_X,
          y: index * NODE_SPACING_Y,
        };
        positionedNodes.push(node);
      });
    });

    return positionedNodes;
  };

  const onConnect = useCallback((connection: Connection) => {
    createRelationship(Number(connection.source), Number(connection.target))
        .then(response => {
          console.log(response);
          if (response.status === 201 && response.edge) {
            const newEdge: Edge = {
              id: response.edge.id, // Stelle sicher, dass die ID gesetzt wird
              source: response.edge.source.toString(),
              target: response.edge.target.toString(),
              type: "default", // Falls du eine spezifische Art von Edge hast, passe das an
            };

            setEdges(prevEdges => [...prevEdges, newEdge]);
          } else {
            console.error('Error creating relationship:', response.error);
          }
        })
        .catch(error => {
          console.error('Unexpected error:', error);
        });
  }, []);



  const addNode = useCallback(() => {
    const newNode: SkillTreeNode = {
      id: crypto.randomUUID(),
      data: { name: 'New Node', level: 1 },
      type: 'default',
      position: { x: 0, y: 0 },
    };

    createTechnology(newNode.data.name, newNode.data.level, newNode.position.x, newNode.position.y)
        .then((savedNode) => {
          setNodes((nds) => positionNodes([...nds, savedNode]));
        })
        .catch((error) => console.error('Error creating technology:', error));
  }, []);

  const onEdgesChange = useCallback(
      (changes: EdgeChange[]) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));

        // Prüfe, ob eine Edge entfernt wurde
        changes.forEach(change => {
          if (change.type === "remove") {
            const edgeToDelete = edges.find(edge => edge.id === change.id);
            if (edgeToDelete) {
              onEdgeDelete(edgeToDelete);
            }
          }
        });
      },
      [edges] // Abhängigkeit hinzufügen, damit der aktuelle Zustand verwendet wird
  );

  const onEdgeDelete = useCallback((edge: Edge) => {
    deleteRelationship(Number(edge.source), Number(edge.target))
        .then(response => {
          if (response.status === 204) {
            console.log("Relationship deleted");

            setEdges(prevEdges => prevEdges.filter(e => !(e.source === edge.source && e.target === edge.target)));
          } else {
            console.error('Error deleting relationship:', response.error);
          }
        })
        .catch(error => {
          console.error('Unexpected error:', error);
        });
  }, []);

  const removeNode = useCallback((id: string) => {
    deleteTechnology(id)
        .then(() => {
          setNodes((nds) => positionNodes(nds.filter((node) => node.id !== id)));
          setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
        })
        .catch((error) => console.error('Error deleting technology:', error));
  }, []);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            setNodes((nds) => applyNodeChanges(changes, nds));

            changes.forEach((change) => {
                if (change.type === "remove" && change.id) {
                    removeNode(change.id);
                }
            });
        },
        [removeNode]
    );

  const onNodeClick = useCallback((_: React.MouseEvent, node: SkillTreeNodeNeo) => {
    setSelectedNode(node);
  }, []);

  return (
      <ReactFlowProvider>
        <div className="w-full h-screen bg-gray-100 p-4 flex">
          <div className="w-3/4 relative">
            <button onClick={addNode} className="p-2 bg-blue-500 text-white rounded mb-4">
              Add Node
            </button>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
            >
              <MiniMap />
              <Controls />
              <Background color="#aaa" gap={16} />
            </ReactFlow>
          </div>
          <div className="w-1/4 p-4 bg-white shadow-lg">
            {selectedNode && <NodeEditor node={selectedNode} setNodes={setNodes} />}
          </div>
        </div>
      </ReactFlowProvider>
  );
};

export default SkillTree;
