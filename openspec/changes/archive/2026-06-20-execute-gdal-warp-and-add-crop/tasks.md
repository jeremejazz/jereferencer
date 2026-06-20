## 1. Dependency Setup and Base Cleanup

- [x] 1.1 Add `@turf/turf` to `package.json` dependencies.
- [x] 1.2 Modify `ImagePane.tsx` to remove the default fallback placeholder image (`ed-259-xcrI6CPkkJs-unsplash.jpg`) and render an upload prompt if `uploadedImageUrl` is null.
- [x] 1.3 Implement state reset in `MainDashboard.tsx` to clear coordinate pins, crop rectangle bounds, active tool states, and map overlays when a new image is uploaded.

## 2. Image Cropping & Spotlight Visuals

- [x] 2.1 Add state variables in `MainDashboard.tsx` for crop rectangle bounds `[minX, minY, maxX, maxY]` and crop tool active state.
- [x] 2.2 Update `ImagePane.tsx` navigation and toolbar to toggle Crop mode, visual active states, and coordinate pin mode mutual exclusion.
- [x] 2.3 Implement drag-and-draw crop rectangle interactions on the flat image OpenLayers instance.
- [x] 2.4 Render the spotlight effect on `ImagePane.tsx` by using Turf.js to construct a polygon subtraction mask overlay.
- [x] 2.5 Add Turf.js geometry validations in `MainDashboard.tsx` to prevent placing pins outside the crop rectangle, and blocking crop resizing that excludes existing pins.
- [x] 2.6 Implement colinearity validation in `MainDashboard.tsx` (using Turf.js/math area checks) to verify that coordinate pins are not colinear before warping.

## 3. Rust Backend GDAL Warping Command

- [x] 3.1 Implement a Tauri Rust command `warp_image` in `src-tauri/src/lib.rs` that accepts the original image path, crop box parameters, and an array of pixel/geographic GCP coordinate pairs.
- [x] 3.2 Add logic to resolve the cache directory using Tauri's `app_cache_dir()` and create/write temporary files there.
- [x] 3.3 Add backend logic to run `gdal_translate` (assuming it is in PATH) with `-srcwin` parameters to crop the image file in the cache directory if crop parameters are active.
- [x] 3.4 Add backend logic to run `gdalwarp` (assuming it is in PATH) with constructed GCP arguments on the (possibly cropped) image file, saving it as `<name>_warped.png` in the cache directory.
- [x] 3.5 Implement Rust validation to check for colinear points prior to invoking the shell commands.
- [x] 3.6 Implement base64 encoding logic in Rust to convert the warped PNG file into a Data URL and return it to the frontend.

## 4. Overlay Toggle and MapPane Rendering

- [x] 4.1 Integrate the Overlay button in `ImagePane.tsx` toolbar, requiring at least 3 matching coordinate pin pairs and passing colinearity validation before turning on.
- [x] 4.2 Set up state tracking in `MainDashboard.tsx` to cache the last warped coordinates and crop bounds, avoiding calling `warp_image` if they have not changed.
- [x] 4.3 Update `MapPane.tsx` to accept the warped image Base64 data URL and render it as an OpenLayers Image Layer overlay using the georeferenced coordinate bounds.
- [ ] 4.4 Test the integration of upload -> crop -> coordinate assignment -> warp -> map overlay cycle, verifying correct orientation (y-axis inversion).

