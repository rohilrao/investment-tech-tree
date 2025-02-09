'use client';

import { updateNode } from '@/app/actions';
import { LABEL_COLORS, NodeLabel, UiNode } from '@/lib/types';
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';

interface NodeEditorProps {
  node: UiNode | null;
  setNodes: React.Dispatch<React.SetStateAction<UiNode[]>>;
  isEditable: boolean;
}

const NodeEditor: React.FC<NodeEditorProps> = ({
  node,
  setNodes,
  isEditable,
}) => {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(''); // neo4j's name = reactflow's label
  const [label, setLabel] = useState<NodeLabel>(NodeLabel.Technology);
  const [newDescription, setNewDescription] = useState('');
  const [oldDescription, setOldDescription] = useState('');

  useEffect(() => {
    if (node) {
      setName(node.data.label);
      setNewDescription(node.data.description);
      setOldDescription(node.data.description);
      setLabel(node.data.nodeLabel);
    }
  }, [node]);

  const updateNodeData = async () => {
    setLoading(true);
    try {
      const descriptionChanged = newDescription !== oldDescription;

      const updatedNode = await updateNode(
        node!.id,
        name,
        label,
        newDescription,
        descriptionChanged,
      );
      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === updatedNode.id
            ? {
                ...n,
                data: {
                  ...n.data,
                  label: updatedNode.data.label,
                  description: updatedNode.data.description,
                  nodeLabel: updatedNode.data.nodeLabel,
                },
              }
            : n,
        ),
      );

      toast.success('Update successful!', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      toast.error(`Update error: ${error}`, {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!node)
    return (
      <div className="p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Manual</h2>

        <h3 className="mt-4 text-lg font-semibold text-gray-700">
          Select a node
        </h3>
        <p className="text-gray-600">
          Explore the selected node's properties and relationships.
        </p>

        <h3 className="mt-4 text-lg font-semibold text-gray-700">
          React Flow Basics
        </h3>
        <ul className="list-disc text-gray-600">
          <li>
            <strong>Zoom:</strong> Use the mouse wheel or +/- at the bottom left
            corner.
          </li>
          <li>
            <strong>Pan:</strong> Click and drag to move the view.
          </li>
          <li>
            <strong>Fit View:</strong> Use the control panel button at the
            bottom left corner to center all nodes.
          </li>
        </ul>
      </div>
    );

  return (
    <div className="p-4 mb">
      <ToastContainer />
      <div className="flex justify-between items-center border-b border-gray-300 pb-2">
        <h3 className="text-lg font-bold">{isEditable ? 'Edit Node' : name}</h3>
        {!isEditable && (
          <span
            className={`inline-block px-3 py-1 text-sm font-semibold rounded ${LABEL_COLORS[label]}`}
          >
            {label}
          </span>
        )}
      </div>

      {isEditable ? (
        <div className="flex flex-col">
          <div className="mb-4">
            <label className="font-semibold">Type</label>
            <select
              value={label}
              onChange={(e) => setLabel(e.target.value as NodeLabel)}
              className="border p-2 w-full mt-2"
            >
              {Object.entries(NodeLabel).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="font-semibold">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 w-full mt-2"
              placeholder="Node Name"
            />
          </div>

          <div>
            <label className="font-semibold">Description</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="border p-2 w-full mt-2"
              placeholder="Node Description"
              rows={12}
            />
          </div>

          <button
            disabled={!name || loading}
            onClick={updateNodeData}
            className="mt-2 p-2 bg-blue-500 text-white rounded w-full disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
            ) : (
              'Save'
            )}
          </button>
        </div>
      ) : (
        <>
          {newDescription && (
            <p className="p-2 w-full mt-2">{newDescription}</p>
          )}
        </>
      )}
    </div>
  );
};

export default NodeEditor;
