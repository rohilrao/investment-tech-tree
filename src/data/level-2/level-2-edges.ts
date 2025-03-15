import { Edge } from '@xyflow/react';

const ContributionsIncentivizedReflectsDecisionValueFromAlgorithmicContributionsRepoEdge: Edge =
  {
    id: 'FROM-contributions-incentivized-reflects-decision-value-TO-algorithmic-contributions-repo',
    source: 'algorithmic-contributions-repo',
    target: 'contributions-incentivized-reflects-decision-value',
  };

const ContributionsIncentivizedReflectsDecisionValueFromModelRepoRobustAdversarialEdge: Edge =
  {
    id: 'FROM-contributions-incentivized-reflects-decision-value-TO-model-repo-robust-adversarial',
    source: 'model-repo-robust-adversarial',
    target: 'contributions-incentivized-reflects-decision-value',
  };

const PlugPlaySystemTestingFeedbackingFromCriticalMassRepoEdge: Edge = {
  id: 'FROM-plug-play-system-testing-feedbacking-TO-critical-mass-repo',
  source: 'critical-mass-repo',
  target: 'plug-play-system-testing-feedbacking',
};

const PlugPlaySystemTestingFeedbackingFromNonExpertsContributeModelsValidationEdge: Edge =
  {
    id: 'plug-play-system-testing-feedbacking-FROM-non-experts-contribute-models-validation',
    target: 'non-experts-contribute-models-validation',
    source: 'plug-play-system-testing-feedbacking',
  };

export const LEVEL_2_EDGES: Edge[] = [
  ContributionsIncentivizedReflectsDecisionValueFromAlgorithmicContributionsRepoEdge,
  ContributionsIncentivizedReflectsDecisionValueFromModelRepoRobustAdversarialEdge,
  PlugPlaySystemTestingFeedbackingFromCriticalMassRepoEdge,
  PlugPlaySystemTestingFeedbackingFromNonExpertsContributeModelsValidationEdge,
];
