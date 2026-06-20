## 1. State Management & Shared Context Setup

- [ ] 1.1 Lift GCP coordinate and configuration state (active mode, pins list, validation messages, uploaded image info) into `MainDashboard.tsx`.
- [ ] 1.2 Update `MapPane` and `ImagePane` component definitions to accept the lifted state and control callbacks as props.

## 2. Dynamic Image Upload in ImagePane

- [ ] 2.1 Add a hidden `<input type="file" accept="image/*" />` to `ImagePane.tsx` and trigger it when clicking the "Upload Image" side-tab button.
- [ ] 2.2 In the file change handler, read the selected file to create an Object URL and load it in a temporary `Image` object to retrieve its natural dimensions (width and height).
- [ ] 2.3 Dynamically initialize or re-initialize the OpenLayers static image layer and view projection with the new image dimensions, ensuring previous object URLs are properly revoked.

## 3. GCP Pin Assignment & Overlays

- [ ] 3.1 Implement click listeners on the static image map to register pixel coordinates of pins when "Add Coordinates" mode is active.
- [ ] 3.2 Implement click listeners on the geographic map to register longitude/latitude coordinates of corresponding pins when "Add Coordinates" mode is active.
- [ ] 3.3 Create and display OpenLayers `Overlay` elements dynamically representing the numbered pins on both the image map and geographic map.
- [ ] 3.4 Bind right-click (`contextmenu`) events to the custom HTML pin elements to delete the pin and its corresponding pair from the shared state, calling `preventDefault()` to suppress default menus.

## 4. Mode Deactivation Validation Guard

- [ ] 4.1 Render the "Add Coordinates" button on the image top-middle toolbar next to "Crop" with active/inactive visual states.
- [ ] 4.2 Add logic to the "Add Coordinates" toggle handler to count coordinate pins on both panes, preventing deactivation if the counts are unequal/unpaired, and displaying a warning message if blocked.
