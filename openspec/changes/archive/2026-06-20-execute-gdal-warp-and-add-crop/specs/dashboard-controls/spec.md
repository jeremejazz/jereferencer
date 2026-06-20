## ADDED Requirements

### Requirement: Overlay Toggle Guard
The Overlay button SHALL act as a toggle. The system SHALL prevent activating the overlay toggle if the number of paired coordinate pins is less than 3.
- Clicking the Overlay button while there are less than 3 coordinates SHALL display a validation warning and remain inactive.

#### Scenario: Blocking overlay toggle with insufficient coordinates
- **WHEN** the user has placed 2 matched coordinate pairs and clicks the Overlay button
- **THEN** the overlay mode SHALL remain inactive and the system SHALL display a warning indicating at least 3 coordinates are required

### Requirement: Crop Rectangle Mode
The Crop button SHALL act as a toggle. When active, it SHALL enable crop drawing mode on the image pane and disable coordinate pin placement.
- When crop mode is deactivated, drawing interactions SHALL be disabled.

#### Scenario: Toggling Crop drawing mode
- **WHEN** the user clicks the Crop button to activate it
- **THEN** the system SHALL activate crop drawing mode, allowing the user to draw a crop rectangle, and deactivate the "Add Coordinates" mode if active

## MODIFIED Requirements

### Requirement: Image Viewport Control Panel Buttons
The static image pane SHALL render absolute-positioned control buttons:
- On the top-middle: a toolbar container with Overlay, Crop, Add Coordinates, Clip, and Rotate action buttons.
- On the top-right: Zoom In (+) and Zoom Out (-) buttons.
- On the middle-right: a side tab panel with Upload Image and Lock viewport buttons.

#### Scenario: Displaying image control buttons
- **WHEN** the image pane is rendered
- **THEN** it SHALL display the top-middle toolbar (including Overlay, Crop, Add Coordinates, Clip, and Rotate), top-right zoom (+/-) buttons, and middle-right side-tab buttons (Upload, Lock) overlaying the image container
