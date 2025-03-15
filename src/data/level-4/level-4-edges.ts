import { createEdge } from '@/lib/data';
import { Edge } from '@xyflow/react';
import {
  ChallengingScenariosModelsCompeteNode,
  EnvironmentsTestAgentAgentForEvalNode,
  EnvironmentsTestHumanForEvalNode,
  GaiaOpenAiBlackBoxesNode,
  GaiaUsefulRepresentationDecisionsNode,
  GaiaVetOwnModelsNode,
} from '../level-5/level-5-nodes';
import {
  CriticalMassRepoNode,
  GaiaEfficientlyQueriedAppsNode,
  GaiaNodesInstantiateLocalModelsNode,
  GaiaNodesUpdateStateNode,
} from './level-4-nodes';

const GaiaNodesUpdateStateFromGaiaUsefulRepresentationDecisionsEdge: Edge =
  createEdge(GaiaNodesUpdateStateNode, GaiaUsefulRepresentationDecisionsNode);

const GaiaNodesInstantiateLocalModelsFromGaiaUsefulRepresentationDecisionsEdge: Edge =
  createEdge(
    GaiaNodesInstantiateLocalModelsNode,
    GaiaUsefulRepresentationDecisionsNode,
  );

const GaiaEfficientlyQueriedAppsFromGaiaUsefulRepresentationDecisionsEdge: Edge =
  createEdge(
    GaiaEfficientlyQueriedAppsNode,
    GaiaUsefulRepresentationDecisionsNode,
  );

const CriticalMassRepoFromGaiaUsefulRepresentationDecisionsEdge: Edge =
  createEdge(CriticalMassRepoNode, GaiaUsefulRepresentationDecisionsNode);

const CriticalMassRepoFromGaiaVetOwnModelsEdge: Edge = createEdge(
  CriticalMassRepoNode,
  GaiaVetOwnModelsNode,
);

const CriticalMassRepoFromChallengingScenariosModelsCompeteEdge: Edge =
  createEdge(CriticalMassRepoNode, ChallengingScenariosModelsCompeteNode);

const CriticalMassRepoFromGaiaOpenAiBlackBoxesEdge: Edge = createEdge(
  CriticalMassRepoNode,
  GaiaOpenAiBlackBoxesNode,
);

const CriticalMassRepoFromEnvironmentsTestHumanForEvalEdge: Edge = createEdge(
  CriticalMassRepoNode,
  EnvironmentsTestHumanForEvalNode,
);

const CriticalMassRepoFromEnvironmentsTestAgentAgentForEvalEdge: Edge =
  createEdge(CriticalMassRepoNode, EnvironmentsTestAgentAgentForEvalNode);

export const LEVEL_4_EDGES: Edge[] = [
  GaiaNodesUpdateStateFromGaiaUsefulRepresentationDecisionsEdge,
  GaiaNodesInstantiateLocalModelsFromGaiaUsefulRepresentationDecisionsEdge,
  GaiaEfficientlyQueriedAppsFromGaiaUsefulRepresentationDecisionsEdge,
  CriticalMassRepoFromGaiaUsefulRepresentationDecisionsEdge,
  CriticalMassRepoFromGaiaVetOwnModelsEdge,
  CriticalMassRepoFromChallengingScenariosModelsCompeteEdge,
  CriticalMassRepoFromGaiaOpenAiBlackBoxesEdge,
  CriticalMassRepoFromEnvironmentsTestHumanForEvalEdge,
  CriticalMassRepoFromEnvironmentsTestAgentAgentForEvalEdge,
];
