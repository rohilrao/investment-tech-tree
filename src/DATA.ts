import { NodesAndEdges } from '@/lib/types';

export const DATA: NodesAndEdges = {
  nodes: [
    {
      id: 'mini-gaia-repo-defined-domain',
      data: {
        label: 'Mini-Gaia repo for a defined domain',
        description: '',
        nodeLabel: 'Technology',
      },
    },
    {
      id: 'contributions-are-incentivized-way-that',
      data: {
        label:
          'Contributions are incentivized in a way that reflects the contributors decision value',
        description: '',
        nodeLabel: 'Target',
      },
    },
    {
      id: 'plug-play-system-testing-feedbacking',
      data: {
        label:
          'Plug and Play System for Testing + Feedbacking on Models in Gaia or own environments',
        description: '',
        nodeLabel: 'Technology',
      },
    },
    {
      id: 'query-update-protocol-built-value',
      data: {
        label: 'Query and update protocol with built-in value metrics',
        description: '',
        nodeLabel: 'Technology',
      },
    },
    {
      id: 'model-repository-is-robust-adversarial',
      data: {
        label: 'Model repository is robust to adversarial behavior',
        description: '',
        nodeLabel: 'Target',
      },
    },
    {
      id: 'algorithmic-contributions-repository',
      data: {
        label: 'Algorithmic contributions to repository',
        description: '',
        nodeLabel: 'Technology',
      },
    },
    {
      id: 'non-experts-can-contribute-development',
      data: {
        label: 'Non-experts can contribute to model development and validation',
        description: '',
        nodeLabel: 'Target',
      },
    },
    {
      id: 'gaia-nodes-update-state-observations',
      data: {
        label: 'Gaia nodes update state based on observations',
        description: '',
        nodeLabel: 'Target',
      },
    },
    {
      id: 'gaia-nodes-instantiate-local-models',
      data: {
        label:
          'Gaia nodes can instantiate local models by assembling components from repository',
        description: '',
        nodeLabel: 'Target',
      },
    },
    {
      id: 'gaia-efficiently-queried-applications',
      data: {
        label:
          'Gaia can be efficiently queried in applications, including queries across nodes',
        description: '',
        nodeLabel: 'Target',
      },
    },
    {
      id: 'critical-mass-repo',
      data: {
        label: 'Critical mass repo',
        description:
          'A repository of high-quality models with critical mass in terms of size and diversity',
        nodeLabel: 'Technology',
      },
    },
    {
      id: 'gaia-useful-representation-reality',
      data: {
        label:
          'Gaia is a useful representation of reality for agents to make decisions on',
        description: '',
        nodeLabel: 'Target',
      },
    },
    {
      id: 'gaia-vet-own-models',
      data: {
        label: 'Gaia allows to vet own models',
        description: '',
        nodeLabel: 'Target',
      },
    },
    {
      id: 'create-challenging-scenarios-models',
      data: {
        label:
          'Create challenging scenarios for models to compete vs. each other',
        description: '',
        nodeLabel: 'Target',
      },
    },
    {
      id: 'gaia-open-ai-black-boxes',
      data: {
        label: 'Gaia allows to open AI Black Boxes',
        description: '',
        nodeLabel: 'Target',
      },
    },
    {
      id: 'create-environments-human-agent',
      data: {
        label:
          'Create environments to test human-to-agent coordination scenarios for evaluation',
        description: '',
        nodeLabel: 'Target',
      },
    },
    {
      id: 'create-environments-agent-agent',
      data: {
        label:
          'Create environments to test agent-to-agent coordination scenarios for evaluation',
        description: '',
        nodeLabel: 'Target',
      },
    },
  ],
  edges: [
    {
      id: 'algorithmic-contributions-repository-TO-mini-gaia-repo-defined-domain',
      source: 'mini-gaia-repo-defined-domain',
      target: 'algorithmic-contributions-repository',
    },
    {
      id: 'plug-play-system-testing-feedbacking-TO-mini-gaia-repo-defined-domain',
      source: 'mini-gaia-repo-defined-domain',
      target: 'plug-play-system-testing-feedbacking',
    },
    {
      id: 'model-repository-is-robust-adversarial-TO-contributions-are-incentivized-way-that',
      source: 'contributions-are-incentivized-way-that',
      target: 'model-repository-is-robust-adversarial',
    },
    {
      id: 'algorithmic-contributions-repository-TO-contributions-are-incentivized-way-that',
      source: 'contributions-are-incentivized-way-that',
      target: 'algorithmic-contributions-repository',
    },
    {
      id: 'critical-mass-repo-TO-plug-play-system-testing-feedbacking',
      source: 'plug-play-system-testing-feedbacking',
      target: 'critical-mass-repo',
    },
    {
      id: 'non-experts-can-contribute-development-TO-plug-play-system-testing-feedbacking',
      source: 'plug-play-system-testing-feedbacking',
      target: 'non-experts-can-contribute-development',
    },
    {
      id: 'gaia-efficiently-queried-applications-TO-query-update-protocol-built-value',
      source: 'query-update-protocol-built-value',
      target: 'gaia-efficiently-queried-applications',
    },
    {
      id: 'critical-mass-repo-TO-query-update-protocol-built-value',
      source: 'query-update-protocol-built-value',
      target: 'critical-mass-repo',
    },
    {
      id: 'critical-mass-repo-TO-model-repository-is-robust-adversarial',
      source: 'model-repository-is-robust-adversarial',
      target: 'critical-mass-repo',
    },
    {
      id: 'critical-mass-repo-TO-algorithmic-contributions-repository',
      source: 'algorithmic-contributions-repository',
      target: 'critical-mass-repo',
    },
    {
      id: 'critical-mass-repo-TO-non-experts-can-contribute-development',
      source: 'non-experts-can-contribute-development',
      target: 'critical-mass-repo',
    },
    {
      id: 'gaia-useful-representation-reality-TO-gaia-nodes-update-state-observations',
      source: 'gaia-nodes-update-state-observations',
      target: 'gaia-useful-representation-reality',
    },
    {
      id: 'gaia-useful-representation-reality-TO-gaia-nodes-instantiate-local-models',
      source: 'gaia-nodes-instantiate-local-models',
      target: 'gaia-useful-representation-reality',
    },
    {
      id: 'gaia-useful-representation-reality-TO-gaia-efficiently-queried-applications',
      source: 'gaia-efficiently-queried-applications',
      target: 'gaia-useful-representation-reality',
    },
    {
      id: 'gaia-useful-representation-reality-TO-critical-mass-repo',
      source: 'critical-mass-repo',
      target: 'gaia-useful-representation-reality',
    },
    {
      id: 'gaia-vet-own-models-TO-critical-mass-repo',
      source: 'critical-mass-repo',
      target: 'gaia-vet-own-models',
    },
    {
      id: 'create-challenging-scenarios-models-TO-critical-mass-repo',
      source: 'critical-mass-repo',
      target: 'create-challenging-scenarios-models',
    },
    {
      id: 'gaia-open-ai-black-boxes-TO-critical-mass-repo',
      source: 'critical-mass-repo',
      target: 'gaia-open-ai-black-boxes',
    },
    {
      id: 'create-environments-human-agent-TO-critical-mass-repo',
      source: 'critical-mass-repo',
      target: 'create-environments-human-agent',
    },
    {
      id: 'create-environments-agent-agent-TO-critical-mass-repo',
      source: 'critical-mass-repo',
      target: 'create-environments-agent-agent',
    },
  ],
};
