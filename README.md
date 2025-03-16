# README

## Run code

To run this project locally:

- Set NEXT_PUBLIC_ENVIRONMENT=development in .env.local
- npm i
- npm run dev

## Data structure

All nodes and edges are inside [src/data](src/data). They're sorted by level, starting with the lowest on the left side of the graph.

If you want to add or modify a node or edge, you have two options:

- **Manually in the code** (e.g., directly in the files under src/data)
- **Via UI support** (see next section; until now only available vor nodes)

## Add or edit node with UI-support

1. **Add or select a node**
   - Click "Add node" or
   - Click on an existing one to edit it.
2. **Make changes**
   - Modify values in the editor (on the right) and click "Save".
   - Move the node to change its position.
   - Resize the node if needed.
3. **Copy the JSON**
   - Click "Copy code to clipboard" in the editor’s top-right corner.
4. **Paste the code**
   - Insert the copied code into the respective level-x-nodes.ts file in [src/data](src/data).
   - Insert the node's variable name in the array (in the same file where the node was added).

## Add edge with UI-support

- TBD

## Todos

- Deploy via github pages
- New functionalities
  - Support for adding relationships: Connect nodes, click on edge (copy into clipboard) and then paste into data-file?
  - Add node by double click
