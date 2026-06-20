## Context

The Jereferencer desktop application requires a dual-pane dashboard matching the Stitch design (Screen ID: `0bef8ae290cb433c94570d5fb67f602f`). This includes a geographic map (left) and static image (right) aligned edge-to-edge with zero space between them, and a top navigation menu containing "Layers" and "Export" links.

## Goals / Non-Goals

**Goals:**
- Implement a zero-gap dual pane split dashboard styled with Tailwind CSS and shadcn/ui.
- Display "Layers" and "Export" navigation links in the header, with "Layers" as the active tab.
- Render OpenStreetMap in the left pane and display the static image `ed-259-xcrI6CPkkJs-unsplash.jpg` in the right pane using OpenLayers.
- Position control overlays (search toggle, public-map, zoom controls, image action toolbars, side tabs) exactly matching the Stitch layout.
- Adopt a Clean Architecture, dividing components into presentation layers, map initialization hooks, and pure domain utilities.
- Write unit tests for search query coordinate parsing using Vitest.

**Non-Goals:**
- GCP mathematics or coordinate warping functionality.
- Database persistence or integration/E2E testing.

## Decisions

### 1. Zero-Gap adjacent layout
- **Decision**: Render map and image panes side-by-side using Tailwind's `w-1/2 h-full` classes with zero margins, padding, or borders between them, sharing the parent container boundaries.
- **Rationale**: Direct requirement to align maps edge-to-edge.

### 2. Static Image source
- **Decision**: Copy `images/ed-259-xcrI6CPkkJs-unsplash.jpg` into the `public/` directory so it is served by the local Vite dev server, and reference it as a static `ImageLayer` or flat-projection OpenLayers layer in the image pane.
- **Rationale**: Simplifies access for the frontend dev server and meets user criteria to load this specific unsplash photo.

### 3. Styled Floating Controls
- **Decision**: Use Tailwind CSS absolute positioning (`absolute top-4 left-4`, `absolute right-0 top-1/4`, etc.) and glassmorphism styling (`bg-surface-container/90 backdrop-blur-sm`) to render search buttons, world maps, zoom controls, and image manipulation tools exactly as shown in the Stitch dashboard.

### 4. Clean Architecture
- **Decision**: Separate UI elements (`MapPane.tsx`, `ImagePane.tsx`) from the OpenLayers state lifecycle hook, keeping the coordinate search string parser utility pure and testable.

## Risks / Trade-offs

- **Risk**: *Virtual DOM collisions*: OpenLayers modifies map container divs.
  - **Mitigation**: Standardize container target initialization using React `useRef` to avoid React re-render conflicts.
