## 1. Setup and Dependencies

- [x] 1.1 Install OpenLayers library (`ol` package) and standard typescript types.
- [x] 1.2 Setup Tailwind CSS and shadcn/ui components in the React project.
- [ ] 1.3 Copy `images/ed-259-xcrI6CPkkJs-unsplash.jpg` to `public/ed-259-xcrI6CPkkJs-unsplash.jpg`.

## 2. Core Utilities and Unit Testing

- [x] 2.1 Create coordinate parsing utility `src/lib/searchParser.ts` to parse `lat, lon` strings from the map search bar.
- [x] 2.2 Write Vitest unit tests in `src/lib/searchParser.test.ts` to validate the coordinate parsing utility.

## 3. Left Map Pane Component (OSM)

- [x] 3.1 Implement `src/components/MapPane.tsx` utilizing OpenLayers to load and display OpenStreetMap in a DOM container.
- [ ] 3.2 Update controls in `MapPane.tsx` to match the Stitch design: top-left search/world toggle and top-right zoom (+/-) buttons.

## 4. Right Image Pane Component (Static Image)

- [ ] 4.1 Update `src/components/ImagePane.tsx` utilizing OpenLayers to load and display `ed-259-xcrI6CPkkJs-unsplash.jpg` using a static Image source or flat projection.
- [ ] 4.2 Update control overlays in `ImagePane.tsx`: top-middle toolbar (Overlay, Crop, Clip, Rotate), top-right zoom (+/-) controls, and middle-right side tab menu (Upload image, Lock viewport).

## 5. Header and Layout Assembly

- [ ] 5.1 Update navigation header component `src/components/Header.tsx` to display the "Layers" and "Export" navigation menu options, with "Layers" highlighted as active.
- [ ] 5.2 Update `src/components/MainDashboard.tsx` to ensure the map and image panes are displayed side-by-side with zero space or gap between them.
- [ ] 5.3 Verify all unit tests pass and launch development server to check visual accuracy against the Stitch design.
