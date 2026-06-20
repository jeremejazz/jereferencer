## ADDED Requirements

### Requirement: GDAL Warp Execution
The system SHALL invoke a Rust-based Tauri command to execute `gdalwarp` on the uploaded image using the active coordinate pins and crop boundaries.
- The output image SHALL be named `<name>_warped.png` (using the base name of the uploaded image) and stored in the application's cache or document directory.
- The command SHALL fail gracefully and display an error message if the GDAL CLI tool is not installed or returns an error.

#### Scenario: Running GDAL warp successfully
- **WHEN** the user activates the overlay toggle with at least 3 coordinates and coordinates have changed
- **THEN** the system SHALL execute the Tauri backend command to warp the image and create the output PNG file

### Requirement: Warp Overlay Rendering
The system SHALL render the generated warped image as a raster image overlay on the geographic map pane.
- The overlay SHALL align precisely with the geographic coordinates specified in the coordinate pairs.
- If the overlay toggle is deactivated, the overlay SHALL be removed from the map pane.

#### Scenario: Displaying warped image on map
- **WHEN** the overlay toggle is activated and the warped image file is generated
- **THEN** the system SHALL add an image layer representing the warped image to the geographic map pane

### Requirement: State Change Check (Caching)
The system SHALL cache the warping result and avoid running the backend GDAL warp command if the coordinates and crop parameters have not changed since the last warping.

#### Scenario: Activating overlay with cached image
- **WHEN** the user deactivates and then re-activates the overlay toggle, and no coordinates or crop parameters have changed
- **THEN** the system SHALL display the previously generated warped image overlay without calling the Tauri command
