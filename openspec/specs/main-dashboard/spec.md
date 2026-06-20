# Main Dashboard

## Purpose
TBD

## Requirements

### Requirement: Top Menu Navigation Links
The system's top navigation header SHALL contain "Layers" and "Export" navigation links, with "Layers" set as the active navigation item by default.

#### Scenario: Rendering top menu links
- **WHEN** the dashboard page loads
- **THEN** the header SHALL render navigation links for "Layers" and "Export", with "Layers" styled with an active border highlight

### Requirement: Zero-Gap Split Pane Layout
The system SHALL display the geographic map pane and the static image pane side-by-side with zero space (margins, gaps, or borders) separating them.

#### Scenario: Visualizing the adjacent panes
- **WHEN** the dashboard page is rendered
- **THEN** the map pane and image pane SHALL align edge-to-edge with no padding or spacing between their outer boundaries

### Requirement: Geographic Map View
The system SHALL render an OpenLayers map instance in the left pane, configured to load and display OpenStreetMap tiles.

#### Scenario: OSM Map Initialization
- **WHEN** the map pane is rendered
- **THEN** an OpenLayers map instance SHALL initialize and load OpenStreetMap tiles successfully

### Requirement: Static Image Source View
The system SHALL render an OpenLayers map instance in the right pane configured to load and display the image file `ed-259-xcrI6CPkkJs-unsplash.jpg` as a static image source.

#### Scenario: Static Image Initialization
- **WHEN** the image pane is rendered
- **THEN** it SHALL load the static image file `ed-259-xcrI6CPkkJs-unsplash.jpg` using OpenLayers on a pixel coordinate system
