## MODIFIED Requirements

### Requirement: GDAL Warp Execution
The system SHALL invoke a Rust-based Tauri command to assign GCPs and warp the uploaded image using the active coordinate pins and crop boundaries.
- The system SHALL first run `gdal_translate` to generate an intermediate GeoTIFF file with the embedded GCP coordinates.
- The system SHALL then run `gdalwarp` on the intermediate GeoTIFF to create the final warped PNG file.
- The output image SHALL be named `<name>_warped.png` (using the base name of the uploaded image) and stored in the application's cache or document directory.
- The intermediate GeoTIFF file SHALL be deleted immediately upon completion (or failure) of the process.
- The command SHALL fail gracefully and display an error message if the GDAL CLI tools are not installed or return an error.

#### Scenario: Running GDAL warp successfully
- **WHEN** the user activates the overlay toggle with at least 3 coordinates and coordinates have changed
- **THEN** the system SHALL execute the Tauri backend command to run `gdal_translate` followed by `gdalwarp` and create the output PNG file
