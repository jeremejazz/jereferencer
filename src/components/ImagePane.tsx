import { useEffect, useRef, useState, useCallback } from "react";
import Map from "ol/Map";
import View from "ol/View";
import ImageLayer from "ol/layer/Image";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Static from "ol/source/ImageStatic";
import OlOverlay from "ol/Overlay";
import Projection from "ol/proj/Projection";
import { getCenter } from "ol/extent";
import Feature from "ol/Feature";
import { Polygon as OlPolygon } from "ol/geom";
import { Style, Fill, Stroke } from "ol/style";
import { Layers, Crop, Scissors, RotateCw, Info, Upload, Lock, MapPin, Loader2 } from "lucide-react";

import { Pin, CropBounds } from "./MainDashboard";

interface ImagePaneProps {
  pins: Pin[];
  isAddCoordinatesActive: boolean;
  validationMessage: string | null;
  onToggleAddCoordinates: () => void;
  onAddImagePin: (coords: [number, number]) => void;
  onDeletePin: (id: string) => void;
  uploadedImageUrl: string | null;
  onImageUploaded: (url: string, dims: [number, number], filePath: string | null) => void;
  imageDimensions: [number, number] | null;
  isCropActive: boolean;
  onToggleCrop: () => void;
  cropBounds: CropBounds | null;
  onCropBoundsChange: (bounds: CropBounds | null) => void;
  isOverlayActive: boolean;
  isWarping: boolean;
  onToggleOverlay: () => void;
}

export function ImagePane({
  pins,
  isAddCoordinatesActive,
  validationMessage,
  onToggleAddCoordinates,
  onAddImagePin,
  onDeletePin,
  uploadedImageUrl,
  onImageUploaded,
  imageDimensions,
  isCropActive,
  onToggleCrop,
  cropBounds,
  onCropBoundsChange,
  isOverlayActive,
  isWarping,
  onToggleOverlay,
}: ImagePaneProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs for stable callbacks in OL event handlers
  const activeRef = useRef(isAddCoordinatesActive);
  const onAddImagePinRef = useRef(onAddImagePin);
  const isCropActiveRef = useRef(isCropActive);
  const cropBoundsRef = useRef(cropBounds);
  const onCropBoundsChangeRef = useRef(onCropBoundsChange);
  const imageDimsRef = useRef(imageDimensions);

  // Crop drawing state refs
  const cropStartRef = useRef<[number, number] | null>(null);
  const isDraggingCropRef = useRef(false);

  // Vector layer for spotlight overlay
  const spotlightLayerRef = useRef<VectorLayer | null>(null);
  const spotlightSourceRef = useRef<VectorSource | null>(null);

  // Vector layer for crop rectangle outline (during drawing)
  const cropRectLayerRef = useRef<VectorLayer | null>(null);
  const cropRectSourceRef = useRef<VectorSource | null>(null);

  useEffect(() => {
    activeRef.current = isAddCoordinatesActive;
    onAddImagePinRef.current = onAddImagePin;
    isCropActiveRef.current = isCropActive;
    cropBoundsRef.current = cropBounds;
    onCropBoundsChangeRef.current = onCropBoundsChange;
    imageDimsRef.current = imageDimensions;
  }, [isAddCoordinatesActive, onAddImagePin, isCropActive, cropBounds, onCropBoundsChange, imageDimensions]);

  // ---- Initialize OpenLayers map (Task 1.2: no default placeholder) ----
  useEffect(() => {
    if (!mapElement.current || !uploadedImageUrl || !imageDimensions) return;

    const extent: [number, number, number, number] = [0, 0, imageDimensions[0], imageDimensions[1]];

    const projection = new Projection({
      code: "raster-image",
      units: "pixels",
      extent: extent,
    });

    // Spotlight vector layer
    const spotlightSource = new VectorSource();
    const spotlightLayer = new VectorLayer({
      source: spotlightSource,
      style: new Style({
        fill: new Fill({ color: "rgba(0, 0, 0, 0.5)" }),
      }),
      zIndex: 10,
    });

    // Crop rect outline layer (shown during drawing)
    const cropRectSource = new VectorSource();
    const cropRectLayer = new VectorLayer({
      source: cropRectSource,
      style: new Style({
        stroke: new Stroke({ color: "#38bdf8", width: 2, lineDash: [6, 4] }),
        fill: new Fill({ color: "rgba(56, 189, 248, 0.08)" }),
      }),
      zIndex: 11,
    });

    const map = new Map({
      target: mapElement.current,
      layers: [
        new ImageLayer({
          source: new Static({
            url: uploadedImageUrl,
            projection: projection,
            imageExtent: extent,
          }),
        }),
        spotlightLayer,
        cropRectLayer,
      ],
      view: new View({
        projection: projection,
        center: getCenter(extent),
        zoom: 2,
        maxZoom: 6,
        minZoom: 1,
      }),
      controls: [],
    });

    spotlightLayerRef.current = spotlightLayer;
    spotlightSourceRef.current = spotlightSource;
    cropRectLayerRef.current = cropRectLayer;
    cropRectSourceRef.current = cropRectSource;

    // ---- Click handler: add coordinate pins or finalize crop ----
    map.on("singleclick", (e) => {
      if (isCropActiveRef.current) {
        // Crop clicks handled by pointer events below
        return;
      }
      if (activeRef.current) {
        onAddImagePinRef.current(e.coordinate as [number, number]);
      }
    });

    // ---- Crop drag drawing (Task 2.3) ----
    // Use DOM events for pointerdown/pointerup since OL Map doesn't expose these
    const viewport = map.getViewport();

    const handlePointerDown = (evt: PointerEvent) => {
      if (!isCropActiveRef.current) return;
      const pixel: [number, number] = [evt.offsetX, evt.offsetY];
      const coord = map.getCoordinateFromPixel(pixel);
      if (coord) {
        cropStartRef.current = coord as [number, number];
        isDraggingCropRef.current = true;
      }
    };

    const handlePointerUp = (evt: PointerEvent) => {
      if (!isDraggingCropRef.current || !cropStartRef.current) return;
      isDraggingCropRef.current = false;

      const pixel: [number, number] = [evt.offsetX, evt.offsetY];
      const coord = map.getCoordinateFromPixel(pixel);
      if (!coord) {
        cropStartRef.current = null;
        cropRectSourceRef.current?.clear();
        return;
      }
      const [startX, startY] = cropStartRef.current;
      const [endX, endY] = coord as [number, number];
      cropStartRef.current = null;

      // Only register crop if drag area is significant
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);
      if (width < 5 || height < 5) {
        cropRectSourceRef.current?.clear();
        return;
      }

      const minX = Math.max(0, Math.min(startX, endX));
      const minY = Math.max(0, Math.min(startY, endY));
      const maxX = Math.min(imageDimsRef.current ? imageDimsRef.current[0] : Infinity, Math.max(startX, endX));
      const maxY = Math.min(imageDimsRef.current ? imageDimsRef.current[1] : Infinity, Math.max(startY, endY));

      cropRectSourceRef.current?.clear();
      onCropBoundsChangeRef.current([minX, minY, maxX, maxY]);
    };

    viewport.addEventListener("pointerdown", handlePointerDown);
    viewport.addEventListener("pointerup", handlePointerUp);

    map.on("pointermove", (e) => {
      if (!isDraggingCropRef.current || !cropStartRef.current) return;
      const [startX, startY] = cropStartRef.current;
      const [endX, endY] = e.coordinate as [number, number];

      const minX = Math.min(startX, endX);
      const minY = Math.min(startY, endY);
      const maxX = Math.max(startX, endX);
      const maxY = Math.max(startY, endY);

      // Update the crop rect preview
      cropRectSourceRef.current?.clear();
      const rectCoords = [
        [minX, minY],
        [maxX, minY],
        [maxX, maxY],
        [minX, maxY],
        [minX, minY],
      ];
      cropRectSourceRef.current?.addFeature(
        new Feature(new OlPolygon([rectCoords]))
      );
    });

    mapInstance.current = map;

    return () => {
      viewport.removeEventListener("pointerdown", handlePointerDown);
      viewport.removeEventListener("pointerup", handlePointerUp);
      map.setTarget(undefined);
      mapInstance.current = null;
      spotlightLayerRef.current = null;
      spotlightSourceRef.current = null;
      cropRectLayerRef.current = null;
      cropRectSourceRef.current = null;
    };
  }, [uploadedImageUrl, imageDimensions]);

  // ---- Render spotlight overlay when crop bounds change (Task 2.4) ----
  useEffect(() => {
    const source = spotlightSourceRef.current;
    if (!source || !imageDimensions) return;

    source.clear();

    if (!cropBounds) return;

    const [minX, minY, maxX, maxY] = cropBounds;
    const [imgW, imgH] = imageDimensions;

    // Create a large outer polygon covering the entire image
    const outerRing = [
      [0, 0],
      [imgW, 0],
      [imgW, imgH],
      [0, imgH],
      [0, 0],
    ];

    // Inner ring (hole) is the crop rectangle - must be wound in opposite direction
    const innerRing = [
      [minX, minY],
      [minX, maxY],
      [maxX, maxY],
      [maxX, minY],
      [minX, minY],
    ];

    // Polygon with a hole: outer ring + inner ring (hole)
    const maskPolygon = new OlPolygon([outerRing, innerRing]);
    source.addFeature(new Feature(maskPolygon));
  }, [cropBounds, imageDimensions]);

  // ---- Update pin overlays ----
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    map.getOverlays().clear();

    pins.forEach((pin, index) => {
      if (pin.imageCoords) {
        const el = document.createElement("div");
        el.className = "w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white cursor-pointer select-none z-50 transition-transform hover:scale-110";
        el.innerText = (index + 1).toString();

        el.oncontextmenu = (e) => {
          e.preventDefault();
          e.stopPropagation();
          onDeletePin(pin.id);
        };

        const overlay = new OlOverlay({
          position: pin.imageCoords,
          positioning: "center-center",
          element: el,
          stopEvent: true,
        });
        map.addOverlay(overlay);
      }
    });
  }, [pins, onDeletePin]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (uploadedImageUrl) {
        URL.revokeObjectURL(uploadedImageUrl);
      }
      const objUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        // For Tauri file paths, we need the webkitRelativePath or name.
        // Since we're using object URLs, we'll store the file path if available.
        // Note: browser security prevents getting the full path from file input.
        // The user will need to provide the path via a Tauri open dialog in a future enhancement.
        // For now, store the file name.
        const filePath = (file as any).path || file.name;
        onImageUploaded(objUrl, [img.naturalWidth, img.naturalHeight], filePath);
      };
      img.src = objUrl;
      // Reset input value so same file can be selected again
      e.target.value = "";
    }
  };

  const handleToolClick = useCallback((toolName: string) => {
    setMessage(`Tool: ${toolName} activated (placeholder)`);
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const handleZoomIn = () => {
    if (mapInstance.current) {
      const view = mapInstance.current.getView();
      const currentZoom = view.getZoom() ?? 2;
      view.animate({
        zoom: currentZoom + 0.5,
        duration: 250,
      });
    }
  };

  const handleZoomOut = () => {
    if (mapInstance.current) {
      const view = mapInstance.current.getView();
      const currentZoom = view.getZoom() ?? 2;
      view.animate({
        zoom: currentZoom - 0.5,
        duration: 250,
      });
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Map Target or Upload Prompt (Task 1.2) */}
      {uploadedImageUrl && imageDimensions ? (
        <div ref={mapElement} className="flex-1 w-full h-full" />
      ) : (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center gap-4 text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center">
            <Upload className="w-7 h-7 text-slate-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">No image loaded</p>
            <p className="text-xs text-slate-500 mt-1">Upload a raster image to begin georeferencing</p>
          </div>
          <button
            onClick={handleUploadClick}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition duration-200 cursor-pointer shadow-md shadow-sky-900/30"
          >
            Upload Image
          </button>
        </div>
      )}

      {/* Floating Toolbar Top Middle */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-1 rounded-lg shadow-lg">
          <button
            onClick={onToggleOverlay}
            disabled={isWarping}
            className={`p-2 rounded-md transition duration-200 flex items-center justify-center cursor-pointer ${
              isWarping
                ? "bg-amber-600/80 text-white animate-pulse"
                : isOverlayActive
                ? "bg-sky-600 text-white shadow-md shadow-sky-900/40"
                : "text-slate-300 hover:text-slate-100 hover:bg-slate-800"
            }`}
            title="Overlay raster image on top of GIS map"
          >
            {isWarping ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Layers className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={onToggleCrop}
            className={`p-2 rounded-md transition duration-200 flex items-center justify-center cursor-pointer ${
              isCropActive
                ? "bg-sky-600 text-white shadow-md shadow-sky-900/40"
                : "text-slate-300 hover:text-slate-100 hover:bg-slate-800"
            }`}
            title="Crop boundaries of raster image"
          >
            <Crop className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1" />

          <button
            onClick={onToggleAddCoordinates}
            className={`p-2 rounded-md transition duration-200 flex items-center justify-center cursor-pointer ${
              isAddCoordinatesActive
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/40"
                : "text-slate-300 hover:text-slate-100 hover:bg-slate-800"
            }`}
            title="Add Coordinates"
          >
            <MapPin className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1" />

          <button
            onClick={() => handleToolClick("Clip")}
            className="p-2 rounded-md transition duration-200 flex items-center justify-center cursor-pointer text-slate-300 hover:text-slate-100 hover:bg-slate-800"
            title="Clip sections of raster image"
          >
            <Scissors className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToolClick("Rotate")}
            className="p-2 rounded-md transition duration-200 flex items-center justify-center cursor-pointer text-slate-300 hover:text-slate-100 hover:bg-slate-800"
            title="Rotate raster scan"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info Message Feedback */}
      {(message || validationMessage) && (
        <div className={`absolute bottom-16 left-4 z-10 bg-slate-950/90 backdrop-blur-md border ${validationMessage ? "border-red-900/30" : "border-sky-900/30"} text-sky-200 text-[10px] px-2.5 py-1.5 rounded-md shadow-md flex items-center gap-1.5 transition-all duration-300 animate-fade-in`}>
          <Info className={`w-3 h-3 ${validationMessage ? "text-red-400" : "text-sky-400"}`} />
          <span className={validationMessage ? "text-red-400 font-medium" : ""}>
            {validationMessage || message}
          </span>
        </div>
      )}

      {/* Floating Custom Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-100 transition duration-200 font-semibold shadow-lg cursor-pointer text-sm"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-100 transition duration-200 font-semibold shadow-lg cursor-pointer text-sm"
          title="Zoom Out"
        >
          −
        </button>
      </div>

      {/* Middle-Right Side Tab Panel */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10 flex flex-col gap-1.5 pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800 p-1 rounded-lg shadow-lg">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={handleUploadClick}
          className="p-2 rounded-md transition duration-200 flex items-center justify-center cursor-pointer text-slate-300 hover:text-slate-100 hover:bg-slate-800"
          title="Upload Image"
        >
          <Upload className="w-4 h-4" />
        </button>
        <button
          className="p-2 rounded-md transition duration-200 flex items-center justify-center cursor-pointer text-slate-300 hover:text-slate-100 hover:bg-slate-800"
          title="Lock Viewport"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom status indicator */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 border border-slate-800 rounded-md text-[10px] text-slate-400 font-mono flex items-center gap-1.5 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
        <span>Raster Image View (Flat Pixel Space)</span>
      </div>
    </div>
  );
}
