import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../app/store";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../features/auth";
import SearchLocation from "./SearchLocation";
import { Link } from "react-router-dom";
import { useState } from "react";

interface HeaderProps {
  onSelectView: (view: "none" | "popularSite" | "routePlanner") => void;
  setSelectedMarker: React.Dispatch<React.SetStateAction<number | null>>;
  resetState: () => void;
}

const Header = ({
  onSelectView,
  setSelectedMarker,
  resetState,
}: HeaderProps) => {
  const user = useSelector((state: RootState) => state.user);
  // console.log(user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem("token");
    setMenuOpen(false);
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <header className="absolute z-5 bg-white right-1/2 transform translate-x-1/2 flex items-center justify-between p-3 mt-2 w-2/3 h-[50px] rounded-full shadow-lg m-auto">
      <h1 className="text-xl font-bold">
        <Link to="/" onClick={() => resetState()}>
          TripMandu
        </Link>
      </h1>
      <div className="mx-1">
        <SearchLocation />
      </div>
      <nav className="flex gap-6">
        {/* <button
          onClick={() => {
            setSelectedMarker(null);
            onSelectView("popularSite");
          }}
          className="shadow-lg rounded-full p-2 text-sm font-medium text-gray-700 hover:text-black  hover:bg-gray-100 hover:underline"
        >
          Popular Sites
        </button> */}
        <Link
          to={"/plan"}
          className="shadow-lg rounded-full p-2  text-sm font-medium text-gray-700 hover:text-black  hover:bg-gray-100 hover:underline"
        >
          Manage Plan
        </Link>
        <button
          onClick={() => {
            setSelectedMarker(null);
            onSelectView("none");
          }}
          className="shadow-lg rounded-full p-2 text-sm font-medium text-gray-700 hover:text-black  hover:bg-gray-100 hover:underline"
        >
          Map
        </button>

        <button
          onClick={() => {
            setSelectedMarker(null);
            onSelectView("routePlanner");
          }}
          className="shadow-lg rounded-full p-2 text-sm font-medium text-gray-700 hover:text-black  hover:bg-gray-100 hover:underline"
        >
          Plan Itinerary
        </button>
      </nav>

      <div className="relative">
        {user?.email ? (
          <div>
            <div
              onClick={() => setMenuOpen((prev) => !prev)}
              className="w-9 h-9 overflow-hidden rounded-full bg-gray-300 flex items-center justify-center cursor-pointer"
            >
              <img
                className="h-full w-full rounded-full"
                src={user.profile}
                alt="profile"
              />
            </div>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-28 bg-white shadow-md rounded-full z-10">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-center rounded-full text-sm hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
