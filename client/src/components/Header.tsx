import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import type { RootState } from "../app/store";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../features/auth";
import { Map, MapPin, Navigation, LogOut, User, Notebook } from "lucide-react";
import { Link } from "react-router-dom";

interface HeaderProps {
  onSelectView: (view: "none" | "popularSite" | "routePlanner" | "planner") => void;
  setSelectedMarker: React.Dispatch<React.SetStateAction<number | null>>;
}

const Header = ({ onSelectView, setSelectedMarker }: HeaderProps) => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<"none" | "popularSite" | "routePlanner" | "planner">("none");

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem("token");
    setMenuOpen(false);
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleViewChange = (view: "none" | "popularSite" | "routePlanner" | "planner") => {
    setSelectedMarker(null);
    onSelectView(view);
    setActiveView(view);
  };

  return (
    <header className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-4xl px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <button onClick={()=>{
          setActiveView("none")
          navigate("/")
        }} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Map className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">TripMandu</h1>
        </button>

        {/* Navigation */}
        <nav className="flex items-center gap-2">

          <button
            onClick={() => handleViewChange("planner")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeView === "planner"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <Notebook size={16} />
            <span>View Plans</span>
          </button>
          <button
            onClick={() => handleViewChange("popularSite")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeView === "popularSite"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <MapPin size={16} />
            <span>Sites</span>
          </button>
          <button
            onClick={() => handleViewChange("none")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeView === "none"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <Map size={16} />
            <span>Map</span>
          </button>
          <button
            onClick={() => handleViewChange("routePlanner")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeView === "routePlanner"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <Navigation size={16} />
            <span>Plan Route</span>
          </button>
        </nav>

        {/* User Menu */}
        <div className="relative">
          {user?.email ? (
            <div>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition overflow-hidden border-2 border-gray-300 flex items-center justify-center"
              >
                {user.profile ? (
                  <img
                    className="w-full h-full object-cover"
                    src={user.profile}
                    alt="Profile"
                  />
                ) : (
                  <User size={20} className="text-gray-600" />
                )}
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl border border-gray-200 z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;