import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div>
      <div className="flex min-h-screen flex-col items-center justify-center">

        {/* Responsive container: stacks on small screens, side-by-side on md+ */}
        <div className="flex w-full max-w-5xl flex-col md:flex-row items-center justify-center gap-6 px-4">

          {/* Each box is flexible: grows to fill space, but has a min and max width */}
          <div className="flex-1 min-w-[300px] max-w-[360px] h-64 md:h-80 bg-gray-200 dark:bg-gray-700 rounded-lg shadow flex items-center justify-center">
            <span className="text-lg md:text-xl font-medium">Box 1</span>
          </div>

          <div className="flex-1 min-w-[300px] max-w-[360px] h-64 md:h-80 bg-gray-200 dark:bg-gray-700 rounded-lg shadow flex items-center justify-center">
            <span className="text-lg md:text-xl font-medium">Box 2</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
