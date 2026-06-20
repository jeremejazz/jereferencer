## Why

A georeferencing desktop application requires a side-by-side dashboard layout that allows the user to visually inspect a geographic map alongside a raw raster scan. Before building advanced alignment and point projection features, we must establish a solid layout structure, including the OpenLayers map viewports and basic layout controls.

## What Changes

- **Dual-Pane Dashboard Layout**: A side-by-side dual pane view styled with Tailwind CSS and Shadcn UI.
- **Left GIS Map Pane (OpenStreetMap)**: Initializes and loads OpenStreetMap using OpenLayers. Includes a basic coordinates/address search control.
- **Right Raster Image Pane**: Initializes and renders a static raster image using OpenLayers on a flat/pixel coordinate system.
- **Header Navigation**: A professional navigation header matching the application's GIS theme.
- **Styling and Architecture**: Styled using Tailwind CSS and shadcn/ui. Built using a Clean Architecture directory structure to isolate UI layout files from core OpenLayers initialization hooks.
- **Unit Testing**: Bare-bones unit test suite using Vitest for validating layout helpers (such as search input coordinates parsing).

## Capabilities

### New Capabilities

- `main-dashboard`: The core side-by-side split screen UI displaying the OpenLayers map on the left and the OpenLayers image viewer on the right.
- `dashboard-controls`: Header navigation and basic sidebar/toolbar controls (search bar on the map pane, zoom buttons, and static action buttons on the image pane).

### Modified Capabilities

No existing capabilities to modify.

## Impact

- **Frontend**: Overhauls `App.tsx` and customizes layout styles. Creates layout subcomponents under `src/components/` (e.g., `MapPane.tsx`, `ImagePane.tsx`, `Header.tsx`).
- **Dependencies**: Adds `ol` (OpenLayers) for map and image rendering. Adds Tailwind CSS and shadcn/ui components.
- **Testing**: Configures a Vitest unit test file for testing search coordinate parsing helpers.
