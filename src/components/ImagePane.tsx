import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";
import Overlay from "ol/Overlay";
import Projection from "ol/proj/Projection";
import { getCenter } from "ol/extent";
import { Layers, Crop, Scissors, RotateCw, Info, Upload, Lock, MapPin } from "lucide-react";

import { Pin } from "./MainDashboard";

interface ImagePaneProps {
  pins: Pin[];
  isAddCoordinatesActive: boolean;
  validationMessage: string | null;
  onToggleAddCoordinates: () => void;
  onAddImagePin: (coords: [number, number]) => void;
  onDeletePin: (id: string) => void;
  uploadedImageUrl: string | null;
  setUploadedImageUrl: (url: string | null) => void;
  imageDimensions: [number, number] | null;
  setImageDimensions: (dims: [number, number] | null) => void;
}

export function ImagePane({
  pins,
  isAddCoordinatesActive,
  validationMessage,
  onToggleAddCoordinates,
  onAddImagePin,
  onDeletePin,
  uploadedImageUrl,
  setUploadedImageUrl,
  imageDimensions,
  setImageDimensions,
}: ImagePaneProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeRef = useRef(isAddCoordinatesActive);
  const onAddImagePinRef = useRef(onAddImagePin);

  useEffect(() => {
    activeRef.current = isAddCoordinatesActive;
    onAddImagePinRef.current = onAddImagePin;
  }, [isAddCoordinatesActive, onAddImagePin]);

  useEffect(() => {
    if (!mapElement.current) return;

    const url = uploadedImageUrl || "/ed-259-xcrI6CPkkJs-unsplash.jpg";
    const extent = imageDimensions ? [0, 0, imageDimensions[0], imageDimensions[1]] : [0, 0, 1200, 896];

    const projection = new Projection({
      code: "raster-image",
      units: "pixels",
      extent: extent,
    });

    const map = new Map({
      target: mapElement.current,
      layers: [
        new ImageLayer({
          source: new Static({
            url: url,
            projection: projection,
            imageExtent: extent,
          }),
        }),
      ],
      view: new View({
        projection: projection,
        center: getCenter(extent),
        zoom: 2,
        maxZoom: 6,
        minZoom: 1,
      }),
      controls: [], // Hide default controls for custom styling
    });

    map.on('singleclick', (e) => {
      if (activeRef.current) {
        onAddImagePinRef.current(e.coordinate as [number, number]);
      }
    });

    mapInstance.current = map;

    return () => {
      map.setTarget(undefined);
      mapInstance.current = null;
    };
  }, [uploadedImageUrl, imageDimensions]);

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

        const overlay = new Overlay({
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
        setImageDimensions([img.naturalWidth, img.naturalHeight]);
        setUploadedImageUrl(objUrl);
      };
      img.src = objUrl;
      // Reset input value so same file can be selected again
      e.target.value = "";
    }
  };

  const handleToolClick = (toolName: string) => {
    setActiveTool(toolName === activeTool ? null : toolName);
    if (toolName !== activeTool) {
      setMessage(`Tool: ${toolName} activated (placeholder)`);
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } else {
      setMessage(null);
    }
  };

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
      {/* Map Target */}
      <div ref={mapElement} className="flex-1 w-full h-full" />

      {/* Floating Toolbar Top Middle */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-1 rounded-lg shadow-lg">
          <button
            onClick={() => handleToolClick("Overlay")}
            className={`p-2 rounded-md transition duration-200 flex items-center justify-center cursor-pointer ${
              activeTool === "Overlay"
                ? "bg-sky-600 text-white shadow-md shadow-sky-900/40"
                : "text-slate-300 hover:text-slate-100 hover:bg-slate-800"
            }`}
            title="Overlay raster image on top of GIS map"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToolClick("Crop")}
            className={`p-2 rounded-md transition duration-200 flex items-center justify-center cursor-pointer ${
              activeTool === "Crop"
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
            className={`p-2 rounded-md transition duration-200 flex items-center justify-center cursor-pointer ${
              activeTool === "Clip"
                ? "bg-sky-600 text-white shadow-md shadow-sky-900/40"
                : "text-slate-300 hover:text-slate-100 hover:bg-slate-800"
            }`}
            title="Clip sections of raster image"
          >
            <Scissors className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToolClick("Rotate")}
            className={`p-2 rounded-md transition duration-200 flex items-center justify-center cursor-pointer ${
              activeTool === "Rotate"
                ? "bg-sky-600 text-white shadow-md shadow-sky-900/40"
                : "text-slate-300 hover:text-slate-100 hover:bg-slate-800"
            }`}
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
