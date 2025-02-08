'use client';

import React, { useEffect, useState } from 'react';
import { SkillTreeNode } from '@/lib/types';

interface NodeEditorProps {
  node: SkillTreeNode | null;
  setNodes: React.Dispatch<React.SetStateAction<SkillTreeNode[]>>;
}

const NodeEditor: React.FC<NodeEditorProps> = ({ node, setNodes }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (node) {
      setName(node.data.name);
      setDescription(node.data.description || '');
    }
  }, [node]);

  const updateNodeData = () => {
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === node?.id
          ? { ...n, data: { ...n.data, label: name, description: description } }
          : n,
      ),
    );
  };

  if (!node) return <div>Select a node to edit</div>;

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold">Edit Node</h3>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full mt-2"
        placeholder="Node Name"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full mt-2"
        placeholder="Node Description"
      />
      <button
        onClick={updateNodeData}
        className="mt-2 p-2 bg-blue-500 text-white rounded w-full"
      >
        Save
      </button>
    </div>
  );
};

export default NodeEditor;
