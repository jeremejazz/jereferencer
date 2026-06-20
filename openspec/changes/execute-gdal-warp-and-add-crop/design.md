## Context

The application allows users to place matching coordinate control pins on a flat raster image pane and a geographic map pane (OpenStreetMap). Currently, it lacks:
1. The capability to georeference and warp the image using these pins.
2. A tool to crop the raster image before warping.
3. Logical boundary checks to keep pins and crop boundaries consistent.

## Goals / Non-Goals

**Goals:**
- Implement a Tauri command to run `gdal_translate` and `gdalwarp` on the backend, generating a warped PNG image.
- Support a toggleable "Overlay" layer on the OpenLayers geographic map displaying the warped image.
- Cache the warped image and avoid invoking the GDAL backend when coordinate and crop inputs remain unchanged.
- Add a "Crop" interaction tool to define a rectangular crop area on the image pane, including a spotlight visual overlay (semi-transparent mask outside the crop region).
- Prevent users from placing pins outside the crop boundaries or drawing crop boundaries that exclude existing pins.

**Non-Goals:**
- Supporting arbitrary polygonal cropping (only rectangular bounding box cropping is supported).
- Multi-image warping (only the single uploaded active image is warped).
- Storing multiple warped image versions in the history (only the latest warped image is kept).

## Decisions

### 1. Inverting Y-Axis Coordinates for GDAL GCPs
- **Decision**: Invert the y-axis coordinate of the coordinate pins when constructing Ground Control Points (GCPs) for GDAL command line tools.
- **Rationale**: OpenLayers flat projection starts the pixel coordinate system at the bottom-left of the image `(0, 0)` going up to `(width, height)`. However, GDAL expects the pixel coordinate system to start at the top-left of the image `(0, 0)` going down to `(width, height)`. To align them, we must set the pixel Y coordinate for GDAL as `image_height - ol_pixel_y`.
- **Alternatives Considered**:
  - Configuring OpenLayers to use a top-left origin. This was rejected because it would require rewriting the coordinate rendering logic across the entire frontend.

### 2. Passing Warped Image to Frontend via Base64 Data URL
- **Decision**: The Tauri command will read the warped PNG file from the disk, convert it to a base64 string, and return it to the frontend as a `data:image/png;base64,...` Data URL.
- **Rationale**: Tauri v2 has strict security policies regarding the `asset://` protocol. Loading random files from arbitrary locations on the user's filesystem requires complex path scope configuration in `default.json`. Returning a Base64 Data URL completely bypasses filesystem access policy restrictions in the WebView and makes the image directly displayable as an OpenLayers static image source.
- **Alternatives Considered**:
  - Customizing Tauri v2 `default.json` scopes to allow `asset://` access. Rejected due to security risks of exposing wide directories and platform-specific path resolution issues.

### 3. Crop Area Definition and Pin Validation using Turf.js
- **Decision**: Install `@turf/turf` and use it on the frontend to represent the crop rectangle and pin locations as GeoJSON geometries.
- **Rationale**: Representing the crop rectangle as a Polygon and pins as Points allows using standard Turf.js functions (e.g. `booleanPointInPolygon` or `difference` for creating the spotlight mask) to perform validation and rendering. This ensures robust and extensible geometric checks.
- **Alternatives Considered**:
  - Implementing custom manual bounding box checks. Rejected because Turf.js is standard, less error-prone, and makes implementing the spotlight subtraction mask simpler.

### 4. Running Crop and Warp Sequentially in Rust
- **Decision**: The Tauri command will first call `gdal_translate` to crop the input image if a crop rectangle is defined, and then call `gdalwarp` on the cropped image.
- **Rationale**: Running `gdal_translate` first physically crops the image file, meaning `gdalwarp` only processes the desired subset of the image. This improves performance. The frontend will adjust GCP pixel coordinates relative to the crop origin before sending them to the backend:
  - `x_cropped = px - crop_minX`
  - `y_cropped = crop_maxY - py`
- **Alternatives Considered**:
  - Running `gdalwarp` on the uncropped image and then cropping the output. Rejected because it is less efficient and harder to align.

### 5. Using Tauri App-Specific Cache Directory
- **Decision**: Save temporary files (like the cropped image and the warped output `<name>_warped.png`) in the Tauri application's local cache directory, resolved dynamically via `app_cache_dir()`.
- **Rationale**: Storing temporary intermediate files in the system's app-specific cache directory avoids polluting the user's source directories. It also circumvents permission issues that might occur if writing directly to folders with restricted write permissions.
- **Alternatives Considered**:
  - Writing in the same directory as the original image. Rejected due to permission risks and file clutter.
  - Using the system temporary directory (`temp_dir()`). Rejected because temporary directories are cleared arbitrarily by the OS, which could remove active overlays during a running session.

## Risks / Trade-offs

- **[Risk]**: The `gdalwarp` or `gdal_translate` executable is not in the system's `PATH`.
  - **Mitigation**: We assume `gdalwarp` and `gdal_translate` are in the system's `PATH` variable for cross-platform compatibility (macOS/Windows). The Rust backend will check for executable availability using shell command detection. If missing, it returns a descriptive error message.
- **[Risk]**: Colinear control points causing GDAL to fail or generate degenerate results.
  - **Mitigation**: We will validate the points on the frontend (using Turf.js and triangle area calculation) to ensure no three selected coordinates are colinear. A corresponding validation check will be run in Rust before executing the shell commands.
- **[Risk]**: Memory overhead of Base64 encoding large images.
  - **Mitigation**: Images will be cropped and warped before being converted to Base64, which significantly reduces the file size. We will also recommend a maximum size limit on uploaded raster scans.

