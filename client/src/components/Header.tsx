import { Link } from "react-router-dom";

interface HeaderProps {
  onSelectView: (view: "none" | "showSites" | "routePlanner") => void;
}

const Header = ({ onSelectView }: HeaderProps) => {
  return (
    <header className="absolute z-50 bg-white right-1/2 transform translate-x-1/2 flex items-center justify-between p-3 mt-2 w-2/3 rounded-full shadow-lg m-auto">
      <h1 className="text-xl font-bold">TripMandu</h1>
      <nav className="flex gap-6">
        <button
          onClick={() => onSelectView("showSites")}
          className="shadow-lg rounded-full p-2 text-sm font-medium text-gray-700 hover:text-black hover:underline"
        >
          Popular Sites
        </button>
        <button
          onClick={() => onSelectView("none")}
          className="shadow-lg rounded-full p-2 text-sm font-medium text-gray-700 hover:text-black hover:underline"
        >
          Map
        </button>

        <button
          onClick={() => {
            onSelectView("routePlanner");
          }}
          className="shadow-lg rounded-full p-2 text-sm font-medium text-gray-700 hover:text-black hover:underline"
        >
          Plan Itinerary
        </button>
      </nav>

      <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center">
        <Link className="w-fit" to="/login">
          SignIn
        </Link>
      </div>
    </header>
  );
};

export default Header;
