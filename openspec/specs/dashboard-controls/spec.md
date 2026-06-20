# Dashboard Controls

## Purpose
TBD

## Requirements

### Requirement: Search Map Location
The geographic map pane SHALL provide an address and coordinate search input that centers and zooms the map on the search result.

#### Scenario: Searching by coordinate
- **WHEN** the user inputs "45.0, 9.0" in the map search bar and submits
- **THEN** the geographic map SHALL pan and zoom to the coordinate location (Latitude 45.0, Longitude 9.0)

### Requirement: Map Control Panel Buttons
The geographic map pane SHALL render absolute-positioned control buttons:
- On the top-left: search toggle and world/public-map buttons.
- On the top-right: Zoom In (+) and Zoom Out (-) buttons.

#### Scenario: Displaying map control buttons
- **WHEN** the map pane is rendered
- **THEN** it SHALL show search, public, and zoom (+/-) buttons overlaying the map container

### Requirement: Image Viewport Control Panel Buttons
The static image pane SHALL render absolute-positioned control buttons:
- On the top-middle: a toolbar container with Overlay, Crop, Clip, and Rotate action buttons.
- On the top-right: Zoom In (+) and Zoom Out (-) buttons.
- On the middle-right: a side tab panel with Upload Image and Lock viewport buttons.

#### Scenario: Displaying image control buttons
- **WHEN** the image pane is rendered
- **THEN** it SHALL display the top-middle toolbar, top-right zoom (+/-) buttons, and middle-right side-tab buttons (Upload, Lock) overlaying the image container
