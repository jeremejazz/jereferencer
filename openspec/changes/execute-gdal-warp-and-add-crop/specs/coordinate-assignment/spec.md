## ADDED Requirements

### Requirement: Coordinate Placement Bounds Validation
The system SHALL validate coordinate placement against the crop rectangle using Turf.js.
- Coordinate pins SHALL NOT be placed outside the boundaries of the active crop rectangle.
- A crop rectangle SHALL NOT be drawn or resized if it excludes any existing coordinate pins.

#### Scenario: Blocking coordinate placement outside crop boundary
- **WHEN** a crop rectangle is defined and the user clicks outside the crop rectangle in "Add Coordinates" mode
- **THEN** no pin SHALL be created and the system SHALL display a warning indicating coordinates must be within the crop boundary

#### Scenario: Blocking crop rectangle that excludes existing pins
- **WHEN** coordinate pins are placed and the user draws a new crop rectangle that excludes any of the existing pins
- **THEN** the crop action SHALL be rejected and the system SHALL display a warning indicating the crop boundary must contain all existing coordinate pins
