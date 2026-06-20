## Why

Users need a way to upload local geospatial images and align them with a geographic map by specifying Ground Control Points (GCPs). This enables georeferencing arbitrary local images using GDAL.

## What Changes

- Add capability to upload local image files to the static image view on the right panel.
- Add an "Add Coordinates" mode button on the top-middle toolbar of the image pane, next to the "Crop" button.
- While "Add Coordinates" mode is active, clicking on the image pane places numbered GCP pins, and clicking on the geographic map places corresponding geographic coordinate pins.
- Render numbered pins on both the image pane and geographic map pane.
- Allow right-clicking a pin on either pane to delete it (along with its pair).
- Enforce that the user cannot deactivate the "Add Coordinates" mode if there are unequal coordinates (mismatched pairs, e.g. a pin exists on one pane but not the other).
- Support GDAL environment assumption (gdal and gdal2_tiles configured in the user's environment).

## Capabilities

### New Capabilities

- `coordinate-assignment`: Placing matching numbered pins on the image and map panes to establish ground control points, with validation preventing deactivation when pin pairs are incomplete/unequal.

### Modified Capabilities

- `dashboard-controls`: Adding the "Add Coordinates" button next to "Crop" in the image toolbar, and enabling the "Upload Image" side button to browse and load local image files.
- `main-dashboard`: Updating the map and image panes to render interactive coordinate pin layers and support dynamic image source loading instead of a hardcoded unsplash image.

## Impact

- Tauri backend: May need a dialog command or backend support to load local image files securely.
- Frontend components: Updates to `ImagePane.tsx`, `MapPane.tsx`, and state sync between them for active coordinate mode, pin coordinates, and image source.
- Dependencies: Assumption of GDAL binaries in the environment.
