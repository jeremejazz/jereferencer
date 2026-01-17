

import 'ol/ol.css';
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { useEffect, useRef } from "react";

const OpenLayersMap = () => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (mapElement.current && !mapRef.current) {
      mapRef.current = new Map({
        target: mapElement.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
      });
    }
  }, []);

  return <div ref={mapElement} style={{ width: "100%", height: "600px" }} />;
};

export default OpenLayersMap;