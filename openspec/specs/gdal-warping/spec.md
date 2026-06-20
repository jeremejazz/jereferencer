# GDAL Warping

## Purpose
TBD

## Requirements

### Requirement: GDAL Warp Execution
The system SHALL invoke a Rust-based Tauri command to assign GCPs and warp the uploaded image using the active coordinate pins and crop boundaries.
- The system SHALL allow the frontend to upload image bytes to a project-relative temporary directory `public/temp_uploads/` inside the workspace root.
- The system SHALL perform GDAL processing on the copied image file in `public/temp_uploads/`.
- The system SHALL first run `gdal_translate` to generate an intermediate GeoTIFF file (`<name>_georef.tif`) with the embedded GCP coordinates.
- The system SHALL then run `gdalwarp` on the intermediate GeoTIFF to create a warped GeoTIFF file (`<name>_warped.tif`).
- The system SHALL execute `gdalinfo -json` on the warped GeoTIFF to extract its true geographic extent boundaries.
- The system SHALL run `gdal_translate` to convert the warped GeoTIFF to the final transparent PNG file (`<name>_warped.png`) stored in the same project-relative `public/temp_uploads/` directory.
- The intermediate GeoTIFF files (`<name>_georef.tif` and `<name>_warped.tif`) SHALL be deleted immediately upon completion (or failure) of the process.
- The command SHALL return the relative web URL for the warped PNG and the exact geographic extent `[minLon, minLat, maxLon, maxLat]` of the output image in EPSG:4326.
- The command SHALL fail gracefully and display an error message if the GDAL CLI tools are not installed or return an error.

#### Scenario: Uploading image bytes and processing
- **WHEN** the user selects an image file
- **THEN** the system SHALL upload the image bytes to `public/temp_uploads/` and load it into the flat image viewer using a relative URL
- **AND** the system SHALL use the resolved local path for georeferencing processing

#### Scenario: Running GDAL warp successfully
- **WHEN** the user activates the overlay toggle with at least 3 coordinates and coordinates have changed
- **THEN** the system SHALL execute the Tauri backend command to run `gdal_translate`, `gdalwarp`, extract the extent via `gdalinfo`, convert the warped image to PNG, and return both the relative web URL and the geographic extent of the warped image

### Requirement: Warp Overlay Rendering
The system SHALL render the generated warped image as a raster image overlay on the geographic map pane.
- The overlay SHALL align precisely with the geographic coordinates specified in the coordinate pairs.
- The overlay SHALL use the true geographic extent of the warped image returned by the backend to map the overlay onto the GIS map pane.
- If the overlay toggle is deactivated, the overlay SHALL be removed from the map pane.

#### Scenario: Displaying warped image on map
- **WHEN** the overlay toggle is activated and the warped image file is generated
- **THEN** the system SHALL add an image layer representing the warped image to the geographic map pane using the exact geographic extent of the warped image returned by the backend

### Requirement: State Change Check (Caching)
The system SHALL cache the warping result and avoid running the backend GDAL warp command if the coordinates and crop parameters have not changed since the last warping.

#### Scenario: Activating overlay with cached image
- **WHEN** the user deactivates and then re-activates the overlay toggle, and no coordinates or crop parameters have changed
- **THEN** the system SHALL display the previously generated warped image overlay without calling the Tauri command
