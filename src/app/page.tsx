import TechTree from '@/components/TechTree';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function Home() {
  return (
    <ReactFlowProvider>
      <TechTree />
    </ReactFlowProvider>
  );
}
