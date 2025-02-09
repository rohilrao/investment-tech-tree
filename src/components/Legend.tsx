import { LABEL_COLORS, NodeLabel } from '@/lib/types';

export const Legend = () => {
  return (
    <div className="absolute top-6 left-4 bg-white p-3 shadow-lg rounded-md">
      <h4 className="font-bold mb-2">Legend</h4>
      {Object.entries(NodeLabel).map(([key, label]) => (
        <div key={key} className="flex items-center space-x-2 mt-1">
          <span className={`w-4 h-4 rounded bg-${LABEL_COLORS[label]}`}></span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};
