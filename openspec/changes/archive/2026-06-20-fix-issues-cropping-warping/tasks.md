## 1. Backend: Implement Two-Stage GDAL Warping Pipeline

- [x] 1.1 In `src-tauri/src/lib.rs`, update the `warp_image` command to execute `gdal_translate` with `-gcp` arguments first to generate an intermediate GeoTIFF file in the app cache directory.
- [x] 1.2 Update the backend command execution to call `gdalwarp` (using Thin Plate Spline `-tps`) with the intermediate GeoTIFF file as input and generating the warped PNG file as output.
- [x] 1.3 Add code to clean up/delete the intermediate GeoTIFF file from disk after execution completes (both on success and failure).
- [x] 1.4 Test error handling in the backend to ensure any failures in `gdal_translate` or `gdalwarp` return helpful, clean validation errors.

## 2. Frontend: Reliable Drag-and-Draw Crop Coordinates

- [x] 2.1 Refactor the `handlePointerDown` function in `ImagePane.tsx` to calculate coordinates using `map.getEventPixel(evt)` and `map.getCoordinateFromPixel(pixel)`.
- [x] 2.2 Refactor the `handlePointerUp` function in `ImagePane.tsx` to calculate coordinates using `map.getEventPixel(evt)` and `map.getCoordinateFromPixel(pixel)`.
- [x] 2.3 Refactor the drag preview mousemove event handler in `ImagePane.tsx` to align with the same OpenLayers event coordinate resolution logic.
- [x] 2.4 Verify crop boundary edge cases (e.g. dragging outside image bounds, tiny rectangles, dragging with existing coordinate pins).

## 3. Backend: Path Sanitization and File Existence Check

- [x] 3.1 In `src-tauri/src/lib.rs`, sanitize the incoming `image_path` in the `warp_image` command by stripping common virtual URL prefixes like `asset://localhost/`, `asset://`, and decoding percent-encoded paths (e.g. `%20` -> space).
- [x] 3.2 Add an early-exit check to verify the sanitized path exists on disk using `std::path::Path::new(&path).exists()`, returning a clear error if it doesn't.
- [x] 3.3 Verify that the application successfully warps images that have spaces or special characters in their file names.

## 4. Backend & Frontend: Project-Relative File Uploads and Drawing Fixes

- [x] 4.1 In the Rust backend, implement the `upload_image_bytes` Tauri command to save uploaded image bytes to `public/temp_uploads/` in the project root.
- [x] 4.2 Update the `warp_image` command to perform warping on the copied project-relative image path and output the warped PNG directly to `public/temp_uploads/`.
- [x] 4.3 Update the frontend to read selected file bytes and upload them to the backend via `upload_image_bytes`, storing the local path and relative web URL.
- [x] 4.4 Update frontend to load the warped image on the map overlay using the relative web URL with a query-parameter timestamp to bust caches.
- [x] 4.5 In the frontend `ImagePane.tsx`, disable the map's native `DragPan` interaction when crop mode is active, and update viewport event listeners to support seamless drag-and-draw bounding box preview and selection.

