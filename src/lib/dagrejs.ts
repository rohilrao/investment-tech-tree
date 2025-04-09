import { DATA } from '@/DATA';
import { LABEL_COLORS_VARIABLES, UiNode } from '@/lib/types';
import dagre from '@dagrejs/dagre';

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 60;

export const getLayoutedElements = (direction = 'LR') => {
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 70, // Vertical distance between nodes
    ranksep: 150, // Horizontal distance between nodes
    edgesep: 80,
  });

  DATA.nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  DATA.edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = DATA.nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: direction === 'LR' ? 'left' : 'top',
      sourcePosition: direction === 'LR' ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      style: {
        borderColor: `${LABEL_COLORS_VARIABLES[node.data.nodeLabel]}`,
        borderStyle: 'solid',
        borderRadius: '6px',
      },
    } as UiNode;

    return newNode;
  });

  return { layoutedNodes: newNodes, layoutedEdges: DATA.edges };
};
