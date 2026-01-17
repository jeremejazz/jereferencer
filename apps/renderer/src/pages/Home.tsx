import OpenLayersMap from "@/components/maps/openlayers";
import { Button } from "@/components/ui/button";
import { Folder, Layers, ZoomIn, ZoomOut } from 'lucide-react';

const Home = () => {
  return (
    <div>
      <div className="flex min-h-screen flex-col mt-5">

        {/* Responsive container: stacks on small screens, side-by-side on md+ */}
        <div className="flex w-full flex-col md:flex-row md:flex-nowrap items-center justify-center gap-10 px-4 overflow-x-auto md:overflow-x-visible">

          {/* Map 1 with button ribbon on top */}
          <div className="flex flex-col flex-1 shrink-0 min-w-[300px] max-w-[800px] h-96 md:h-[40rem] bg-gray-200 dark:bg-gray-700 rounded-lg shadow overflow-hidden">
            {/* Button ribbon/toolbar */}
            <div className="flex gap-2 p-2 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
              <Button variant="outline" size="icon">
                <Folder className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Layers className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
            {/* Map fills remaining space */}
            <div className="flex-1 w-full">
              <OpenLayersMap />
            </div>
          </div>

          {/* Map 2 with button ribbon on top */}
          <div className="flex flex-col flex-1 shrink-0 min-w-[300px] max-w-[800px] h-96 md:h-[40rem] bg-gray-200 dark:bg-gray-700 rounded-lg shadow overflow-hidden">
            {/* Button ribbon/toolbar */}
            <div className="flex gap-2 p-2 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
              <Button variant="outline" size="icon">
                <Folder className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Layers className="h-4 w-4" />
              </Button>
            </div>
            {/* Map fills remaining space */}
            <div className="flex-1 w-full">
              <OpenLayersMap />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
