## 1. Backend: Implement Two-Stage GDAL Warping Pipeline

- [ ] 1.1 In `src-tauri/src/lib.rs`, update the `warp_image` command to execute `gdal_translate` with `-gcp` arguments first to generate an intermediate GeoTIFF file in the app cache directory.
- [ ] 1.2 Update the backend command execution to call `gdalwarp` (using Thin Plate Spline `-tps`) with the intermediate GeoTIFF file as input and generating the warped PNG file as output.
- [ ] 1.3 Add code to clean up/delete the intermediate GeoTIFF file from disk after execution completes (both on success and failure).
- [ ] 1.4 Test error handling in the backend to ensure any failures in `gdal_translate` or `gdalwarp` return helpful, clean validation errors.

## 2. Frontend: Reliable Drag-and-Draw Crop Coordinates

- [ ] 2.1 Refactor the `handlePointerDown` function in `ImagePane.tsx` to calculate coordinates using `map.getEventPixel(evt)` and `map.getCoordinateFromPixel(pixel)`.
- [ ] 2.2 Refactor the `handlePointerUp` function in `ImagePane.tsx` to calculate coordinates using `map.getEventPixel(evt)` and `map.getCoordinateFromPixel(pixel)`.
- [ ] 2.3 Refactor the drag preview mousemove event handler in `ImagePane.tsx` to align with the same OpenLayers event coordinate resolution logic.
- [ ] 2.4 Verify crop boundary edge cases (e.g. dragging outside image bounds, tiny rectangles, dragging with existing coordinate pins).
