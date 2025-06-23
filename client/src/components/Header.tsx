import { Link } from "react-router-dom";

interface HeaderProps {
  onSelectView: (view: "none" | "showSites" | "routePlanner") => void;
}

const Header = ({ onSelectView }: HeaderProps) => {
  return (
    <header className="absolute z-50 bg-white right-1/2 transform translate-x-1/2 flex items-center justify-between p-3 mt-2 w-2/3 border-b rounded-full shadow-sm m-auto">
      <h1 className="text-xl font-bold">TripMandu</h1>
      <nav className="flex gap-6">
        <button
          onClick={() => onSelectView("showSites")}
          className="text-sm font-medium text-gray-700 hover:text-black hover:underline"
        >
          Popular Sites
        </button>
        <button
          onClick={() => onSelectView("none")}
          className="text-sm font-medium text-gray-700 hover:text-black hover:underline"
        >
          Map
        </button>

        <button
          onClick={() => {
            onSelectView("routePlanner");
          }}
          className="text-sm font-medium text-gray-700 hover:text-black hover:underline"
        >
          Plan Itinerary
        </button>
      </nav>

      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
        <Link to="/login">Sign In</Link>
      </div>
    </header>
  );
};

export default Header;
