## Context

The current `jereferencer` application renders a geographic map using OpenLayers in the left pane, and a static raster image in the right pane. However, the static raster image is currently hardcoded, and there is no connection/synchronization between the two panes to establish coordinate matchups (Ground Control Points) required for georeferencing.

We need to add local image upload capability and a coordinate assignment mode to allow users to place matched GCPs across both views.

## Goals / Non-Goals

**Goals:**
- Allow users to load any local raster image file from the browser file chooser.
- Implement an "Add Coordinates" toolbar mode button next to the Crop tool.
- Enable placing matching numbered pins on the image (pixel coordinates) and map (geographic coordinates) during this mode.
- Allow right-clicking any pin to delete it along with its matched counterpart.
- Prevent exiting the coordinate mode if there are unequal/unpaired points (e.g. 3 pins on the image, but only 2 on the map).

**Non-Goals:**
- Performing the actual GDAL warping/rectification in the frontend (the GDAL environment is assumed, but actual warp execution is out of scope for this task).

## Decisions

### 1. State Lifting to MainDashboard
We will lift the state of the coordinate assignment to `MainDashboard.tsx`.
- **Why**: Both panes (`ImagePane` and `MapPane`) need access to the same list of Ground Control Points (GCPs) to render corresponding pins and synchronize pin indices.
- **Alternatives Considered**: Using a context or global state manager (Redux, Zustand). Given the small scope, standard React prop-drilling or a simple callback-based state lifting in the parent container is cleaner and has lower complexity.

### 2. Dynamic Image Dimensions Retrieval via Image object
For local image uploads, we use a standard `<input type="file" />` inside `ImagePane`. When the user selects a file, we create an Object URL (`URL.createObjectURL(file)`). We load this URL into a temporary `new Image()` container to read its natural width and height.
- **Why**: OpenLayers' `Static` image source requires explicit pixel extent boundary dimensions (`[0, 0, width, height]`).

### 3. OpenLayers Overlays for GCP Pins
We will use OpenLayers `Overlay` instances to render the numbered pins on both map instances.
- **Why**: React-rendered DOM elements are much easier to style (e.g., custom SVG markers, inner text for numbers, CSS animations) and support standard React handlers like `onContextMenu` for right-click deletion, compared to drawing points on a vector layer.
- **Alternatives Considered**: Vector layers with styled point geometries. This would require custom text styles and canvas drawing, making right-clicking and dynamic rendering more complex.

### 4. Deactivation Guard logic
We will maintain a validation state. When the "Add Coordinates" mode toggle is clicked, if `pins` has any unpaired coordinates (e.g., a pin exists on the image but has no counterpart geographic coordinate, or vice versa), we will block deactivation and show a temporary validation message.

## Risks / Trade-offs

- **Risk**: Memory leaks from unused `URL.createObjectURL` references.
  - *Mitigation*: Revoke the previous object URL whenever a new image is loaded or the component unmounts.
- **Risk**: Event propagation issues with OpenLayers maps.
  - *Mitigation*: Stop event propagation on right-click context menu on pin overlays to prevent triggering default browser or map-click behaviors.
