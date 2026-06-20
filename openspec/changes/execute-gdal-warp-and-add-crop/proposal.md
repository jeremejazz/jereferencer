## Why

The application currently lacks a way to georeference and warp the uploaded image to display it as an overlay on the geographic map. Additionally, there is no capability to crop the uploaded image to exclude margins, nor any safeguard to ensure coordinate pins are placed within valid crop boundaries.

## What Changes

- **Remove Placeholder Image**: Remove the initial default static image placeholder (`ed-259-xcrI6CPkkJs-unsplash.jpg`) from the image pane to ensure the application starts in an empty state.
- **Overlay Toggle Button**:
  - Add logic to the "Overlay" button on the image toolbar.
  - Clicking "Overlay" toggles the display of the warped image on the geographic map.
  - Activating the toggle requires at least 3 coordinate pin pairs to have been assigned.
  - When activated, it executes a GDAL warp command via Tauri, creating a warped PNG image named `<name>_warped.png` in the application state directory, and renders it as an OpenLayers Image layer overlay on the geographic map.
  - If the coordinates or crop rectangle have not changed since the last warping, it displays the previously warped image without re-running GDAL warp.
  - When deactivated, the overlay is removed from the geographic map.
- **Crop Button and Spotlight**:
  - Add logic to the "Crop" button to toggle drawing a cropping rectangle on the image pane.
  - Render a spotlight visual effect on the image pane (a semi-transparent overlay fill outside the drawn rectangle).
  - Enforce bounds: users cannot place coordinate pins outside the crop rectangle, and users cannot draw a crop rectangle that excludes already placed coordinate pins.
- **Dependencies**: Add `turfjs` (or `@turf/turf`) to dependencies for coordinate boundary validation.

## Capabilities

### New Capabilities

- `gdal-warping`: Supports executing a GDAL warp command on the backend via Tauri, converting the result to a PNG image overlay, and rendering it dynamically over the geographic map when the overlay toggle is active.
- `image-cropping`: Supports drawing a bounding crop rectangle on the image viewport, rendering a spotlight visual effect, and managing crop coordinates.

### Modified Capabilities

- `main-dashboard`: Remove default placeholder image initialization.
- `dashboard-controls`: Integrate the Overlay and Crop buttons, and handle state toggles.
- `coordinate-assignment`: Validate coordinate placement and crop rectangle boundaries using Turf.js to prevent pins or crop boundaries from crossing each other.

## Impact

- **Frontend (`src/components/`)**:
  - `ImagePane.tsx`: Implement drawing interaction for crop rectangle, render spotlight overlay, and enforce pin placement limits.
  - `MapPane.tsx`: Render the warped image overlay.
  - `MainDashboard.tsx`: Orchestrate coordinate count validation for overlay toggle, manage crop state, and invoke Tauri warp command.
- **Backend (`src-tauri/`)**:
  - `lib.rs`: Implement a Tauri command to run `gdalwarp` and handle file format conversion if necessary.
- **Dependencies**: Add `@turf/turf` to `package.json` for geometry checks.
