'use client';

import { useGraphContext } from '@/app/GraphContext';
import { LABEL_COLORS, NODE_LABELS } from '@/lib/types';

export const Legend = () => {
  const { isEditable } = useGraphContext();
  return (
    <div className="absolute top-6 left-4 bg-white p-3 shadow-lg rounded-md">
      <h4 className="font-bold mb-2">Legend</h4>
      {NODE_LABELS.filter((label) => isEditable || label !== 'New').map(
        (label) => (
          <div key={label} className="flex items-center space-x-2 mt-1">
            <span
              className={`w-4 h-4 rounded bg-${LABEL_COLORS[label]}`}
            ></span>
            <span>{label}</span>
          </div>
        ),
      )}
    </div>
  );
};
