'use client';

import { LABEL_COLORS, UiNode } from '@/lib/types';
import { Manual } from './Manual';

type NodeDetailsProps = { selectedNode?: UiNode };

const NodeDetails = ({ selectedNode }: NodeDetailsProps) => {
  if (!selectedNode) return <Manual />;

  return (
    <div className="p-4 mb flex flex-col h-full shadow-md">
      {!selectedNode && <Manual />}

      {selectedNode && (
        <>
          <div className="flex justify-between items-end border-b border-gray-300 pb-2 gap-4">
            <h3 className="text-lg font-bold">{selectedNode.data.label}</h3>

            <span
              className={`inline-block px-3 py-1 text-sm font-semibold rounded bg-${LABEL_COLORS[selectedNode.data.nodeLabel]}`}
            >
              {selectedNode.data.nodeLabel}
            </span>
          </div>
          <div className="overflow-auto flex-grow">
            <p className="p-2 w-full mt-2">{selectedNode.data.description}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default NodeDetails;
