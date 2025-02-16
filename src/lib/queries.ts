import { QueryType, RETURNED_ID_ALIAS, RETURNED_NODE_ALIAS } from './types';

const READ_NODES_AND_EDGES_QUERY = () => `
     MATCH (source) 
     OPTIONAL MATCH (source)-[relationship]->(target) 
     RETURN source, relationship, target`;

const CREATE_NODE_QUERY = () => `
     CREATE (n {name: $name, description: $description, x: $x, y: $y, height: $height, width: $width}) 
     SET n:New
     RETURN n as ${RETURNED_NODE_ALIAS}`;

const UPDATE_NODE_POSITION_QUERY = () => `
     MATCH (n) WHERE elementId(n) = $id
     SET n.x = $x, n.y = $y
     RETURN n AS ${RETURNED_NODE_ALIAS}`;

const UPDATE_NODE_SIZE_QUERY = () => `
     MATCH (n) WHERE elementId(n) = $id
     SET n.width = $width, n.height = $height
     RETURN n AS ${RETURNED_NODE_ALIAS}`;

const UPDATE_NODE_CONTENT_QUERY = (label?: string) => `
     MATCH (n) WHERE elementId(n) = $id
     WITH n, labels(n) AS oldLabels
     CALL {
       WITH n, oldLabels
       UNWIND oldLabels AS oldLabel
       CALL apoc.create.removeLabels(n, [oldLabel]) YIELD node
       RETURN node
     }
     SET n:${label}
     SET n.name = $name, n.description = $description
     RETURN n AS ${RETURNED_NODE_ALIAS}`;

const UPDATE_NODE_CONTENT_AND_EMBEDDING_QUERY = (label?: string) => `
     MATCH (n) WHERE elementId(n) = $id
     WITH n, labels(n) AS oldLabels
     CALL {
       WITH n, oldLabels
       UNWIND oldLabels AS oldLabel
       CALL apoc.create.removeLabels(n, [oldLabel]) YIELD node
       RETURN node
     }
     SET n.name = $name, n.description = $description, n.embedding = $embedding
     SET n:${label}
     RETURN n AS ${RETURNED_NODE_ALIAS}`;

const DELETE_NODE_QUERY = () => `
      MATCH (n) WHERE elementId(n) = $id 
      DETACH DELETE n`;

const CREATE_EDGE_QUERY = (label?: string) => `
       MATCH (source), (target) 
       WHERE elementId(source) = $sourceId AND elementId(target) = $targetId 
       CREATE (source)-[r:${label}]->(target) 
       RETURN elementId(r) AS ${RETURNED_ID_ALIAS}`;

const DELETE_EDGE_QUERY = () => `
       MATCH (source)-[r]->(target) 
       WHERE elementId(source) = $sourceId AND elementId(target) = $targetId 
       DELETE r`;

const EXPORT_QUERY = () =>
  `CALL apoc.export.json.all(null,{useTypes:true, stream: true, writeNodeProperties: true})`;

// label and alias cant be set by query-parameters, that's why they're set via template literals
export const QUERIES: Record<QueryType, (label?: string) => string> = {
  [QueryType.GET_NODES_AND_EDGES]: READ_NODES_AND_EDGES_QUERY,

  [QueryType.CREATE_NODE]: CREATE_NODE_QUERY,
  [QueryType.DELETE_NODE]: DELETE_NODE_QUERY,

  [QueryType.UPDATE_NODE_CONTENT]: UPDATE_NODE_CONTENT_QUERY,
  [QueryType.UPDATE_NODE_CONTENT_AND_EMBEDDING]:
    UPDATE_NODE_CONTENT_AND_EMBEDDING_QUERY,

  [QueryType.UPDATE_NODE_POSITION]: UPDATE_NODE_POSITION_QUERY,
  [QueryType.UPDATE_NODE_SIZE]: UPDATE_NODE_SIZE_QUERY,

  [QueryType.CREATE_EDGE]: CREATE_EDGE_QUERY,
  [QueryType.DELETE_EDGE]: DELETE_EDGE_QUERY,

  [QueryType.EXPORT]: EXPORT_QUERY,
};
