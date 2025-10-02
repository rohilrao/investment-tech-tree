'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Info, BarChart3 } from 'lucide-react';
import NodeDetails from './NodeDetails';
import Chat from './Chat';
import Simulations from './Simulations';
import { UiNode, TechTree } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabPanelProps {
  selectedNode?: UiNode;
  techTree: TechTree | null;
}

type TabType = 'details' | 'chat' | 'simulations';

const TabPanel = ({ selectedNode, techTree }: TabPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const previousNodeIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (
      selectedNode &&
      activeTab === 'chat' &&
      previousNodeIdRef.current !== selectedNode.id
    ) {
      setActiveTab('details');
    }
    previousNodeIdRef.current = selectedNode?.id;
  }, [selectedNode, activeTab]);

  return (
    <div className="flex flex-col h-full bg-white shadow-lg">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabType)}
        className="flex flex-col h-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageSquare size={16} />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center space-x-2">
            <Info size={16} />
            <span>Node Details</span>
          </TabsTrigger>
          <TabsTrigger value="simulations" className="flex items-center space-x-2">
            <BarChart3 size={16} />
            <span>Simulations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
          <Chat />
        </TabsContent>

        <TabsContent value="details" className="flex-1 overflow-hidden mt-0">
          <NodeDetails selectedNode={selectedNode} />
        </TabsContent>

        <TabsContent value="simulations" className="flex-1 overflow-y-auto mt-0">
          {techTree ? (
            <Simulations techTree={techTree} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading simulation data...</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TabPanel;