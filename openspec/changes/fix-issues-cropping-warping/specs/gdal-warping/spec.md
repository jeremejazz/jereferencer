## MODIFIED Requirements

### Requirement: GDAL Warp Execution
The system SHALL invoke a Rust-based Tauri command to assign GCPs and warp the uploaded image using the active coordinate pins and crop boundaries.
- The system SHALL allow the frontend to upload image bytes to a project-relative temporary directory `public/temp_uploads/` inside the workspace root.
- The system SHALL perform GDAL processing on the copied image file in `public/temp_uploads/`.
- The system SHALL first run `gdal_translate` to generate an intermediate GeoTIFF file with the embedded GCP coordinates.
- The system SHALL then run `gdalwarp` on the intermediate GeoTIFF to create the final warped PNG file.
- The output image SHALL be named `<name>_warped.png` (using the base name of the uploaded image) and stored in the same project-relative `public/temp_uploads/` directory.
- The intermediate GeoTIFF file SHALL be deleted immediately upon completion (or failure) of the process.
- The warped PNG file SHALL be returned as a relative web URL (e.g. `/temp_uploads/<name>_warped.png`) to be displayed directly on the frontend GIS map overlay, bypassing base64 data URLs.
- The command SHALL fail gracefully and display an error message if the GDAL CLI tools are not installed or return an error.

#### Scenario: Uploading image bytes and processing
- **WHEN** the user selects an image file
- **THEN** the system SHALL upload the image bytes to `public/temp_uploads/` and load it into the flat image viewer using a relative URL
- **AND** the system SHALL use the resolved local path for georeferencing processing

#### Scenario: Running GDAL warp successfully
- **WHEN** the user activates the overlay toggle with at least 3 coordinates and coordinates have changed
- **THEN** the system SHALL execute the Tauri backend command to run `gdal_translate` followed by `gdalwarp`, create the output PNG file in `public/temp_uploads/`, and return the relative web URL for the GIS overlay

