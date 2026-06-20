import { MapPane } from "./MapPane";
import { ImagePane } from "./ImagePane";

export function MainDashboard() {
  return (
    <div className="flex-1 w-full h-full flex flex-col min-h-0">
      {/* Main split grid layout */}
      <div className="flex-1 flex flex-row w-full h-full min-h-0 bg-slate-950">
        {/* Geographic Map View Container */}
        <div className="w-1/2 h-full relative">
          <MapPane />
        </div>

        {/* Source Image View Container */}
        <div className="w-1/2 h-full relative border-l border-slate-900">
          <ImagePane />
        </div>
      </div>
    </div>
  );
}
