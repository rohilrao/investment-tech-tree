'use client';

import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { NODE_LABELS, NodeLabel } from '@/lib/types';
import { useTechTree } from '@/hooks/useTechTree';

const EditTechTreePanel: React.FC = () => {
  const { techTree } = useTechTree();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Node State
  const [newNode, setNewNode] = useState({
    id: '',
    label: '',
    type: 'Milestone' as NodeLabel,
    category: '',
    subtype: '',
    trl_current: '',
    trl_projected_5_10_years: '',
    detailedDescription: '',
    references: '',
  });

  // Edit Node State
  const [editNodeId, setEditNodeId] = useState('');
  const [editNode, setEditNode] = useState({
    label: '',
    type: 'Milestone' as NodeLabel,
    category: '',
    subtype: '',
    trl_current: '',
    trl_projected_5_10_years: '',
    detailedDescription: '',
    references: '',
  });

  // Delete Node State
  const [deleteNodeId, setDeleteNodeId] = useState('');

  // Edge State
  const [newEdge, setNewEdge] = useState({
    source: '',
    target: '',
  });
  const [deleteEdgeId, setDeleteEdgeId] = useState('');

  const handleAddNode = async () => {
    if (!newNode.id || !newNode.label) {
      setMessage({ type: 'error', text: 'ID and Label are required' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/investment-tech-tree/api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newNode,
          references: newNode.references.split('\n').filter(r => r.trim()),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add node');
      }

      setMessage({ type: 'success', text: 'Node added successfully' });
      setNewNode({
        id: '',
        label: '',
        type: 'Milestone',
        category: '',
        subtype: '',
        trl_current: '',
        trl_projected_5_10_years: '',
        detailedDescription: '',
        references: '',
      });

      // Trigger data refresh
      window.location.reload();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to add node',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadNode = () => {
    if (!techTree) return;
    const node = techTree.nodes.find(n => n.id === editNodeId);
    if (!node) {
      setMessage({ type: 'error', text: 'Node not found' });
      return;
    }
    setEditNode({
      label: node.data.label,
      type: node.data.nodeLabel,
      category: node.data.category || '',
      subtype: node.data.subtype || '',
      trl_current: node.data.trl_current || '',
      trl_projected_5_10_years: node.data.trl_projected_5_10_years || '',
      detailedDescription: node.data.detailedDescription || '',
      references: (node.data.references || []).join('\n'),
    });
    setMessage({ type: 'success', text: 'Node loaded' });
  };

  const handleUpdateNode = async () => {
    if (!editNodeId) {
      setMessage({ type: 'error', text: 'Please load a node first' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/investment-tech-tree/api/nodes/${editNodeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editNode,
          references: editNode.references.split('\n').filter(r => r.trim()),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update node');
      }

      setMessage({ type: 'success', text: 'Node updated successfully' });
      window.location.reload();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update node',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNode = async () => {
    if (!deleteNodeId) {
      setMessage({ type: 'error', text: 'Please enter a node ID' });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete node ${deleteNodeId}?`)) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/investment-tech-tree/api/nodes/${deleteNodeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete node');
      }

      setMessage({ type: 'success', text: 'Node deleted successfully' });
      setDeleteNodeId('');
      window.location.reload();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete node',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEdge = async () => {
    if (!newEdge.source || !newEdge.target) {
      setMessage({ type: 'error', text: 'Source and Target are required' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/investment-tech-tree/api/edges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEdge),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add edge');
      }

      setMessage({ type: 'success', text: 'Edge added successfully' });
      setNewEdge({ source: '', target: '' });
      window.location.reload();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to add edge',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEdge = async () => {
    if (!deleteEdgeId) {
      setMessage({ type: 'error', text: 'Please enter an edge ID' });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete edge ${deleteEdgeId}?`)) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/investment-tech-tree/api/edges/${deleteEdgeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete edge');
      }

      setMessage({ type: 'success', text: 'Edge deleted successfully' });
      setDeleteEdgeId('');
      window.location.reload();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete edge',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      {message && (
        <Card className={message.type === 'error' ? 'border-red-500' : 'border-green-500'}>
          <CardContent className="pt-4">
            <p className={message.type === 'error' ? 'text-red-600' : 'text-green-600'}>
              {message.text}
            </p>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        {/* Add Node */}
        <AccordionItem value="add-node">
          <AccordionTrigger>Add Node</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Node ID</label>
                <Input
                  value={newNode.id}
                  onChange={(e) => setNewNode({ ...newNode, id: e.target.value })}
                  placeholder="e.g., concept_new_reactor"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Label</label>
                <Input
                  value={newNode.label}
                  onChange={(e) => setNewNode({ ...newNode, label: e.target.value })}
                  placeholder="Display name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={newNode.type} onValueChange={(value: NodeLabel) => setNewNode({ ...newNode, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NODE_LABELS.map(label => (
                      <SelectItem key={label} value={label}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={newNode.category}
                  onChange={(e) => setNewNode({ ...newNode, category: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="text-sm font-medium">TRL Current</label>
                <Input
                  value={newNode.trl_current}
                  onChange={(e) => setNewNode({ ...newNode, trl_current: e.target.value })}
                  placeholder="e.g., 3-4"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newNode.detailedDescription}
                  onChange={(e) => setNewNode({ ...newNode, detailedDescription: e.target.value })}
                  placeholder="Detailed description"
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium">References (one per line)</label>
                <Textarea
                  value={newNode.references}
                  onChange={(e) => setNewNode({ ...newNode, references: e.target.value })}
                  placeholder="Reference URLs or citations"
                  rows={3}
                />
              </div>
              <Button onClick={handleAddNode} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Add Node'}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Edit Node */}
        <AccordionItem value="edit-node">
          <AccordionTrigger>Edit Node</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={editNodeId}
                  onChange={(e) => setEditNodeId(e.target.value)}
                  placeholder="Enter node ID to edit"
                  className="flex-1"
                />
                <Button onClick={handleLoadNode} variant="outline">
                  Load
                </Button>
              </div>
              <div>
                <label className="text-sm font-medium">Label</label>
                <Input
                  value={editNode.label}
                  onChange={(e) => setEditNode({ ...editNode, label: e.target.value })}
                  placeholder="Display name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={editNode.type} onValueChange={(value: NodeLabel) => setEditNode({ ...editNode, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NODE_LABELS.map(label => (
                      <SelectItem key={label} value={label}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={editNode.category}
                  onChange={(e) => setEditNode({ ...editNode, category: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="text-sm font-medium">TRL Current</label>
                <Input
                  value={editNode.trl_current}
                  onChange={(e) => setEditNode({ ...editNode, trl_current: e.target.value })}
                  placeholder="e.g., 3-4"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editNode.detailedDescription}
                  onChange={(e) => setEditNode({ ...editNode, detailedDescription: e.target.value })}
                  placeholder="Detailed description"
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium">References (one per line)</label>
                <Textarea
                  value={editNode.references}
                  onChange={(e) => setEditNode({ ...editNode, references: e.target.value })}
                  placeholder="Reference URLs or citations"
                  rows={3}
                />
              </div>
              <Button onClick={handleUpdateNode} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Update Node'}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Delete Node */}
        <AccordionItem value="delete-node">
          <AccordionTrigger>Delete Node</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Node ID</label>
                <Input
                  value={deleteNodeId}
                  onChange={(e) => setDeleteNodeId(e.target.value)}
                  placeholder="Enter node ID to delete"
                />
              </div>
              <Button onClick={handleDeleteNode} disabled={isLoading} variant="destructive" className="w-full">
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Delete Node'}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Manage Edges */}
        <AccordionItem value="manage-edges">
          <AccordionTrigger>Manage Edges</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Add Edge</h4>
                <div>
                  <label className="text-sm font-medium">Source Node ID</label>
                  <Input
                    value={newEdge.source}
                    onChange={(e) => setNewEdge({ ...newEdge, source: e.target.value })}
                    placeholder="Source node ID"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Target Node ID</label>
                  <Input
                    value={newEdge.target}
                    onChange={(e) => setNewEdge({ ...newEdge, target: e.target.value })}
                    placeholder="Target node ID"
                  />
                </div>
                <Button onClick={handleAddEdge} disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Add Edge'}
                </Button>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium">Delete Edge</h4>
                <div>
                  <label className="text-sm font-medium">Edge ID</label>
                  <Input
                    value={deleteEdgeId}
                    onChange={(e) => setDeleteEdgeId(e.target.value)}
                    placeholder="Enter edge ID (source-target)"
                  />
                </div>
                <Button onClick={handleDeleteEdge} disabled={isLoading} variant="destructive" className="w-full">
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Delete Edge'}
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default EditTechTreePanel;