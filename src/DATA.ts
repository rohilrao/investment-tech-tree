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
          'Create environments for testing human-to-agent coordination scenarios for evaluation',
        description: '',
        nodeLabel: 'Target',
      },
    },
  ],
  edges: [
    {
      id: 'mini-gaia-repo-defined-domain-TO-algorithmic-contributions-repository',
      source: 'mini-gaia-repo-defined-domain',
      target: 'algorithmic-contributions-repository',
    },
    {
      id: 'mini-gaia-repo-defined-domain-TO-plug-play-system-testing-feedbacking',
      source: 'mini-gaia-repo-defined-domain',
      target: 'plug-play-system-testing-feedbacking',
    },
    {
      id: 'contributions-are-incentivized-way-that-TO-model-repository-is-robust-adversarial',
      source: 'contributions-are-incentivized-way-that',
      target: 'model-repository-is-robust-adversarial',
    },
    {
      id: 'contributions-are-incentivized-way-that-TO-algorithmic-contributions-repository',
      source: 'contributions-are-incentivized-way-that',
      target: 'algorithmic-contributions-repository',
    },
    {
      id: 'plug-play-system-testing-feedbacking-TO-critical-mass-repo',
      source: 'plug-play-system-testing-feedbacking',
      target: 'critical-mass-repo',
    },
    {
      id: 'plug-play-system-testing-feedbacking-TO-non-experts-can-contribute-development',
      source: 'plug-play-system-testing-feedbacking',
      target: 'non-experts-can-contribute-development',
    },
    {
      id: 'query-update-protocol-built-value-TO-gaia-efficiently-queried-applications',
      source: 'query-update-protocol-built-value',
      target: 'gaia-efficiently-queried-applications',
    },
    {
      id: 'query-update-protocol-built-value-TO-critical-mass-repo',
      source: 'query-update-protocol-built-value',
      target: 'critical-mass-repo',
    },
    {
      id: 'model-repository-is-robust-adversarial-TO-critical-mass-repo',
      source: 'model-repository-is-robust-adversarial',
      target: 'critical-mass-repo',
    },
    {
      id: 'algorithmic-contributions-repository-TO-critical-mass-repo',
      source: 'algorithmic-contributions-repository',
      target: 'critical-mass-repo',
    },
    {
      id: 'non-experts-can-contribute-development-TO-critical-mass-repo',
      source: 'non-experts-can-contribute-development',
      target: 'critical-mass-repo',
    },
    {
      id: 'gaia-nodes-update-state-observations-TO-gaia-useful-representation-reality',
      source: 'gaia-nodes-update-state-observations',
      target: 'gaia-useful-representation-reality',
    },
    {
      id: 'gaia-nodes-instantiate-local-models-TO-gaia-useful-representation-reality',
      source: 'gaia-nodes-instantiate-local-models',
      target: 'gaia-useful-representation-reality',
    },
    {
      id: 'gaia-efficiently-queried-applications-TO-gaia-useful-representation-reality',
      source: 'gaia-efficiently-queried-applications',
      target: 'gaia-useful-representation-reality',
    },
    {
      id: 'critical-mass-repo-TO-gaia-useful-representation-reality',
      source: 'critical-mass-repo',
      target: 'gaia-useful-representation-reality',
    },
    {
      id: 'critical-mass-repo-TO-gaia-vet-own-models',
      source: 'critical-mass-repo',
      target: 'gaia-vet-own-models',
    },
    {
      id: 'critical-mass-repo-TO-create-challenging-scenarios-models',
      source: 'critical-mass-repo',
      target: 'create-challenging-scenarios-models',
    },
    {
      id: 'critical-mass-repo-TO-gaia-open-ai-black-boxes',
      source: 'critical-mass-repo',
      target: 'gaia-open-ai-black-boxes',
    },
    {
      id: 'critical-mass-repo-TO-create-environments-human-agent',
      source: 'critical-mass-repo',
      target: 'create-environments-human-agent',
    },
    {
      id: 'critical-mass-repo-TO-create-environments-agent-agent',
      source: 'critical-mass-repo',
      target: 'create-environments-agent-agent',
    },
  ],
};
