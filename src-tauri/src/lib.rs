// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use base64::Engine;
use serde::Deserialize;
use std::fs;
use std::path::PathBuf;
use std::process::Command;


/// A ground control point mapping pixel coordinates to geographic coordinates.
#[derive(Debug, Deserialize)]
pub struct Gcp {
    pub pixel_x: f64,
    pub pixel_y: f64,
    pub geo_x: f64,
    pub geo_y: f64,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn pick_image_file() -> Result<Option<String>, String> {
    let file = rfd::FileDialog::new()
        .add_filter("Images", &["png", "jpg", "jpeg", "webp", "tiff", "tif"])
        .pick_file();
    
    Ok(file.map(|p| p.to_string_lossy().to_string()))
}

#[tauri::command]
fn read_image_base64(path: String) -> Result<String, String> {
    let bytes = fs::read(&path)
        .map_err(|e| format!("Failed to read image file: {}", e))?;
    
    let path_ref = std::path::Path::new(&path);
    let ext = path_ref
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_lowercase();
    
    let mime = match ext.as_str() {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "gif" => "image/gif",
        "tiff" | "tif" => "image/tiff",
        _ => "application/octet-stream",
    };
    
    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Ok(format!("data:{};base64,{}", mime, b64))
}


/// Check if all GCP points are colinear.
///
/// Uses triangle area calculation for every combination of 3 points.
/// If ALL triplets have area < epsilon, the points are colinear and we reject.
fn are_all_points_colinear(gcps: &[Gcp]) -> bool {
    if gcps.len() < 3 {
        // Fewer than 3 points are trivially colinear (or insufficient)
        return true;
    }

    let epsilon = 1e-9;

    for i in 0..gcps.len() {
        for j in (i + 1)..gcps.len() {
            for k in (j + 1)..gcps.len() {
                let area = 0.5
                    * (gcps[i].pixel_x * (gcps[j].pixel_y - gcps[k].pixel_y)
                        + gcps[j].pixel_x * (gcps[k].pixel_y - gcps[i].pixel_y)
                        + gcps[k].pixel_x * (gcps[i].pixel_y - gcps[j].pixel_y))
                        .abs();

                if area > epsilon {
                    // Found a non-degenerate triangle — points are NOT all colinear
                    return false;
                }
            }
        }
    }

    // All triplets are colinear
    true
}

/// Tauri command that crops (optionally) and warps an image using GDAL CLI tools,
/// then returns the result as a base64 data URL.
///
/// # Arguments
/// * `app_handle` – used to resolve the app-specific cache directory
/// * `image_path` – absolute path to the source image
/// * `crop` – optional `[minX, minY, width, height]` for `gdal_translate -srcwin`
/// * `gcps` – ground control points (pixel coords already y-axis adjusted by frontend)
#[derive(Debug, serde::Serialize)]
pub struct UploadResult {
    pub absolute_path: String,
    pub web_url: String,
}

#[derive(Debug, serde::Serialize)]
pub struct WarpResult {
    pub web_url: String,
    pub extent: [f64; 4],
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct CornerCoordinates {
    upper_left: [f64; 2],
    lower_left: [f64; 2],
    upper_right: [f64; 2],
    lower_right: [f64; 2],
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct GdalInfoOutput {
    corner_coordinates: CornerCoordinates,
}

struct CleanupGuard {
    paths: Vec<PathBuf>,
}

impl Drop for CleanupGuard {
    fn drop(&mut self) {
        for path in &self.paths {
            if path.exists() {
                let _ = fs::remove_file(path);
            }
        }
    }
}

/// Tauri command that saves raw image bytes from the frontend into the project's
/// local `public/temp_uploads/` directory, resolving browser path security constraints.
#[tauri::command]
fn upload_image_bytes(filename: String, bytes: Vec<u8>) -> Result<UploadResult, String> {
    let mut project_root = std::env::current_dir()
        .map_err(|e| format!("Failed to resolve current directory: {}", e))?;
    
    if project_root.ends_with("src-tauri") {
        project_root.pop();
    }
    
    let temp_dir = project_root.join("public").join("temp_uploads");
    fs::create_dir_all(&temp_dir)
        .map_err(|e| format!("Failed to create temp uploads folder: {}", e))?;
        
    let dest_path = temp_dir.join(&filename);
    fs::write(&dest_path, &bytes)
        .map_err(|e| format!("Failed to write file to temp uploads: {}", e))?;
        
    let absolute_path = dest_path.to_string_lossy().to_string();
    let web_url = format!("/temp_uploads/{}", filename);
    
    Ok(UploadResult {
        absolute_path,
        web_url,
    })
}

/// Tauri command that crops (optionally) and warps an image using GDAL CLI tools,
/// then returns the relative web URL for the warped image and its geographic extent.
///
/// # Arguments
/// * `app_handle` – tauri app handle
/// * `image_path` – absolute path to the source image (within public/temp_uploads)
/// * `crop` – optional `[minX, minY, width, height]` for `gdal_translate -srcwin`
/// * `gcps` – ground control points
#[tauri::command]
fn warp_image(
    _app_handle: tauri::AppHandle,
    image_path: String,
    crop: Option<[f64; 4]>,
    gcps: Vec<Gcp>,
) -> Result<WarpResult, String> {
    let mut clean_path = image_path.clone();
    if clean_path.starts_with("asset://localhost/") {
        clean_path = clean_path.replacen("asset://localhost/", "", 1);
    } else if clean_path.starts_with("asset://") {
        clean_path = clean_path.replacen("asset://", "", 1);
    }
    
    clean_path = urlencoding::decode(&clean_path)
        .map(|c| c.into_owned())
        .unwrap_or(clean_path);

    let source_path = PathBuf::from(&clean_path);

    if !source_path.exists() {
        return Err(format!(
            "Input image file does not exist at path: {}",
            clean_path
        ));
    }

    // --- Validate GCPs ---
    if gcps.len() < 3 {
        return Err("At least 3 ground control points are required.".into());
    }

    if are_all_points_colinear(&gcps) {
        return Err(
            "All GCP points are colinear. Please provide non-colinear ground control points."
                .into(),
        );
    }

    // Resolve project relative temp directory
    let mut project_root = std::env::current_dir()
        .map_err(|e| format!("Failed to get current directory: {}", e))?;
    if project_root.ends_with("src-tauri") {
        project_root.pop();
    }
    
    let temp_dir = project_root.join("public").join("temp_uploads");
    fs::create_dir_all(&temp_dir)
        .map_err(|e| format!("Failed to create temporary upload directory: {}", e))?;

    // Derive file names from the source image
    let file_stem = source_path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("image");

    // Determine the working image path (may be cropped or original)
    let working_image_path: PathBuf;

    // Optional crop via gdal_translate -srcwin
    if let Some(crop_params) = crop {
        let cropped_path = temp_dir.join(format!("{}_cropped.png", file_stem));

        let output = Command::new("gdal_translate")
            .arg("-of")
            .arg("PNG")
            .arg("-srcwin")
            .arg(crop_params[0].to_string()) // minX (xoff)
            .arg(crop_params[1].to_string()) // minY (yoff)
            .arg(crop_params[2].to_string()) // width (xsize)
            .arg(crop_params[3].to_string()) // height (ysize)
            .arg(&clean_path)
            .arg(cropped_path.to_string_lossy().as_ref())
            .output()
            .map_err(|e| {
                format!(
                    "Failed to execute gdal_translate. Is GDAL installed and in PATH? Error: {}",
                    e
                )
            })?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("gdal_translate failed: {}", stderr));
        }

        working_image_path = cropped_path;
    } else {
        working_image_path = source_path.clone();
    }

    let georef_path = temp_dir.join(format!("{}_georef.tif", file_stem));
    let warped_tif_path = temp_dir.join(format!("{}_warped.tif", file_stem));
    let warped_png_path = temp_dir.join(format!("{}_warped.png", file_stem));

    // Register files for auto-cleanup on scope exit/failure
    let _cleanup = CleanupGuard {
        paths: vec![georef_path.clone(), warped_tif_path.clone()],
    };

    // Stage 1: gdal_translate to add GCPs to an intermediate GeoTIFF
    let mut translate_cmd = Command::new("gdal_translate");
    translate_cmd.arg("-of").arg("GTiff");

    // Add GCP arguments: -gcp pixel_x pixel_y geo_x geo_y
    for gcp in &gcps {
        translate_cmd
            .arg("-gcp")
            .arg(gcp.pixel_x.to_string())
            .arg(gcp.pixel_y.to_string())
            .arg(gcp.geo_x.to_string())
            .arg(gcp.geo_y.to_string());
    }

    translate_cmd.arg(working_image_path.to_string_lossy().as_ref());
    translate_cmd.arg(georef_path.to_string_lossy().as_ref());

    let output_translate = translate_cmd.output().map_err(|e| {
        format!(
            "Failed to execute gdal_translate for GCPs. Is GDAL installed and in PATH? Error: {}",
            e
        )
    })?;

    if !output_translate.status.success() {
        let stderr = String::from_utf8_lossy(&output_translate.stderr);
        return Err(format!("gdal_translate (GCP assignment) failed: {}", stderr));
    }

    // Stage 2: gdalwarp on the intermediate GeoTIFF to create warped GeoTIFF
    let output_warp = Command::new("gdalwarp")
        .arg("-tps")
        .arg("-overwrite")
        .arg("-dstalpha")
        .arg("-of")
        .arg("GTiff")
        .arg("-co")
        .arg("COMPRESS=DEFLATE")
        .arg("-t_srs")
        .arg("EPSG:4326")
        .arg(georef_path.to_string_lossy().as_ref())
        .arg(warped_tif_path.to_string_lossy().as_ref())
        .output()
        .map_err(|e| {
            format!(
                "Failed to execute gdalwarp. Is GDAL installed and in PATH? Error: {}",
                e
            )
        })?;

    if !output_warp.status.success() {
        let stderr = String::from_utf8_lossy(&output_warp.stderr);
        return Err(format!("gdalwarp failed: {}", stderr));
    }

    // Stage 3: run gdalinfo to get the extent of the warped GeoTIFF
    let output_info = Command::new("gdalinfo")
        .arg("-json")
        .arg(warped_tif_path.to_string_lossy().as_ref())
        .output()
        .map_err(|e| {
            format!(
                "Failed to execute gdalinfo. Is GDAL installed and in PATH? Error: {}",
                e
            )
        })?;

    if !output_info.status.success() {
        let stderr = String::from_utf8_lossy(&output_info.stderr);
        return Err(format!("gdalinfo failed: {}", stderr));
    }

    let info_str = String::from_utf8_lossy(&output_info.stdout);
    let info_json: GdalInfoOutput = serde_json::from_str(&info_str)
        .map_err(|e| format!("Failed to parse gdalinfo JSON: {}. Output: {}", e, info_str))?;

    let corners = info_json.corner_coordinates;
    let lons = [
        corners.upper_left[0],
        corners.lower_left[0],
        corners.upper_right[0],
        corners.lower_right[0],
    ];
    let lats = [
        corners.upper_left[1],
        corners.lower_left[1],
        corners.upper_right[1],
        corners.lower_right[1],
    ];

    let min_lon = lons.iter().copied().fold(f64::INFINITY, f64::min);
    let max_lon = lons.iter().copied().fold(f64::NEG_INFINITY, f64::max);
    let min_lat = lats.iter().copied().fold(f64::INFINITY, f64::min);
    let max_lat = lats.iter().copied().fold(f64::NEG_INFINITY, f64::max);

    let extent = [min_lon, min_lat, max_lon, max_lat];

    // Stage 4: convert intermediate warped GeoTIFF to final transparent PNG
    let output_translate_png = Command::new("gdal_translate")
        .arg("-of")
        .arg("PNG")
        .arg("-co")
        .arg("WORLDFILE=NO")
        .arg(warped_tif_path.to_string_lossy().as_ref())
        .arg(warped_png_path.to_string_lossy().as_ref())
        .output()
        .map_err(|e| {
            format!(
                "Failed to execute gdal_translate for PNG conversion. Is GDAL installed? Error: {}",
                e
            )
        })?;

    if !output_translate_png.status.success() {
        let stderr = String::from_utf8_lossy(&output_translate_png.stderr);
        return Err(format!("gdal_translate to PNG failed: {}", stderr));
    }

    let web_url = format!("/temp_uploads/{}_warped.png", file_stem);
    Ok(WarpResult { web_url, extent })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            warp_image,
            pick_image_file,
            read_image_base64,
            upload_image_bytes
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_path_sanitization() {
        let test_cases = vec![
            (
                "asset://localhost/%2FUsers%2Ftest%2Fimage%20with%20spaces.png",
                "/Users/test/image with spaces.png"
            ),
            (
                "asset://%2FUsers%2Ftest%2Fimage.png",
                "/Users/test/image.png"
            ),
            (
                "/Users/test/normal_path.png",
                "/Users/test/normal_path.png"
            )
        ];

        for (input, expected) in test_cases {
            let mut clean_path = input.to_string();
            if clean_path.starts_with("asset://localhost/") {
                clean_path = clean_path.replacen("asset://localhost/", "", 1);
            } else if clean_path.starts_with("asset://") {
                clean_path = clean_path.replacen("asset://", "", 1);
            }
            let decoded = urlencoding::decode(&clean_path)
                .map(|c| c.into_owned())
                .unwrap_or(clean_path);
            assert_eq!(decoded, expected);
        }
    }

    #[test]
    fn test_extent_calculation() {
        let json_data = r#"{
            "cornerCoordinates": {
                "upperLeft": [-122.4, 37.8],
                "lowerLeft": [-122.4, 37.7],
                "upperRight": [-122.3, 37.8],
                "lowerRight": [-122.3, 37.7]
            }
        }"#;

        let info_json: GdalInfoOutput = serde_json::from_str(json_data).unwrap();
        let corners = info_json.corner_coordinates;
        let lons = [
            corners.upper_left[0],
            corners.lower_left[0],
            corners.upper_right[0],
            corners.lower_right[0],
        ];
        let lats = [
            corners.upper_left[1],
            corners.lower_left[1],
            corners.upper_right[1],
            corners.lower_right[1],
        ];

        let min_lon = lons.iter().copied().fold(f64::INFINITY, f64::min);
        let max_lon = lons.iter().copied().fold(f64::NEG_INFINITY, f64::max);
        let min_lat = lats.iter().copied().fold(f64::INFINITY, f64::min);
        let max_lat = lats.iter().copied().fold(f64::NEG_INFINITY, f64::max);

        assert_eq!(min_lon, -122.4);
        assert_eq!(max_lon, -122.3);
        assert_eq!(min_lat, 37.7);
        assert_eq!(max_lat, 37.8);
    }
}

