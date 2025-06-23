import { useState } from "react";
import type { LoginFrom } from "../types/user";
import { NavLink, useNavigate } from "react-router-dom";
import { LoginFromData } from "../apiHandle/user";
import type { User } from "../types/user";
import { setUser } from "../features/auth";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../app/store";

const SignIn = () => {
  const [loginData, setLoginData] = useState<LoginFrom>({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  //dispatch
  const dispatch = useDispatch<AppDispatch>();

  // Input handling
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await LoginFromData(loginData); // pass loginData here

      if (response?.success) {
        console.log(response);

        const userData: User = response.data.user;
        const token: string = response.data.accessToken;
        console.log(token);

        dispatch(setUser(userData));
        localStorage.setItem("token", token);

        alert(response.message || "Login successful");

        navigate("/");
        setError(null);
      } else {
        setError(response?.message || "Login failed");
      }
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-gray-200 to-gray-100 min-h-screen flex items-center justify-center">
      <div className="w-4/5 md:w-3/5 bg-white shadow-xl p-8 m-8">
        <h2 className="text-xl text-center font-bold text-blue-600">Login</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-gray-700">Email:</label>
            <input
              type="email"
              name="email"
              value={loginData.email}
              onChange={handleInput}
              required
              className="w-full border border-gray-500 px-2 py-2 mt-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Password:</label>
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleInput}
              required
              className="w-full border border-gray-500 px-2 py-2 mt-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 rounded-xl py-2 text-white hover:bg-blue-600 hover:scale-105 transform ease-in duration-75 delay-75 cursor-pointer"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="text-center">
            Don’t have an account?{" "}
            <NavLink to="/register" className="text-blue-700">
              Register
            </NavLink>
          </p>
        </form>
        {error && <p className="text-center text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default SignIn;
