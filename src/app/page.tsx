import TechTree from '@/components/TechTree';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { GraphProvider } from './GraphContext';

export default function Home() {
  return (
    <GraphProvider>
      <ReactFlowProvider>
        <TechTree />
      </ReactFlowProvider>
    </GraphProvider>
  );
}
