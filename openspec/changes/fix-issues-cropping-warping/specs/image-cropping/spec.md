## MODIFIED Requirements

### Requirement: Crop Rectangle Drawing
The system SHALL support drawing a bounding crop rectangle on the image viewport using click-and-drag mouse interactions when the Crop tool is active.
- Only a single crop rectangle SHALL exist at any time. Drawing a new rectangle SHALL replace the existing one.
- The crop rectangle coordinates (in pixel space) SHALL be calculated reliably using the OpenLayers map's event coordinate mapping, ensuring calculations are independent of the event target element (e.g. canvas, overlay, or markers).
- The crop rectangle coordinates (in pixel space) SHALL be stored in the application state.

#### Scenario: Drawing a crop rectangle
- **WHEN** the Crop tool is active and the user clicks and drags on the image pane
- **THEN** a rectangle shape SHALL be rendered on the image pane following the user's cursor
