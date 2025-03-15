import { createEdgeFromNodes } from '@/lib/data';
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
  createEdgeFromNodes(
    GaiaNodesUpdateStateNode,
    GaiaUsefulRepresentationDecisionsNode,
  );

const GaiaNodesInstantiateLocalModelsFromGaiaUsefulRepresentationDecisionsEdge: Edge =
  createEdgeFromNodes(
    GaiaNodesInstantiateLocalModelsNode,
    GaiaUsefulRepresentationDecisionsNode,
  );

const GaiaEfficientlyQueriedAppsFromGaiaUsefulRepresentationDecisionsEdge: Edge =
  createEdgeFromNodes(
    GaiaEfficientlyQueriedAppsNode,
    GaiaUsefulRepresentationDecisionsNode,
  );

const CriticalMassRepoFromGaiaUsefulRepresentationDecisionsEdge: Edge =
  createEdgeFromNodes(
    CriticalMassRepoNode,
    GaiaUsefulRepresentationDecisionsNode,
  );

const CriticalMassRepoFromGaiaVetOwnModelsEdge: Edge = createEdgeFromNodes(
  CriticalMassRepoNode,
  GaiaVetOwnModelsNode,
);

const CriticalMassRepoFromChallengingScenariosModelsCompeteEdge: Edge =
  createEdgeFromNodes(
    CriticalMassRepoNode,
    ChallengingScenariosModelsCompeteNode,
  );

const CriticalMassRepoFromGaiaOpenAiBlackBoxesEdge: Edge = createEdgeFromNodes(
  CriticalMassRepoNode,
  GaiaOpenAiBlackBoxesNode,
);

const CriticalMassRepoFromEnvironmentsTestHumanForEvalEdge: Edge =
  createEdgeFromNodes(CriticalMassRepoNode, EnvironmentsTestHumanForEvalNode);

const CriticalMassRepoFromEnvironmentsTestAgentAgentForEvalEdge: Edge =
  createEdgeFromNodes(
    CriticalMassRepoNode,
    EnvironmentsTestAgentAgentForEvalNode,
  );

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
