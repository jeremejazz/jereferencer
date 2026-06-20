## ADDED Requirements

### Requirement: Dynamic Image Upload
The static image pane SHALL allow the user to click the Upload Image button to browse and select a local image file, replacing the currently loaded image.

#### Scenario: Browsing and loading local image
- **WHEN** the user clicks the Upload Image button and selects a valid image file
- **THEN** the image pane SHALL load and render the selected image in place of the previous one

## MODIFIED Requirements

### Requirement: Static Image Source View
The system SHALL render an OpenLayers map instance in the right pane configured to load and display a dynamic image file or the default placeholder image `ed-259-xcrI6CPkkJs-unsplash.jpg` as a static image source.

#### Scenario: Static Image Initialization
- **WHEN** the image pane is rendered
- **THEN** it SHALL load the default or user-uploaded static image file using OpenLayers on a pixel coordinate system
