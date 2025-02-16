'use client';

import {
  updateNodeContent,
  updateNodeContentAndEmbedding,
} from '@/app/actions/server';
import { useGraphContext } from '@/app/GraphContext';
import { toastError, toastSuccess } from '@/lib/toast';
import { LABEL_COLORS, NodeLabel, QueryTypeMessage } from '@/lib/types';
import React, { useEffect, useState } from 'react';
import { Manual } from './Manual';

const NodeEditor = () => {
  const { selectedNode, setNodes, isEditable } = useGraphContext();

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(''); // neo4j's name = reactflow's label
  const [label, setLabel] = useState<NodeLabel>(NodeLabel.Technology);
  const [newDescription, setNewDescription] = useState('');
  const [oldDescription, setOldDescription] = useState('');

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

  const updateNodeData = async () => {
    setLoading(true);
    try {
      const descriptionChanged = newDescription !== oldDescription;

      const updatedNode = descriptionChanged
        ? await updateNodeContentAndEmbedding(
            selectedNode!.id,
            name,
            label,
            newDescription,
          )
        : await updateNodeContent(
            selectedNode!.id,
            name,
            label,
            newDescription,
          );

      setNodes((prevNodes) => [
        ...prevNodes.map((n) =>
          n.id === updatedNode.id ? { ...updatedNode } : n,
        ),
      ]);
      toastSuccess('Updated node content!');
    } catch (err: unknown) {
      toastError(QueryTypeMessage.UPDATE_NODE_CONTENT, err as Error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedNode) return <Manual />;

  return (
    <div className="p-4 mb h-[90vh] max-h-[90vh] overflow-hidden">
      <div className="flex justify-between items-end border-b border-gray-300 pb-2 gap-4">
        <h3 className="text-lg font-bold">{isEditable ? 'Edit Node' : name}</h3>
        {!isEditable && (
          <span
            className={`inline-block px-3 py-1 text-sm font-semibold rounded bg-${LABEL_COLORS[label]}`}
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
          {oldDescription && (
            <div className="overflow-auto max-h-full">
              <p className="p-2 w-full mt-2">{oldDescription}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NodeEditor;
