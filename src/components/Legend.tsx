'use client';

import { useGraphContext } from '@/app/GraphContext';
import { LABEL_COLORS, NodeLabel } from '@/lib/types';

export const Legend = () => {
  const { isEditable } = useGraphContext();
  return (
    <div className="absolute top-6 left-4 bg-white p-3 shadow-lg rounded-md">
      <h4 className="font-bold mb-2">Legend</h4>
      {Object.keys(NodeLabel)
        .filter((label) => isEditable || label != NodeLabel.New)
        .map((key) => (
          <div key={key} className="flex items-center space-x-2 mt-1">
            <span
              className={`w-4 h-4 rounded bg-${LABEL_COLORS[key as NodeLabel]}`}
            ></span>
            <span>{key}</span>
          </div>
        ))}
    </div>
  );
};
