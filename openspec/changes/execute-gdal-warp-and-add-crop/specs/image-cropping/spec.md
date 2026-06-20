## ADDED Requirements

### Requirement: Crop Rectangle Drawing
The system SHALL support drawing a bounding crop rectangle on the image viewport using click-and-drag mouse interactions when the Crop tool is active.
- Only a single crop rectangle SHALL exist at any time. Drawing a new rectangle SHALL replace the existing one.
- The crop rectangle coordinates (in pixel space) SHALL be stored in the application state.

#### Scenario: Drawing a crop rectangle
- **WHEN** the Crop tool is active and the user clicks and drags on the image pane
- **THEN** a rectangle shape SHALL be rendered on the image pane following the user's cursor

### Requirement: Spotlight Viewport Rendering
The system SHALL render a spotlight visual effect overlay on the image pane when a crop rectangle is defined.
- The area outside the crop rectangle SHALL be filled with a semi-transparent color (e.g., 50% opacity black).
- The area inside the crop rectangle SHALL remain completely transparent.

#### Scenario: Rendering spotlight overlay
- **WHEN** a crop rectangle is drawn
- **THEN** the system SHALL display the semi-transparent overlay covering everything outside the crop boundaries
