import { TechTreeContainer } from '@/components/TechTreeContainer';
import { GraphProvider } from './GraphContext';

export default function Home() {
  return (
    <GraphProvider>
      <TechTreeContainer />
    </GraphProvider>
  );
}
