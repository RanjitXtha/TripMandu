import { NavLink } from "react-router-dom";
import type { RootState } from "../app/store";
import { useSelector } from "react-redux";
const Navbar = () => {
  const user = useSelector((state: RootState) => state.user);
  console.log(user);
  return (
    <div className="flex justify-between bg-gray-300">
      {/* logo and title section */}
      <div></div>
      {/* link section for route */}
      <div></div>
      {/* login sigin up */}
      <div className="p-4 flex gap-2">
        <div>
            <NavLink to="/login">Sign In</NavLink>
        </div>
        <div>
            <NavLink to="/register">Register</NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
