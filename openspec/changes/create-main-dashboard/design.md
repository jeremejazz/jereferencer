## Context

The Jereferencer desktop application requires a side-by-side dashboard layout for maps and images. We will implement this bare-bones interface using React, Tailwind CSS, shadcn/ui, and OpenLayers.

## Goals / Non-Goals

**Goals:**
- Implement a two-pane layout using Tailwind CSS and shadcn/ui.
- Use OpenLayers (`ol` library) to render OpenStreetMap on the left and a static image view on the right.
- Add coordinate/address search capability on the map.
- Organize components following Clean Architecture by isolating DOM-interacting map initializations from pure UI layouts.
- Setup Vitest for unit testing helper functions (e.g., coordinate text parsing), with zero integration or browser tests.

**Non-Goals:**
- GCP creation, coordinate transformations, warping, or georeferencing math (out of scope for this task).
- Database or file storage persistence.
- Integration/E2E testing.

## Decisions

### 1. shadcn/ui and Tailwind CSS
- **Decision**: Style the app with Tailwind CSS and install shadcn/ui components (such as inputs and buttons) to create a premium-looking dark theme matching the Stitch design.
- **Rationale**: Highly customizable, accessible, and requested.

### 2. Dual OpenLayers viewports
- **Decision**: Initialize two separate OpenLayers map viewports:
  - Left viewport: standard `TileLayer` fetching OpenStreetMap tiles.
  - Right viewport: standard image rendering utilizing a static `ImageLayer` or an un-projected flat view map.
- **Rationale**: Meets requirement to use OpenLayers on both sides while setting up a native layout baseline.

### 3. Clean Architecture structure
- **Decision**: Separate the file structure as follows:
  - **Domain / Lib**: Pure TypeScript utility functions (e.g. coordinates search parser).
  - **Adapters / Hooks**: Custom React hooks (like `useMapInstance`) that manage OpenLayers instance lifecycles using `useRef` targets.
  - **Presentation**: shadcn/ui components and wrapper layouts (`MapPane`, `ImagePane`, `Header`).
- **Rationale**: Separating the map framework code from the React UI components makes the layout easier to manage and test.

### 4. Unit Testing Only
- **Decision**: Use Vitest to write unit tests for the search query coordinate parser.
- **Rationale**: Enforces the strict "unit tests only" constraint.

## Risks / Trade-offs

- **Risk**: *Virtual DOM vs OpenLayers DOM*: OpenLayers modifies the DOM directly inside map targets, which can cause rendering issues if React re-renders.
  - **Mitigation**: Utilize React `useRef` references for map targets and initialize OpenLayers map instances inside a single `useEffect` block, cleaning them up on unmount.
