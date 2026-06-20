## Why

In the GDAL warping pipeline, the backend Tauri command fails because it attempts to pass `-gcp` arguments directly to `gdalwarp`. However, `gdalwarp` does not accept `-gcp` options directly; GCPs must be embedded in the input raster dataset. Additionally, drawing a crop rectangle on the image viewport is buggy and jumpy because it uses DOM-level `evt.offsetX` / `offsetY` values, which change depending on the pointer target element.

## What Changes

- **Backend Warping Pipeline**: Update the Tauri backend command `warp_image` to execute in two stages:
  1. Call `gdal_translate` with `-gcp` options to write an intermediate GeoTIFF dataset with embedded ground control points.
  2. Call `gdalwarp` on the intermediate GeoTIFF dataset to output the warped PNG image.
  3. Ensure temporary files (like intermediate GeoTIFFs) are cleaned up correctly after completion.
- **Frontend Rectangle Drawing**: Update the `ImagePane` component to use OpenLayers' native `map.getEventPixel(evt)` method for drag-and-draw crop boundaries to ensure smooth drawing coordinates, resolving issues caused by pointer target elements.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `gdal-warping`: Modify implementation behavior to assign GCPs via `gdal_translate` before running `gdalwarp`.
- `image-cropping`: Modify the drag-and-draw mechanism to calculate coordinates reliably using OpenLayers' event mapping API.

## Impact

- `src-tauri/src/lib.rs`: Update the `warp_image` backend function.
- `src/components/ImagePane.tsx`: Refactor `handlePointerDown`, `handlePointerUp`, and `pointermove` event handlers.
