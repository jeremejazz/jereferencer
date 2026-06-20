## ADDED Requirements

### Requirement: Dual Pane Split Layout
The system SHALL display a dashboard containing two adjacent panels of equal width: a geographic map view on the left and a raster image view on the right.

#### Scenario: Rendering the dual-pane view
- **WHEN** the dashboard page is loaded
- **THEN** the system SHALL display a map pane on the left half of the screen and an image pane on the right half of the screen

### Requirement: OpenLayers Geographic Map View
The system SHALL render an OpenLayers map instance in the left pane, configured to load and display OpenStreetMap tiles.

#### Scenario: OSM Map Initialization
- **WHEN** the map pane is rendered
- **THEN** an OpenLayers map instance SHALL initialize and load OpenStreetMap tiles successfully

### Requirement: OpenLayers Static Image View
The system SHALL render an OpenLayers map instance in the right pane configured with a static image source to display a reference raster image.

#### Scenario: Raster Image Initialization
- **WHEN** the image pane is rendered
- **THEN** it SHALL load the static image using OpenLayers on a pixel coordinate system
