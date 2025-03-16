import { createEdgeFromNodes } from '@/lib/data';
import { Edge } from '@xyflow/react';
import {
  CreateChallengingScenariosForModelsToCompeteVsEach,
  CreateEnvironmentsToTestAgentToAgentCoordination,
  CreateEnvironmentsToTestHumanToAgentCoordination,
  GaiaAllowsToOpenAiBlackBoxes,
  GaiaAllowsToVetOwnModels,
  GaiaIsAUsefulRepresentationOfRealityForAgentsTo,
} from '../level-5/level-5-nodes';
import {
  CriticalMassRepo,
  GaiaCanBeEfficientlyQueriedInApplicationsIncluding,
  GaiaNodesCanInstantiateLocalModelsByAssembling,
  GaiaNodesUpdateStateBasedOnObservations,
} from './level-4-nodes';

const GaiaNodesUpdateStateBasedOnObservations_FROM_GaiaIsAUsefulRepresentationOfRealityForAgentsTo: Edge =
  createEdgeFromNodes(
    GaiaNodesUpdateStateBasedOnObservations,
    GaiaIsAUsefulRepresentationOfRealityForAgentsTo,
  );

const GaiaNodesCanInstantiateLocalModelsByAssembling_FROM_GaiaIsAUsefulRepresentationOfRealityForAgentsTo: Edge =
  createEdgeFromNodes(
    GaiaNodesCanInstantiateLocalModelsByAssembling,
    GaiaIsAUsefulRepresentationOfRealityForAgentsTo,
  );

const GaiaCanBeEfficientlyQueriedInApplicationsIncluding_FROM_GaiaIsAUsefulRepresentationOfRealityForAgentsTo: Edge =
  createEdgeFromNodes(
    GaiaCanBeEfficientlyQueriedInApplicationsIncluding,
    GaiaIsAUsefulRepresentationOfRealityForAgentsTo,
  );

const CriticalMassRepo_FROM_GaiaIsAUsefulRepresentationOfRealityForAgentsTo: Edge =
  createEdgeFromNodes(
    CriticalMassRepo,
    GaiaIsAUsefulRepresentationOfRealityForAgentsTo,
  );

const CriticalMassRepo_FROM_GaiaAllowsToVetOwnModels: Edge =
  createEdgeFromNodes(CriticalMassRepo, GaiaAllowsToVetOwnModels);

const CriticalMassRepo_FROM_CreateChallengingScenariosForModelsToCompeteVsEach: Edge =
  createEdgeFromNodes(
    CriticalMassRepo,
    CreateChallengingScenariosForModelsToCompeteVsEach,
  );

const CriticalMassRepo_FROM_GaiaAllowsToOpenAiBlackBoxes: Edge =
  createEdgeFromNodes(CriticalMassRepo, GaiaAllowsToOpenAiBlackBoxes);

const CriticalMassRepo_FROM_CreateEnvironmentsToTestHumanToAgentCoordination: Edge =
  createEdgeFromNodes(
    CriticalMassRepo,
    CreateEnvironmentsToTestHumanToAgentCoordination,
  );

const CriticalMassRepo_FROM_CreateEnvironmentsToTestAgentToAgentCoordination: Edge =
  createEdgeFromNodes(
    CriticalMassRepo,
    CreateEnvironmentsToTestAgentToAgentCoordination,
  );

export const LEVEL_4_EDGES: Edge[] = [
  GaiaNodesUpdateStateBasedOnObservations_FROM_GaiaIsAUsefulRepresentationOfRealityForAgentsTo,
  GaiaNodesCanInstantiateLocalModelsByAssembling_FROM_GaiaIsAUsefulRepresentationOfRealityForAgentsTo,
  GaiaCanBeEfficientlyQueriedInApplicationsIncluding_FROM_GaiaIsAUsefulRepresentationOfRealityForAgentsTo,
  CriticalMassRepo_FROM_GaiaIsAUsefulRepresentationOfRealityForAgentsTo,
  CriticalMassRepo_FROM_GaiaAllowsToVetOwnModels,
  CriticalMassRepo_FROM_CreateChallengingScenariosForModelsToCompeteVsEach,
  CriticalMassRepo_FROM_GaiaAllowsToOpenAiBlackBoxes,
  CriticalMassRepo_FROM_CreateEnvironmentsToTestHumanToAgentCoordination,
  CriticalMassRepo_FROM_CreateEnvironmentsToTestAgentToAgentCoordination,
];
