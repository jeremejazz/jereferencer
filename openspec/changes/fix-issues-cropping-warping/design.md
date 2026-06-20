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

### Decision 3: Project-Relative Temporary Directory for File Uploads and Warping
To completely resolve path translation and browser-level security restrictions (which prevent accessing raw filesystem absolute paths):
1. **Frontend-to-Backend Uploading**:
   - The frontend will read selected image files as array buffers/bytes and send them to the Tauri backend using a new `upload_image_bytes` command.
   - The Rust backend will save these bytes to a project-relative temporary directory: `public/temp_uploads/`.
   - The backend will return a web URL path (e.g. `/temp_uploads/<filename>`) and the absolute path on the host system.
2. **Local GDAL Warping**:
   - `warp_image` will receive the absolute system path of the uploaded file within `public/temp_uploads/`.
   - It will run the two-stage GDAL pipeline.
   - It will output the warped PNG directly to `public/temp_uploads/<filename_stem>_warped.png`.
3. **Web-Accessible Overlay**:
   - The backend will return the relative web URL `/temp_uploads/<filename_stem>_warped.png` to the frontend.
   - The frontend will load this image URL on the OpenLayers overlay using the Vite dev server's static file serving, bypassing complex base64 encoding/decoding and asset protocol limitations.

## Risks / Trade-offs

- **[Risk]**: Temporary files are left behind on disk.
  - **Mitigation**: Add a directory cleanup script or command, or rely on `.gitignore` to ensure `public/temp_uploads/` is never committed to git.
- **[Risk]**: Cache issues when re-warping the same image.
  - **Mitigation**: Append a timestamp cache-buster query parameter (e.g., `?t=TIMESTAMP`) when reloading the warped image on the map overlay.

