## Why

The GDAL warping feature is not aligning image features correctly. Instead, the warped image is stretched so that its outer edges align exactly with the coordinate pins (GCPs). This is because the frontend uses the bounding box of the user-placed pins as the geographic extent of the output overlay, whereas `gdalwarp` produces an image whose true boundaries extend beyond the pins.

## What Changes

- **Modify Tauri backend `warp_image` command**:
  - Perform the warp process to an intermediate GeoTIFF rather than directly to a PNG.
  - Run `gdalinfo -json` on the warped GeoTIFF to extract the actual geographic extent (bounding box coordinates) of the warped output.
  - Convert the warped GeoTIFF to the final transparent PNG.
  - Return a structured response containing both the relative web URL of the warped PNG and its exact geographic extent (`[minLon, minLat, maxLon, maxLat]`).
- **Update frontend state & rendering**:
  - Modify `MainDashboard.tsx` to handle the new return type from `warp_image`.
  - Pass the backend-calculated geographic extent of the warped image to `MapPane.tsx` for the OpenLayers `ImageStatic` layer extent, rather than calculating it from the pin coordinates.

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- `gdal-warping`: Update the GDAL warp execution requirement to determine the true warped image extent from the output file metadata and use it for rendering.

## Impact

- `src-tauri/src/lib.rs`: Modify the `warp_image` Tauri command implementation and its return type.
- `src/components/MainDashboard.tsx`: Update the state, types, and the invoke call handling.
- `openspec/specs/gdal-warping/spec.md`: Update specification requirements.
