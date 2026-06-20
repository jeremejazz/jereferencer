## 1. Backend Implementation

- [x] 1.1 Define a new Rust struct `WarpResult` in `src-tauri/src/lib.rs` containing `web_url: String` and `extent: [f64; 4]`.
- [x] 1.2 Modify the `warp_image` Tauri command to return `Result<WarpResult, String>`.
- [x] 1.3 Update the `warp_image` logic to execute `gdalwarp` generating an intermediate WGS84 GeoTIFF file (`<name>_warped.tif`).
- [x] 1.4 Execute `gdalinfo -json` on the warped GeoTIFF, parse the output JSON, and calculate the `[minLon, minLat, maxLon, maxLat]` extent.
- [x] 1.5 Execute `gdal_translate -of PNG` to convert the warped GeoTIFF to the final transparent PNG file.
- [x] 1.6 Add cleanup logic to delete both intermediate GeoTIFF files (`_georef.tif` and `_warped.tif`) and ensure cleanup runs even on failure.

## 2. Frontend Integration

- [x] 2.1 Update type definitions and `invoke` handler in `MainDashboard.tsx` to expect the `WarpResult` return type.
- [x] 2.2 Replace the client-side calculated `overlayExtent` with the extent returned from the backend in `MainDashboard.tsx`.
- [x] 2.3 Pass the backend-provided extent to `MapPane` and verify the OpenLayers `StaticImage` source renders the warped overlay in the correct position.
- [x] 2.4 Perform verification tests to ensure that the image features (e.g. coastlines or streets) match their assigned map coordinates.
