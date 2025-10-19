import OpenLayersMap from "@/components/maps/openlayers";

const Home = () => {
  return (
    <div>
      <div className="flex min-h-screen flex-col items-center justify-center">

        {/* Responsive container: stacks on small screens, side-by-side on md+ */}
  <div className="flex w-full max-w-7xl flex-col md:flex-row md:flex-nowrap items-center justify-center gap-10 px-4 overflow-x-auto md:overflow-x-visible">

 
          <div className="flex-1 shrink-0 min-w-[300px] max-w-[800px] h-64 md:h-80 bg-gray-200 dark:bg-gray-700 rounded-lg shadow flex items-center justify-center">
              <OpenLayersMap />
          </div>

          <div className="flex-1 shrink-0 min-w-[300px] max-w-[800px] h-64 md:h-80 bg-gray-200 dark:bg-gray-700 rounded-lg shadow flex items-center justify-center">
         
              <OpenLayersMap />
 
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
