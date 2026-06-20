import { useState } from "react";
import { MapPane } from "./MapPane";
import { ImagePane } from "./ImagePane";

export interface Pin {
  id: string;
  imageCoords: [number, number] | null;
  mapCoords: [number, number] | null;
}

export function MainDashboard() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [isAddCoordinatesActive, setIsAddCoordinatesActive] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<[number, number] | null>(null);

  const handleToggleAddCoordinates = () => {
    if (isAddCoordinatesActive) {
      const hasUnpaired = pins.some(p => !p.imageCoords || !p.mapCoords);
      if (hasUnpaired) {
        setValidationMessage("Cannot deactivate: Unequal coordinate pins.");
        setTimeout(() => setValidationMessage(null), 3000);
        return;
      }
    }
    setIsAddCoordinatesActive(!isAddCoordinatesActive);
  };

  const handleAddImagePin = (coords: [number, number]) => {
    setPins(prev => {
      const unpairedIdx = prev.findIndex(p => !p.imageCoords);
      if (unpairedIdx >= 0) {
        const next = [...prev];
        next[unpairedIdx] = { ...next[unpairedIdx], imageCoords: coords };
        return next;
      }
      return [...prev, { id: String(Date.now()), imageCoords: coords, mapCoords: null }];
    });
  };

  const handleAddMapPin = (coords: [number, number]) => {
    setPins(prev => {
      const unpairedIdx = prev.findIndex(p => !p.mapCoords);
      if (unpairedIdx >= 0) {
        const next = [...prev];
        next[unpairedIdx] = { ...next[unpairedIdx], mapCoords: coords };
        return next;
      }
      return [...prev, { id: String(Date.now()), imageCoords: null, mapCoords: coords }];
    });
  };

  const handleDeletePin = (id: string) => {
    setPins(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col min-h-0">
      <div className="flex-1 flex flex-row w-full h-full min-h-0 bg-slate-950">
        <div className="w-1/2 h-full relative">
          <MapPane 
            pins={pins}
            isAddCoordinatesActive={isAddCoordinatesActive}
            onAddMapPin={handleAddMapPin}
            onDeletePin={handleDeletePin}
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
            setUploadedImageUrl={setUploadedImageUrl}
            imageDimensions={imageDimensions}
            setImageDimensions={setImageDimensions}
          />
        </div>
      </div>
    </div>
  );
}
