## ADDED Requirements

### Requirement: GCP Coordinate Assignment Mode
The system SHALL support an active "Add Coordinates" mode.
- While active, clicking on the static image pane SHALL place a numbered coordinate pin (pixel space).
- While active, clicking on the geographic map pane SHALL place a matching numbered coordinate pin (geographic coordinate space).
- Pins on both panes SHALL display their corresponding sequential index (e.g., 1, 2, 3).

#### Scenario: Assigning a matched coordinate pair
- **WHEN** the "Add Coordinates" mode is active and the user clicks on the image pane and then clicks on the geographic map pane
- **THEN** matching numbered pins (e.g., 1 on the image and 1 on the map) SHALL be rendered on the respective panes

### Requirement: Pin Deletion
The user SHALL be able to delete a coordinate pin.
- Right-clicking on an existing pin in either the image pane or the geographic map pane SHALL delete that pin and its paired pin in the other pane.

#### Scenario: Right-click pin deletion
- **WHEN** the user right-clicks on pin "1" in the geographic map pane
- **THEN** pin "1" on both the geographic map pane and the static image pane SHALL be removed

### Requirement: Mode Deactivation Safeguard
The system SHALL prevent deactivating the "Add Coordinates" mode if the number of pins on the geographic map pane does not equal the number of pins on the static image pane.
- Clicking the active "Add Coordinates" button while there are unequal/unpaired pins SHALL keep the mode active and display a validation warning.

#### Scenario: Blocking deactivation with unequal pins
- **WHEN** the user has placed pin "1" and "2" on the image pane, but only pin "1" on the geographic map pane, and clicks the "Add Coordinates" button to deactivate
- **THEN** the "Add Coordinates" mode SHALL remain active and the system SHALL display a warning indicating unequal coordinates
