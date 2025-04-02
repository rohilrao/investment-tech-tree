# README

## Data structure

All nodes and edges are inside [src/DATA.ts](src/DATA.ts).

If you want to **add or modify a node** or edge, you have two options:

- **Manually in [src/DATA.ts](src/DATA.ts)** ➔ can be done without running the code locally
- **Via UI support** (see next sections) ➔ requires to run the code locally

## Run code

To run this project locally:

- Install Node.js (https://nodejs.org/en/download)
- Create file tech-tree/.env.local & NEXT_PUBLIC_ENVIRONMENT=development
- npm i
- npm run dev
- You'll find the tech-tree on http://localhost:3000/tech-tree

## Add or edit node with UI-support

1. **Add or select a node**
   - Click "Add node" or
   - Click on an existing one to edit it.
2. **Make changes**
   - Modify values in the editor (on the right) and click "Save (Only temporarily)".
   - Move the node to change its position.
   - Resize the node if needed.
3. **Copy the JSON**
   - After each change the node's new code is automatically copied into your clipboard.
   - You can also click manually on "Copy code to clipboard" in the editor’s top-right corner.
4. **Paste the code**
   - Insert the copied code into [src/DATA.ts](src/DATA.ts).
5. **Verify the node was edited/added**
   - Find the edited/added node on http://localhost:3000/tech-tree
   - Validate it's properties

## Add edge with UI-support

1. **Create an edge**
   - Connect two nodes with an edge.
   - The edge is automatically copied into your clipboard.
   - You can also click manually on an existing edge to copy it into your clipboard.
2. **Paste the code**
   -Insert the copied code into [src/DATA.ts](src/DATA.ts).
3. **Verify the edge was added**
   - Find the added edge on http://localhost:3000/tech-tree
