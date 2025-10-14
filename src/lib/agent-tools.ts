import { Db } from 'mongodb';
import { ValidationResult, AgentAction } from './agent-types';

export class AgentTools {
  constructor(private db: Db) {}

  /**
   * Validates a proposed change against the current database state
   */
  async validateChange(action: AgentAction): Promise<ValidationResult> {
    const nodesCollection = this.db.collection('nodes');
    const edgesCollection = this.db.collection('edges');

    switch (action.action) {
      case 'ADD_NODE': {
        const { id } = action.payload;
        
        if (!id) {
          return {
            isValid: false,
            reason: 'Node ID is required'
          };
        }

        // Check if node ID already exists
        const existingNode = await nodesCollection.findOne({ id });
        
        if (existingNode) {
          return {
            isValid: false,
            reason: `Node with ID '${id}' already exists`,
            suggestions: [
              `Consider using UPDATE_NODE to modify existing node`,
              `Try a unique ID like '${id}_v2' or '${id}_${Date.now()}'`
            ]
          };
        }

        return {
          isValid: true
        };
      }

      case 'UPDATE_NODE': {
        const { nodeId } = action.payload;
        
        if (!nodeId) {
          return {
            isValid: false,
            reason: 'Node ID is required for updates'
          };
        }

        // Check if node exists
        const existingNode = await nodesCollection.findOne({ id: nodeId });
        
        if (!existingNode) {
          return {
            isValid: false,
            reason: `Node with ID '${nodeId}' does not exist`,
            suggestions: [
              `Use ADD_NODE to create a new node`,
              `Verify the node ID is correct`
            ]
          };
        }

        return {
          isValid: true
        };
      }

      case 'ADD_EDGE': {
        const { source, target } = action.payload;
        
        if (!source || !target) {
          return {
            isValid: false,
            reason: 'Both source and target node IDs are required'
          };
        }

        // Check if both nodes exist
        const sourceNode = await nodesCollection.findOne({ id: source });
        const targetNode = await nodesCollection.findOne({ id: target });

        if (!sourceNode) {
          return {
            isValid: false,
            reason: `Source node '${source}' does not exist`
          };
        }

        if (!targetNode) {
          return {
            isValid: false,
            reason: `Target node '${target}' does not exist`
          };
        }

        // Check if edge already exists
        const edgeId = `${source}-${target}`;
        const existingEdge = await edgesCollection.findOne({ id: edgeId });

        if (existingEdge) {
          return {
            isValid: false,
            reason: `Edge from '${source}' to '${target}' already exists`
          };
        }

        return {
          isValid: true
        };
      }

      default:
        return {
          isValid: false,
          reason: `Unknown action type: ${action.action}`
        };
    }
  }

  /**
   * Checks for duplicate content in the tech tree
   */
  async checkDuplication(
    label: string,
    description: string
  ): Promise<{ isDuplicate: boolean; similarNodes: string[] }> {
    const nodesCollection = this.db.collection('nodes');
    
    // Simple similarity check - can be enhanced with fuzzy matching
    const similarByLabel = await nodesCollection
      .find({
        label: { $regex: label, $options: 'i' }
      })
      .limit(5)
      .toArray();

    const similarByDescription = await nodesCollection
      .find({
        $or: [
          { description: { $regex: description.substring(0, 50), $options: 'i' } },
          { detailedDescription: { $regex: description.substring(0, 50), $options: 'i' } }
        ]
      })
      .limit(5)
      .toArray();

    const similarNodes = [
      ...new Set([
        ...similarByLabel.map(n => n.label),
        ...similarByDescription.map(n => n.label)
      ])
    ];

    return {
      isDuplicate: similarNodes.length > 0,
      similarNodes
    };
  }
}