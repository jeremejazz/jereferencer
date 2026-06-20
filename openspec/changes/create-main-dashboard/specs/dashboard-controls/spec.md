## ADDED Requirements

### Requirement: Search Map Location
The geographic map pane SHALL provide an address and coordinate search input that centers and zooms the map on the search result.

#### Scenario: Searching by coordinate
- **WHEN** the user inputs "45.0, 9.0" in the map search bar and submits
- **THEN** the geographic map SHALL pan and zoom to the coordinate location (Latitude 45.0, Longitude 9.0)

### Requirement: Raster Image Controls
The system SHALL render toolbar controls (Overlay, Crop, Clip, Rotate) overlaying the raster image pane to serve as visual placeholders for future functionality.

#### Scenario: Displaying raster controls
- **WHEN** the raster image pane is rendered
- **THEN** the control overlay containing buttons for Overlay, Crop, Clip, and Rotate SHALL be visible
