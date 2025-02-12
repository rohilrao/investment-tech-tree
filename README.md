# Today


# Issues
- Edges & Nodes are still removable (& Edges addable) after exiting edit-mode
- Edges are deleted in UI after some more complex updates

# Backlog
- Introduce Dev-DB
- Backup
- Node durch Doppelklick hinzufügen
- RAG

# Refactor
- Set Node-Attributes at one single point of truth (currently it's done while fetching, setting and updating)
- Rewrite Promises with async await
- Extract reactflow-Update Function in own file
- Remove local update of nodes & edges states after update in backend 
- Use only one action for update