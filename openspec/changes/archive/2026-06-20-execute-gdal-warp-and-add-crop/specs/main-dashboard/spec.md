## MODIFIED Requirements

### Requirement: Static Image Source View
The system SHALL render an OpenLayers map instance in the right pane only when a dynamic image file has been uploaded by the user. If no image has been uploaded, it SHALL display an upload prompt placeholder.

#### Scenario: Static Image Initialization
- **WHEN** the image pane is rendered and no image has been uploaded
- **THEN** it SHALL display a placeholder/upload prompt instructing the user to upload a local image
