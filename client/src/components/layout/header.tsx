import { ModeToggle } from "../mode-toggle";

const Header = () => {
  return (
    <header className="w-full p-4 bg-gray-200 dark:bg-gray-800">
      <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
        Jereferencer
      </h1>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
    </header>
  );
};

export default Header;