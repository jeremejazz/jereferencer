## Context

The current georeferencing implementation executes a GDAL warp command (`gdalwarp`) on the backend to produce a warped PNG. However:
1. PNG files do not embed geographic metadata (extent, spatial reference system).
2. The frontend overlay renders the warped PNG using a static OpenLayers image layer (`ImageStatic`).
3. To place the overlay, the frontend calculates a bounding box (`overlayExtent`) from the minimum and maximum longitude/latitude of the Ground Control Points (GCPs).
4. Because the output image spans the entire extent of the warped raster (which goes far beyond the GCP pins), this mismatch causes the entire image to be squished and stretched to fit exactly inside the pins' bounding box. This aligns the image's edges with the pins instead of aligning the features.

To fix this, the backend must calculate the true geographic extent of the warped output and return it to the frontend, which will use it to correctly render the overlay.

## Goals / Non-Goals

**Goals:**
- Determine the true geographic extent (`[minLon, minLat, maxLon, maxLat]`) of the warped output image.
- Modify the Tauri `warp_image` backend command to return a JSON object containing the relative PNG URL and the correct geographic extent.
- Update the frontend `MainDashboard` and `MapPane` to use the returned extent for the map overlay instead of calculating the GCP bounding box.
- Identify and handle edge cases (e.g. invalid JSON from `gdalinfo`, cleanup of temporary files, missing files, and incorrect crop coordinates).

**Non-Goals:**
- Custom target projections for the frontend (the application remains hardcoded to WGS 84 / Web Mercator).
- Real-time warping previews (warping remains on-demand via the overlay toggle).

## Decisions

### 1. Warped Extent Retrieval using `gdalinfo`
- **Decision**: The backend will run the warp process to an intermediate GeoTIFF file first, run `gdalinfo -json` on that GeoTIFF to extract its geographic extent, and then convert the GeoTIFF to PNG using `gdal_translate`.
- **Alternatives considered**:
  - *Querying PAM (`.aux.xml`) metadata*: Reject because PNG PAM files can be finicky, and intermediate GeoTIFF processing is standard GIS practice.
  - *Mathematical approximation in JS/Rust*: Reject because thin plate spline (`-tps`) warping is highly non-linear and trying to compute the extent manually would introduce inaccuracies.
- **Implementation details**:
  - Run `gdalwarp -tps -overwrite -of GTiff -co COMPRESS=DEFLATE -t_srs EPSG:4326 <georef_tif> <warped_tif>`
  - Run `gdalinfo -json <warped_tif>`
  - Parse the output JSON to find `cornerCoordinates` (e.g. `upperLeft`, `lowerLeft`, `upperRight`, `lowerRight`).
  - Calculate `minLon` as the minimum of the X coordinates, `maxLon` as the maximum, `minLat` as the minimum of Y coordinates, and `maxLat` as the maximum of Y coordinates.
  - Run `gdal_translate -of PNG -co "WORLDFILE=NO" <warped_tif> <warped_png>`
  - Delete both intermediate GeoTIFF files (`_georef.tif` and `_warped.tif`).

### 2. Standardized API Response Structure
- **Decision**: Change the Tauri command `warp_image` return type from `Result<String, String>` (returning only the URL string) to `Result<WarpResult, String>`, where `WarpResult` is defined as:
  ```rust
  #[derive(serde::Serialize)]
  pub struct WarpResult {
      pub web_url: String,
      pub extent: [f64; 4], // [minLon, minLat, maxLon, maxLat]
  }
  ```

### 3. Handling Edge Cases
- **GDAL CLI failures**: Ensure that if any command in the chain (`gdal_translate` -> `gdalwarp` -> `gdalinfo` -> `gdal_translate`) fails, intermediate files are fully cleaned up.
- **Parsing Errors**: If `gdalinfo` JSON parsing fails (e.g. if the JSON structure changes or is invalid), fail gracefully with an informative error message.
- **Inverted Y in Crops**: Verify if the crop offsets are correctly computed relative to the top of the image in pixel coordinates before translating, to prevent cropped images from being misaligned.

## Risks / Trade-offs

- **Performance Overhead**: Running `gdalinfo` and an extra `gdal_translate` command adds a small delay (tens of milliseconds) to the warp process.
  *Mitigation*: Since georeferencing is an on-demand operation run after pins are placed or toggled, this sub-second overhead is completely acceptable.
- **Dependency on `gdalinfo`**:
  *Mitigation*: Since the application already depends on `gdal_translate` and `gdalwarp`, `gdalinfo` is guaranteed to be available in the same path.
