import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Overlay from "ol/Overlay";
import { fromLonLat, toLonLat } from "ol/proj";
import { parseCoordinates } from "../lib/searchParser";
import { Search, Globe2 } from "lucide-react";

import { Pin } from "./MainDashboard";

interface MapPaneProps {
  pins: Pin[];
  isAddCoordinatesActive: boolean;
  onAddMapPin: (coords: [number, number]) => void;
  onDeletePin: (id: string) => void;
}

export function MapPane({ pins, isAddCoordinatesActive, onAddMapPin, onDeletePin }: MapPaneProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const activeRef = useRef(isAddCoordinatesActive);
  const onAddMapPinRef = useRef(onAddMapPin);

  useEffect(() => {
    activeRef.current = isAddCoordinatesActive;
    onAddMapPinRef.current = onAddMapPin;
  }, [isAddCoordinatesActive, onAddMapPin]);

  useEffect(() => {
    if (!mapElement.current || mapInstance.current) return;

    // Initialize map
    const map = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([9.0, 45.0]), // Longitude, Latitude order for OpenLayers
        zoom: 4,
      }),
      controls: [], // Hide default controls for custom styling
    });

    map.on('singleclick', (e) => {
      if (activeRef.current) {
        const coords = toLonLat(e.coordinate);
        onAddMapPinRef.current([coords[0], coords[1]]);
      }
    });

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    map.getOverlays().clear();

    pins.forEach((pin, index) => {
      if (pin.mapCoords) {
        const el = document.createElement("div");
        el.className = "w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white cursor-pointer select-none z-50 transition-transform hover:scale-110";
        el.innerText = (index + 1).toString();

        el.oncontextmenu = (e) => {
          e.preventDefault();
          e.stopPropagation();
          onDeletePin(pin.id);
        };

        const overlay = new Overlay({
          position: fromLonLat(pin.mapCoords),
          positioning: "center-center",
          element: el,
          stopEvent: true,
        });
        map.addOverlay(overlay);
      }
    });
  }, [pins, onDeletePin]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const coords = parseCoordinates(searchQuery);
    if (!coords) {
      setError("Invalid coordinates. Format: 'lat, lon' (e.g. 45.0, 9.0)");
      return;
    }

    if (mapInstance.current) {
      const view = mapInstance.current.getView();
      // OpenLayers uses [lon, lat] for fromLonLat
      view.animate({
        center: fromLonLat([coords.lon, coords.lat]),
        zoom: 12,
        duration: 1000,
      });
    }
  };

  const handleZoomIn = () => {
    if (mapInstance.current) {
      const view = mapInstance.current.getView();
      const currentZoom = view.getZoom() ?? 4;
      view.animate({
        zoom: currentZoom + 1,
        duration: 250,
      });
    }
  };

  const handleZoomOut = () => {
    if (mapInstance.current) {
      const view = mapInstance.current.getView();
      const currentZoom = view.getZoom() ?? 4;
      view.animate({
        zoom: currentZoom - 1,
        duration: 250,
      });
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Map Target */}
      <div ref={mapElement} className="flex-1 w-full h-full" />

      {/* Floating Controls Top Left */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-sm pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* World/Public Map Button */}
          <button className="flex items-center justify-center p-2 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-800 hover:bg-slate-800 text-slate-100 shadow-lg cursor-pointer transition duration-200" title="World Map">
            <Globe2 className="w-4 h-4" />
          </button>
          
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-lg shadow-lg w-64"
          >
            <div className="flex-1 flex items-center px-2 gap-2 text-slate-400">
              <input
                type="text"
                placeholder="Search 'lat, lon'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 outline-none text-xs text-slate-100 placeholder-slate-500 w-full focus:ring-0 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center p-1.5 rounded-md hover:bg-slate-800 text-slate-100 transition duration-200 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-950/90 backdrop-blur-sm border border-red-900/50 text-red-200 text-[10px] px-3 py-1.5 rounded-md shadow-md pointer-events-auto w-fit">
            {error}
          </div>
        )}
      </div>

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

      {/* Bottom status indicator */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 border border-slate-800 rounded-md text-[10px] text-slate-400 font-mono flex items-center gap-1.5 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>GIS Map View (OSM)</span>
      </div>
    </div>
  );
}
