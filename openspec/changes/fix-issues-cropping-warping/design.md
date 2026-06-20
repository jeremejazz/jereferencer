## Context

In the previous georeferencing implementation, the image warping backend and frontend crop drawing components suffered from critical design and runtime issues:
1. **Backend Warping Error**: The Rust Tauri command called `gdalwarp` passing `-gcp` arguments directly. This resulted in a command failure: `gdalwarp failed: ERROR 1: Unknown argument: -gcp`.
2. **Frontend Rectangle Drawing**: The drag-and-draw crop box functionality in the `ImagePane` component relied on DOM `evt.offsetX` / `evt.offsetY` properties. These coordinates are relative to the immediate event target, which caused coordinates to jump erratically when dragging over canvas components, overlay markers, pins, or controls.

## Goals / Non-Goals

**Goals:**
- Correct the backend GDAL warping invocation pipeline to execute successfully.
- Fix the frontend crop rectangle drawing to be smooth, robust, and target-independent.
- Ensure proper file cleanups for intermediate datasets created in the cache directory.
- Verify edge cases such as invalid bounds or error handling.

**Non-Goals:**
- Introducing new map layers or coordinate systems beyond EPSG:3857 and pixel coordinates.
- Redesigning the main dashboard controls.

## Decisions

### Decision 1: Two-Stage GDAL Warping Backend Pipeline
To assign ground control points (GCPs) and warp the raster dataset:
1. **First Stage**: Execute `gdal_translate` to write an intermediate GeoTIFF file (`_georef.tif`) with the embedded GCP coordinates.
   - Command: `gdal_translate -of GTiff -gcp <pixel_x> <pixel_y> <geo_x> <geo_y> ... <input_image> <output_tiff>`
2. **Second Stage**: Execute `gdalwarp` on the intermediate GeoTIFF file to output the final warped PNG.
   - Command: `gdalwarp -tps -overwrite -of PNG <input_tiff> <output_png>`
3. **Cleanup**: Automatically delete the intermediate GeoTIFF file from disk upon success or failure of the warp command.

### Decision 2: OpenLayers Event Mapping API for Drawing Coordinates
To fix coordinate calculation bugs in the drawing tool:
- Instead of using `evt.offsetX` and `evt.offsetY` from the raw mouse/pointer events, we will call:
  - `const pixel = map.getEventPixel(evt);`
  - `const coord = map.getCoordinateFromPixel(pixel);`
- This ensures OpenLayers handles viewport offsets, CSS scales, and overlay target intersections internally, returning correct pixel-space coordinate values under all circumstances.

### Decision 3: Path Sanitization and File Existence Validation in Rust Backend
To resolve `gdal_translate` errors such as `ERROR 4: No such file or directory` (encountered when the frontend passes virtual Tauri URLs or paths with virtual/incorrect spaces/prefixes):
1. **URI Sanitization**:
   - The Rust `warp_image` backend will sanitize the `image_path` string by stripping known virtual URL schemes (e.g., `asset://localhost/`, `asset://`, `http://localhost/`).
   - If the path is URL-encoded (e.g., spaces replaced with `%20`), we will decode it (e.g., using `url::percent_encoding` or a basic string replace if appropriate, or a standard decoding technique in Rust) to form a valid system path.
2. **Existence Check**:
   - Verify that the resulting local file exists using `std::path::Path::new(&sanitized_path).exists()`.
   - If it doesn't exist, fail early and return a helpful error message to the frontend: `Input image file does not exist at path: <resolved_path>`.

## Risks / Trade-offs

- **[Risk]**: `gdal_translate` or `gdalwarp` commands fail, or have strict write permissions.
  - **Mitigation**: Perform commands in the application's secure cache directory (`app_cache_dir()`). Use robust standard-error output logging in the Tauri response for better debugging.
- **[Risk]**: Temporary files are left behind on command failure.
  - **Mitigation**: Wrap the execution in Rust with cleanup logic that attempts to remove the temporary TIFF files regardless of execution success or failure.
- **[Risk]**: The input path contains URL-encoded characters (like `%20` for spaces).
  - **Mitigation**: Percent-decode the file path before testing for its existence and passing it to the GDAL CLI.
