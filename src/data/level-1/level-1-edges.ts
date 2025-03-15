import { Edge } from '@xyflow/react';

const MiniGaiaRepoDefinedDomainFromAlgorithmicContributionsRepoEdge: Edge = {
  id: 'mini-gaia-repo-defined-domain-FROM-algorithmic-contributions-repo',
  source: 'algorithmic-contributions-repo',
  target: 'mini-gaia-repo-defined-domain',
};

const MiniGaiaRepoDefinedDomainFromPlugPlaySystemTestingFeedbackingEdge: Edge =
  {
    id: 'mini-gaia-repo-defined-domain-FROM-plug-play-system-testing-feedbacking',
    source: 'plug-play-system-testing-feedbacking',
    target: 'mini-gaia-repo-defined-domain',
  };

export const LEVEL_1_EDGES = [
  MiniGaiaRepoDefinedDomainFromAlgorithmicContributionsRepoEdge,
  MiniGaiaRepoDefinedDomainFromPlugPlaySystemTestingFeedbackingEdge,
];
