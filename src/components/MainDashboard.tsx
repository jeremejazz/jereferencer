import { useState, useCallback } from "react";
import { MapPane } from "./MapPane";
import { ImagePane } from "./ImagePane";
import { invoke } from "@tauri-apps/api/core";
import * as turf from "@turf/turf";

export interface Pin {
  id: string;
  imageCoords: [number, number] | null;
  mapCoords: [number, number] | null;
}

export type CropBounds = [number, number, number, number]; // [minX, minY, maxX, maxY]

export function MainDashboard() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [isAddCoordinatesActive, setIsAddCoordinatesActive] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<[number, number] | null>(null);

  // Crop state (Task 2.1)
  const [cropBounds, setCropBounds] = useState<CropBounds | null>(null);
  const [isCropActive, setIsCropActive] = useState(false);

  // Overlay / warp state (Tasks 4.1, 4.2)
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const [warpedImageDataUrl, setWarpedImageDataUrl] = useState<string | null>(null);
  const [isWarping, setIsWarping] = useState(false);
  const [lastWarpKey, setLastWarpKey] = useState<string | null>(null);

  const showValidation = useCallback((msg: string) => {
    setValidationMessage(msg);
    setTimeout(() => setValidationMessage(null), 3000);
  }, []);

  // ---------- State reset on new image upload (Task 1.3) ----------
  const handleImageUploaded = useCallback((url: string, dims: [number, number], filePath: string | null) => {
    // Clear all state when a new image is uploaded
    setPins([]);
    setCropBounds(null);
    setIsCropActive(false);
    setIsAddCoordinatesActive(false);
    setIsOverlayActive(false);
    setWarpedImageDataUrl(null);
    setLastWarpKey(null);

    setUploadedImageUrl(url);
    setImageDimensions(dims);
    setUploadedImagePath(filePath);
  }, []);

  // ---------- Add Coordinates toggle ----------
  const handleToggleAddCoordinates = useCallback(() => {
    if (isAddCoordinatesActive) {
      const hasUnpaired = pins.some(p => !p.imageCoords || !p.mapCoords);
      if (hasUnpaired) {
        showValidation("Cannot deactivate: Unequal coordinate pins.");
        return;
      }
    } else {
      // Deactivate crop mode when entering add-coordinates (mutual exclusion)
      setIsCropActive(false);
    }
    setIsAddCoordinatesActive(!isAddCoordinatesActive);
  }, [isAddCoordinatesActive, pins, showValidation]);

  // ---------- Crop toggle (Task 2.2 mutual exclusion) ----------
  const handleToggleCrop = useCallback(() => {
    if (!isCropActive) {
      // Deactivate add-coordinates mode when entering crop
      setIsAddCoordinatesActive(false);
    }
    setIsCropActive(!isCropActive);
  }, [isCropActive]);

  // ---------- Crop bounds validation (Task 2.5) ----------
  const handleCropBoundsChange = useCallback((bounds: CropBounds | null) => {
    if (bounds && pins.length > 0) {
      // Validate that all existing image pins are within the new crop bounds
      const cropPoly = turf.bboxPolygon(bounds);
      for (const pin of pins) {
        if (pin.imageCoords) {
          const pt = turf.point(pin.imageCoords);
          if (!turf.booleanPointInPolygon(pt, cropPoly)) {
            showValidation("Crop boundary must contain all existing coordinate pins.");
            return;
          }
        }
      }
    }
    setCropBounds(bounds);
  }, [pins, showValidation]);

  // ---------- Pin placement with crop validation (Task 2.5) ----------
  const handleAddImagePin = useCallback((coords: [number, number]) => {
    if (cropBounds) {
      const cropPoly = turf.bboxPolygon(cropBounds);
      const pt = turf.point(coords);
      if (!turf.booleanPointInPolygon(pt, cropPoly)) {
        showValidation("Coordinates must be within the crop boundary.");
        return;
      }
    }
    setPins(prev => {
      const unpairedIdx = prev.findIndex(p => !p.imageCoords);
      if (unpairedIdx >= 0) {
        const next = [...prev];
        next[unpairedIdx] = { ...next[unpairedIdx], imageCoords: coords };
        return next;
      }
      return [...prev, { id: String(Date.now()), imageCoords: coords, mapCoords: null }];
    });
  }, [cropBounds, showValidation]);

  const handleAddMapPin = useCallback((coords: [number, number]) => {
    setPins(prev => {
      const unpairedIdx = prev.findIndex(p => !p.mapCoords);
      if (unpairedIdx >= 0) {
        const next = [...prev];
        next[unpairedIdx] = { ...next[unpairedIdx], mapCoords: coords };
        return next;
      }
      return [...prev, { id: String(Date.now()), imageCoords: null, mapCoords: coords }];
    });
  }, []);

  const handleDeletePin = useCallback((id: string) => {
    setPins(prev => prev.filter(p => p.id !== id));
  }, []);

  // ---------- Colinearity validation (Task 2.6) ----------
  const arePointsColinear = useCallback((points: [number, number][]): boolean => {
    if (points.length < 3) return true;
    // Check if ALL triplets are colinear (meaning all points lie on the same line)
    const EPSILON = 1e-6;
    for (let i = 0; i < points.length - 2; i++) {
      for (let j = i + 1; j < points.length - 1; j++) {
        for (let k = j + 1; k < points.length; k++) {
          const [x1, y1] = points[i];
          const [x2, y2] = points[j];
          const [x3, y3] = points[k];
          const area = Math.abs(x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2;
          if (area > EPSILON) {
            return false; // Found a non-colinear triplet
          }
        }
      }
    }
    return true;
  }, []);

  // ---------- Overlay toggle with warp invocation (Tasks 4.1, 4.2) ----------
  const handleToggleOverlay = useCallback(async () => {
    if (isOverlayActive) {
      // Turning off overlay
      setIsOverlayActive(false);
      return;
    }

    // Validate: at least 3 paired coordinate pins
    const pairedPins = pins.filter(p => p.imageCoords && p.mapCoords);
    if (pairedPins.length < 3) {
      showValidation("At least 3 matched coordinate pairs are required for overlay.");
      return;
    }

    // Colinearity check on image coords
    const imagePoints = pairedPins.map(p => p.imageCoords!) as [number, number][];
    if (arePointsColinear(imagePoints)) {
      showValidation("Coordinate pins are colinear. Add non-colinear points.");
      return;
    }

    if (!uploadedImagePath) {
      showValidation("No image file path available. Please re-upload the image.");
      return;
    }

    // Build warp cache key (Task 4.2)
    const gcpData = pairedPins.map(p => ({
      pixel_x: p.imageCoords![0],
      pixel_y: p.imageCoords![1],
      geo_x: p.mapCoords![0],
      geo_y: p.mapCoords![1],
    }));

    const warpKey = JSON.stringify({
      gcps: gcpData,
      crop: cropBounds,
      imagePath: uploadedImagePath,
    });

    if (warpKey === lastWarpKey && warpedImageDataUrl) {
      // No changes since last warp, reuse cached result
      setIsOverlayActive(true);
      return;
    }

    // Need to invoke the warp command
    setIsWarping(true);
    try {
      // Build crop param for Rust: [minX, minY, width, height] for gdal_translate -srcwin
      let cropParam: [number, number, number, number] | null = null;
      if (cropBounds && imageDimensions) {
        const [minX, minY, maxX, maxY] = cropBounds;
        cropParam = [minX, minY, maxX - minX, maxY - minY];
      }

      // Adjust GCP pixel coords: if crop is active, translate relative to crop origin
      // Also invert Y-axis for GDAL (Design Decision #1): gdal_y = image_height - ol_y
      const height = imageDimensions ? imageDimensions[1] : 0;
      const adjustedGcps = gcpData.map(gcp => {
        let px = gcp.pixel_x;
        let py = gcp.pixel_y;

        if (cropBounds) {
          // Adjust relative to crop origin
          px = px - cropBounds[0];
          py = py - cropBounds[1];
          // Invert Y relative to crop height
          const cropHeight = cropBounds[3] - cropBounds[1];
          py = cropHeight - py;
        } else {
          // Invert Y relative to full image height
          py = height - py;
        }

        return {
          pixel_x: px,
          pixel_y: py,
          geo_x: gcp.geo_x,
          geo_y: gcp.geo_y,
        };
      });

      const dataUrl = await invoke<string>("warp_image", {
        imagePath: uploadedImagePath,
        crop: cropParam,
        gcps: adjustedGcps,
      });

      setWarpedImageDataUrl(dataUrl);
      setLastWarpKey(warpKey);
      setIsOverlayActive(true);
    } catch (err) {
      showValidation(`Warp failed: ${err}`);
    } finally {
      setIsWarping(false);
    }
  }, [
    isOverlayActive, pins, cropBounds, uploadedImagePath,
    imageDimensions, arePointsColinear, lastWarpKey,
    warpedImageDataUrl, showValidation,
  ]);

  // Compute geographic extent from paired map coords for the overlay
  const overlayExtent = (() => {
    if (!isOverlayActive || !warpedImageDataUrl) return null;
    const pairedPins = pins.filter(p => p.imageCoords && p.mapCoords);
    if (pairedPins.length < 3) return null;
    const lons = pairedPins.map(p => p.mapCoords![0]);
    const lats = pairedPins.map(p => p.mapCoords![1]);
    return [
      Math.min(...lons), Math.min(...lats),
      Math.max(...lons), Math.max(...lats),
    ] as [number, number, number, number];
  })();

  return (
    <div className="flex-1 w-full h-full flex flex-col min-h-0">
      <div className="flex-1 flex flex-row w-full h-full min-h-0 bg-slate-950">
        <div className="w-1/2 h-full relative">
          <MapPane
            pins={pins}
            isAddCoordinatesActive={isAddCoordinatesActive}
            onAddMapPin={handleAddMapPin}
            onDeletePin={handleDeletePin}
            warpedImageDataUrl={isOverlayActive ? warpedImageDataUrl : null}
            overlayExtent={overlayExtent}
          />
        </div>

        <div className="w-1/2 h-full relative border-l border-slate-900">
          <ImagePane
            pins={pins}
            isAddCoordinatesActive={isAddCoordinatesActive}
            validationMessage={validationMessage}
            onToggleAddCoordinates={handleToggleAddCoordinates}
            onAddImagePin={handleAddImagePin}
            onDeletePin={handleDeletePin}
            uploadedImageUrl={uploadedImageUrl}
            onImageUploaded={handleImageUploaded}
            imageDimensions={imageDimensions}
            isCropActive={isCropActive}
            onToggleCrop={handleToggleCrop}
            cropBounds={cropBounds}
            onCropBoundsChange={handleCropBoundsChange}
            isOverlayActive={isOverlayActive}
            isWarping={isWarping}
            onToggleOverlay={handleToggleOverlay}
          />
        </div>
      </div>
    </div>
  );
}
