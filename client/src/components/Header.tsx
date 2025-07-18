import { useSelector } from "react-redux";
//import { Link } from "react-router-dom";
import type { RootState } from "../app/store";

interface HeaderProps {
  onSelectView: (view: "none" | "popularSite" | "routePlanner") => void;
  setSelectedMarker: React.Dispatch<React.SetStateAction<number | null>>;
}

const Header = ({ onSelectView, setSelectedMarker }: HeaderProps) => {
  const user = useSelector((state: RootState) => state.user);
  // console.log(user);
  return (
    <header className="absolute z-5 bg-white right-1/2 transform translate-x-1/2 flex items-center justify-between p-3 mt-2 w-2/3 h-[50px] rounded-full shadow-lg m-auto">
      <h1 className="text-xl font-bold">TripMandu</h1>
      <nav className="flex gap-6">
        <button
          onClick={() => {
            setSelectedMarker(null);
            onSelectView("popularSite");
          }}
          className="shadow-lg rounded-full p-2 text-sm font-medium text-gray-700 hover:text-black hover:underline"
        >
          Popular Sites
        </button>
        <button
          onClick={() => {
            setSelectedMarker(null);
            onSelectView("none");
          }}
          className="shadow-lg rounded-full p-2 text-sm font-medium text-gray-700 hover:text-black hover:underline"
        >
          Map
        </button>

        <button
          onClick={() => {
            setSelectedMarker(null);
            onSelectView("routePlanner");
          }}
          className="shadow-lg rounded-full p-2 text-sm font-medium text-gray-700 hover:text-black hover:underline"
        >
          Plan Itinerary
        </button>
      </nav>

      <div className="w-9 h-9 overflow-hidden rounded-full bg-gray-300 flex items-center justify-center">
        <img
          className="h-full w-full rounded-full "
          src={user.profile}
          alt="profile"
        />
      </div>
    </header>
  );
};

export default Header;
