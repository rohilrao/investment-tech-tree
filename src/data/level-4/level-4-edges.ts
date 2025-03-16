import { createEdgeFromNodes } from '@/lib/data';
import { Edge } from '@xyflow/react';
import {
  CreateChallengingScenariosForModelsToCompeteVsNode,
  CreateEnvironmentsToTestAgenttoagentNode,
  CreateEnvironmentsToTestHumantoagentNode,
  GaiaAllowsToOpenAiBlackBoxesNode,
  GaiaIsAUsefulRepresentationOfRealityForAgentsNode,
  GaiaAllowsToVetOwnModelsNode,
} from '../level-5/level-5-nodes';
import {
  CriticalMassRepoNode,
  GaiaCanBeEfficientlyQueriedInApplicationsNode,
  GaiaNodesCanInstantiateLocalModelsByAssemblingNode,
  GaiaNodesUpdateStateBasedOnObservationsNode,
} from './level-4-nodes';

const GaiaNodesUpdateStateFromGaiaUsefulRepresentationDecisionsEdge: Edge =
  createEdgeFromNodes(
    GaiaNodesUpdateStateBasedOnObservationsNode,
    GaiaIsAUsefulRepresentationOfRealityForAgentsNode,
  );

const GaiaNodesInstantiateLocalModelsFromGaiaUsefulRepresentationDecisionsEdge: Edge =
  createEdgeFromNodes(
    GaiaNodesCanInstantiateLocalModelsByAssemblingNode,
    GaiaIsAUsefulRepresentationOfRealityForAgentsNode,
  );

const GaiaEfficientlyQueriedAppsFromGaiaUsefulRepresentationDecisionsEdge: Edge =
  createEdgeFromNodes(
    GaiaCanBeEfficientlyQueriedInApplicationsNode,
    GaiaIsAUsefulRepresentationOfRealityForAgentsNode,
  );

const CriticalMassRepoFromGaiaUsefulRepresentationDecisionsEdge: Edge =
  createEdgeFromNodes(
    CriticalMassRepoNode,
    GaiaIsAUsefulRepresentationOfRealityForAgentsNode,
  );

const CriticalMassRepoFromGaiaVetOwnModelsEdge: Edge = createEdgeFromNodes(
  CriticalMassRepoNode,
  GaiaAllowsToVetOwnModelsNode,
);

const CriticalMassRepoFromChallengingScenariosModelsCompeteEdge: Edge =
  createEdgeFromNodes(
    CriticalMassRepoNode,
    CreateChallengingScenariosForModelsToCompeteVsNode,
  );

const CriticalMassRepoFromGaiaOpenAiBlackBoxesEdge: Edge = createEdgeFromNodes(
  CriticalMassRepoNode,
  GaiaAllowsToOpenAiBlackBoxesNode,
);

const CriticalMassRepoFromEnvironmentsTestHumanForEvalEdge: Edge =
  createEdgeFromNodes(
    CriticalMassRepoNode,
    CreateEnvironmentsToTestHumantoagentNode,
  );

const CriticalMassRepoFromEnvironmentsTestAgentAgentForEvalEdge: Edge =
  createEdgeFromNodes(
    CriticalMassRepoNode,
    CreateEnvironmentsToTestAgenttoagentNode,
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
