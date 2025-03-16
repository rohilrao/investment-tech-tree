'use client';

import { useGraphContext } from '@/app/GraphContext';
import {
  createNodeVariableName,
  createIdFromTitle,
  NEW_NODE_ID,
  NEW_NODE_NAME,
} from '@/lib/data';
import { toastSuccess } from '@/lib/toast';
import { LABEL_COLORS, NodeLabel } from '@/lib/types';
import React, { useEffect, useState } from 'react';
import { Manual } from './Manual';

const NodeDetails = () => {
  const { selectedNode, setNodes, setSelectedNode, isEditable } =
    useGraphContext();

  const [name, setName] = useState(''); // neo4j's name = reactflow's label
  const [label, setLabel] = useState<NodeLabel>(NodeLabel.Technology);
  const [newDescription, setNewDescription] = useState('');
  const [oldDescription, setOldDescription] = useState('');

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedNode) {
      setName(selectedNode.data.label);
      setNewDescription(selectedNode.data.description);
      setOldDescription(selectedNode.data.description);
      setLabel(selectedNode.data.nodeLabel);
    }
  }, [selectedNode]);

  const onLabelChange = (e: React.ChangeEvent<HTMLSelectElement>): void =>
    setLabel(e.target.value as NodeLabel);
  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setName(e.target.value);

  const onDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ): void => setNewDescription(e.target.value);

  const onCopyNodeInClipboard = () => {
    const nodeAsString = JSON.stringify(selectedNode, null, 2);
    const nodeAsCode = `export const ${createNodeVariableName(selectedNode!.data.label)}: UiNode = ${nodeAsString};`;

    navigator.clipboard
      .writeText(nodeAsCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => {
        console.error('Error while coping node:', error);
      });
  };

  const updateNodeData = () => {
    setSelectedNode((prevNode) => ({
      ...prevNode!,
      id: getNodeId(),
      data: { label: name, description: newDescription, nodeLabel: label },
    }));

    setNodes((prevNodes) => [
      ...prevNodes.map((n) =>
        n.id === selectedNode!.id
          ? {
              ...n,
              id: getNodeId(),
              data: {
                description: newDescription,
                label: name,
                nodeLabel: label,
              },
            }
          : n,
      ),
    ]);
    toastSuccess('Updated node content!');

    const getNodeId = (): string => {
      if (selectedNode!.id === NEW_NODE_ID && name !== NEW_NODE_NAME) {
        return createIdFromTitle(name);
      }

      return selectedNode!.id;
    };
  };

  if (!selectedNode) return <Manual />;

  return (
    <div className="p-4 mb flex flex-col h-full shadow-md">
      {!selectedNode && <Manual />}

      {selectedNode && (
        <>
          <div className="flex justify-between items-end border-b border-gray-300 pb-2 gap-4">
            {isEditable ? (
              <h3 className="text-lg font-bold">Edit Node</h3>
            ) : (
              <h3 className="text-lg font-bold">{name}</h3>
            )}

            {isEditable && (
              <div className="relative flex items-center">
                <button
                  onClick={onCopyNodeInClipboard}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 active:scale-95"
                >
                  <span>Copy code to clipboard</span>
                </button>
                {copied && (
                  <span className="absolute right-0 top-[-1.5rem] text-xs text-green-600 whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </div>
            )}

            {!isEditable && (
              <span
                className={`inline-block px-3 py-1 text-sm font-semibold rounded bg-${LABEL_COLORS[label]}`}
              >
                {label}
              </span>
            )}
          </div>

          {isEditable && (
            <div className="flex flex-col">
              <div className="mb-4">
                <label className="font-semibold">Type</label>
                <select
                  value={label}
                  onChange={onLabelChange}
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
                  onChange={onNameChange}
                  className="border p-2 w-full mt-2"
                  placeholder="Node Name"
                />
              </div>

              <div>
                <label className="font-semibold">Description</label>
                <textarea
                  value={newDescription}
                  onChange={onDescriptionChange}
                  className="border p-2 w-full mt-2"
                  placeholder="Node Description"
                  rows={12}
                />
              </div>

              <button
                disabled={!name}
                onClick={updateNodeData}
                className="mt-2 p-2 bg-blue-500 text-white rounded w-full disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
              >
                Save
              </button>
            </div>
          )}
          {!isEditable && oldDescription && (
            <div className="overflow-auto flex-grow">
              <p className="p-2 w-full mt-2">{oldDescription}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NodeDetails;
