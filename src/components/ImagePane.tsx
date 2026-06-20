import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";
import Projection from "ol/proj/Projection";
import { getCenter } from "ol/extent";
import { Layers, Crop, Scissors, RotateCw, Info, Upload, Lock } from "lucide-react";

export function ImagePane() {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!mapElement.current || mapInstance.current) return;

    // Extent of the raster scan map (1200x896 pixels)
    const imageExtent = [0, 0, 1200, 896];
    const projection = new Projection({
      code: "raster-image",
      units: "pixels",
      extent: imageExtent,
    });

    const map = new Map({
      target: mapElement.current,
      layers: [
        new ImageLayer({
          source: new Static({
            url: "/ed-259-xcrI6CPkkJs-unsplash.jpg",
            projection: projection,
            imageExtent: imageExtent,
          }),
        }),
      ],
      view: new View({
        projection: projection,
        center: getCenter(imageExtent),
        zoom: 2,
        maxZoom: 6,
        minZoom: 1,
      }),
      controls: [], // Hide default controls for custom styling
    });

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, []);

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

  const tools = [
    { name: "Overlay", icon: Layers, desc: "Overlay raster image on top of GIS map" },
    { name: "Crop", icon: Crop, desc: "Crop boundaries of raster image" },
    { name: "Clip", icon: Scissors, desc: "Clip sections of raster image" },
    { name: "Rotate", icon: RotateCw, desc: "Rotate raster scan" },
  ];

  return (
    <div className="relative w-full h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Map Target */}
      <div ref={mapElement} className="flex-1 w-full h-full" />

      {/* Floating Toolbar Top Middle */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-1 rounded-lg shadow-lg">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.name;
            return (
              <button
                key={tool.name}
                onClick={() => handleToolClick(tool.name)}
                className={`p-2 rounded-md transition duration-200 flex items-center justify-center cursor-pointer ${
                  isActive
                    ? "bg-sky-600 text-white shadow-md shadow-sky-900/40"
                    : "text-slate-300 hover:text-slate-100 hover:bg-slate-800"
                }`}
                title={tool.desc}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Info Message Feedback */}
      {message && (
        <div className="absolute bottom-16 left-4 z-10 bg-slate-950/90 backdrop-blur-md border border-sky-900/30 text-sky-200 text-[10px] px-2.5 py-1.5 rounded-md shadow-md flex items-center gap-1.5 transition-all duration-300 animate-fade-in">
          <Info className="w-3 h-3 text-sky-400" />
          <span>{message}</span>
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
        <button
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
