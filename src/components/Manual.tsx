'use client';

export const Manual = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Manual</h2>

      <h3 className="mt-4 text-lg font-semibold text-gray-700">
        Select a node
      </h3>
      <p className="text-gray-600">
        Explore the selected node&apos;s properties and relationships.
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
          <strong>Fit View:</strong> Use the control panel button at the bottom
          left corner to center all nodes.
        </li>
      </ul>
    </div>
  );
};
