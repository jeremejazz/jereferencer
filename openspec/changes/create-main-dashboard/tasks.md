## 1. Setup and Dependencies

- [x] 1.1 Install OpenLayers library (`ol` package) and standard typescript types.
- [x] 1.2 Setup Tailwind CSS and shadcn/ui components in the React project.

## 2. Core Utilities and Unit Testing

- [ ] 2.1 Create coordinate parsing utility `src/lib/searchParser.ts` to parse `lat, lon` strings from the map search bar.
- [ ] 2.2 Write Vitest unit tests in `src/lib/searchParser.test.ts` to validate the coordinate parsing utility.

## 3. Left Map Pane Component (OSM)

- [ ] 3.1 Implement `src/components/MapPane.tsx` utilizing OpenLayers to load and display OpenStreetMap in a DOM container.
- [ ] 3.2 Add a search input text bar using shadcn/ui that parses coordinates and pans/zooms the map to that location.

## 4. Right Image Pane Component (Static Image)

- [ ] 4.1 Implement `src/components/ImagePane.tsx` utilizing OpenLayers to display a static reference image on a flat/pixel coordinate system.
- [ ] 4.2 Render an overlay toolbar with buttons for Overlay, Crop, Clip, and Rotate.

## 5. Layout Assembly and Verification

- [ ] 5.1 Create navigation header component `src/components/Header.tsx` displaying the title and links.
- [ ] 5.2 Assemble the components into a responsive side-by-side dashboard in `src/components/MainDashboard.tsx` and integrate it into `src/App.tsx`.
- [ ] 5.3 Run Vitest unit tests and verify they pass successfully.
