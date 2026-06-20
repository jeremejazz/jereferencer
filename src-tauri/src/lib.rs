// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use base64::Engine;
use serde::Deserialize;
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use tauri::Manager;

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
#[tauri::command]
fn warp_image(
    app_handle: tauri::AppHandle,
    image_path: String,
    crop: Option<[f64; 4]>,
    gcps: Vec<Gcp>,
) -> Result<String, String> {
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

    // --- Resolve cache directory ---
    let cache_dir = app_handle
        .path()
        .app_cache_dir()
        .map_err(|e| format!("Failed to resolve app cache directory: {}", e))?;

    fs::create_dir_all(&cache_dir)
        .map_err(|e| format!("Failed to create cache directory: {}", e))?;

    // Derive file names from the source image
    let source_path = PathBuf::from(&image_path);
    let file_stem = source_path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("image");

    // Determine the working image path (may be cropped or original)
    let working_image_path: PathBuf;

    // --- Task 3.3: Optional crop via gdal_translate -srcwin ---
    if let Some(crop_params) = crop {
        let cropped_path = cache_dir.join(format!("{}_cropped.png", file_stem));

        let output = Command::new("gdal_translate")
            .arg("-of")
            .arg("PNG")
            .arg("-srcwin")
            .arg(crop_params[0].to_string()) // minX (xoff)
            .arg(crop_params[1].to_string()) // minY (yoff)
            .arg(crop_params[2].to_string()) // width (xsize)
            .arg(crop_params[3].to_string()) // height (ysize)
            .arg(&image_path)
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

    // --- Task 3.4: Warp via gdalwarp with GCPs ---
    let warped_path = cache_dir.join(format!("{}_warped.png", file_stem));

    let mut gdalwarp_cmd = Command::new("gdalwarp");
    gdalwarp_cmd
        .arg("-overwrite")
        .arg("-of")
        .arg("PNG");

    // Add GCP arguments: -gcp pixel_x pixel_y geo_x geo_y
    for gcp in &gcps {
        gdalwarp_cmd
            .arg("-gcp")
            .arg(gcp.pixel_x.to_string())
            .arg(gcp.pixel_y.to_string())
            .arg(gcp.geo_x.to_string())
            .arg(gcp.geo_y.to_string());
    }

    // Source and destination
    gdalwarp_cmd.arg(working_image_path.to_string_lossy().as_ref());
    gdalwarp_cmd.arg(warped_path.to_string_lossy().as_ref());

    let output = gdalwarp_cmd.output().map_err(|e| {
        format!(
            "Failed to execute gdalwarp. Is GDAL installed and in PATH? Error: {}",
            e
        )
    })?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("gdalwarp failed: {}", stderr));
    }

    // --- Task 3.6: Read warped file and encode as base64 data URL ---
    let warped_bytes = fs::read(&warped_path)
        .map_err(|e| format!("Failed to read warped output file: {}", e))?;

    let b64 = base64::engine::general_purpose::STANDARD.encode(&warped_bytes);
    let data_url = format!("data:image/png;base64,{}", b64);

    Ok(data_url)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, warp_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
