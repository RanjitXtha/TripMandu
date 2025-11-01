import { useState } from "react";
import type { LoginFrom } from "../types/user";
import { Link, NavLink, useNavigate } from "react-router-dom";
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!loginData.email.trim()) errors.email = "Email is required";
    else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(loginData.email))
      errors.email = "Invalid email format";

    if (!loginData.password.trim()) errors.password = "Password is required";
    else if (loginData.password.length < 8)
      errors.password = "Password must be at least 8 characters";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);

    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await LoginFromData(loginData);

      if (response?.success) {
        const userData: User = response.data.user;
        const token: string = response.data.accessToken;

        dispatch(setUser(userData));
        localStorage.setItem("token", token);

        alert(response.message || "Login successful");
        navigate("/");
      }
    } catch (err: any) {
      if (err.status === 404) setError("User not found");
    
      else if (err.status === 403) setError("Incorrect password");
      else setError(err?.message || "Login failed");
        console.log("error:", err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (name: string, value: string) =>
    `w-full border px-2 py-2 mt-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      submitted && (fieldErrors[name] || value.trim() === "")
        ? "border-red-500"
        : "border-gray-500"
    }`;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 w-full bg-gradient-to-r from-gray-400 to-gray-100 items-center justify-center">
        <div className="w-3/5 md:w-3/5 bg-white shadow-xl p-8 m-4 rounded-3xl">
          <h2 className="text-xl text-center font-bold text-blue-600">Login</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="text-sm text-gray-700">Email:</label>
              <input
                id="email"
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleInput}
                className={inputClass("email", loginData.email)}
              />
              {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="text-sm text-gray-700">Password:</label>
              <input
                id="password"
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleInput}
                className={inputClass("password", loginData.password)}
              />
              {fieldErrors.password && <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 rounded-xl py-2 text-white hover:bg-blue-600 hover:scale-105 transform ease-in duration-75 delay-75 cursor-pointer"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-center">
              Don&apos;t have an account? <NavLink to="/register" className="text-blue-700">Register</NavLink>
            </p>
            <p className="text-center">
              Or, <Link to="/" className="hover:underline text-blue-500 italic">visit map</Link> without logging in.
            </p>
          </form>

          {error && <p className="text-center text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
