import { useState } from "react";
import type { LoginFrom } from "../types/user";
import { NavLink, useNavigate } from "react-router-dom";
import { LoginFromData } from "../apiHandle/user";
import type { User } from "../types/user";
import { setUser } from "../features/auth";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../app/store";

interface FieldErrors {
  email?: string;
  password?: string;
}

const SignIn = () => {
  const [loginData, setLoginData] = useState<LoginFrom>({
    email: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  //dispatch
  const dispatch = useDispatch<AppDispatch>();

  // Validate individual field
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "email":
        if (!value || value.trim() === "") {
          return "Email is required";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Please enter a valid email address";
        }
        break;
      case "password":
        if (!value || value.trim() === "") {
          return "Password is required";
        }
        if (value.length < 6) {
          return "Password must be at least 6 characters";
        }
        break;
    }
    return "";
  };

  // Input handling with validation
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    const error = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields
    const errors: FieldErrors = {};
    errors.email = validateField("email", loginData.email);
    errors.password = validateField("password", loginData.password);

    // Check if there are any errors
    const hasErrors = Object.values(errors).some((error) => error !== "");
    if (hasErrors) {
      setFieldErrors(errors);
      return;
    }

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
        console.log(response);
        setError(response?.message || "Login failed");
      }
    } catch (err: any) {
      console.log(err);
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
              className={`w-full border ${
                fieldErrors.email ? "border-red-500" : "border-gray-500"
              } px-2 py-2 mt-2 rounded-sm focus:outline-none focus:ring-2 ${
                fieldErrors.email ? "focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-700">Password:</label>
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleInput}
              className={`w-full border ${
                fieldErrors.password ? "border-red-500" : "border-gray-500"
              } px-2 py-2 mt-2 rounded-sm focus:outline-none focus:ring-2 ${
                fieldErrors.password
                  ? "focus:ring-red-500"
                  : "focus:ring-blue-500"
              }`}
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 rounded-xl py-2 text-white hover:bg-blue-600 hover:scale-105 transform ease-in duration-75 delay-75 cursor-pointer disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="text-center">
            Don't have an account?{" "}
            <NavLink to="/register" className="text-blue-700">
              Register
            </NavLink>
          </p>
        </form>
        {error && <p className="text-center text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default SignIn;