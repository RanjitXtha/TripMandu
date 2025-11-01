import { NavLink } from "react-router-dom";
import type { RegisterForm } from "../types/user";
import React, { useState } from "react";
import { registerFormData } from "../apiHandle/user";
import { useNavigate } from "react-router-dom";



const Register = () => {
  const [registerData, setRegisterData] = useState<RegisterForm>({
    fName: "",
    lName: "",
    email: "",
    password: "",
    profile: undefined,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  // Input handaling
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //   file handling
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRegisterData((prev) => ({
        ...prev,
        profile: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let formData = new FormData();

    Object.entries(registerData).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value.toString());
      }
    });

    try {
        const response = await registerFormData(formData);
        console.log(response);
        if(response?.success) {
            alert(response?.message);
            navigate("/login");
            setError(null);
        }

    } catch (err: any) {
        setError(err?.message || "register failed");

    }finally {
        setLoading(false);
    }
  };

  return (
    <div
      className="w-full bg-gradient-to-r from-gray-200 to-gray-100 min-h-screen
    flex items-center justify-center"
    >
      <div className="w-4/5 md:w-3/5 bg-white shadow-xl p-8 m-8">
        <h2 className="text-xl text-center font-bold text-blue-600">
          Register
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-gray-700">First Name:</label>
            <input
              type="text"
              name="fName"
              value={registerData.fName}
              onChange={handleInput}
              required
              className="w-full border border-gray-500 px-2 py-2 mt-2
                    rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Last Name:</label>
            <input
              type="text"
              name="lName"
              value={registerData.lName}
              onChange={handleInput}
              required
              className="w-full border border-gray-500 px-2 py-2 mt-2
                    rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Email:</label>
            <input
              type="email"
              name="email"
              value={registerData.email}
              onChange={handleInput}
              required
              className="w-full border border-gray-500 px-2 py-2 mt-2
                    rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Password:</label>
            <input
              type="password"
              name="password"
              value={registerData.password}
              onChange={handleInput}
              required
              className="w-full border border-gray-500 px-2 py-2 mt-2
                    rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-700">Profile:</label>
            <input
              type="file"
              name="profile"
              accept="image/*"
              onChange={handleFile}
              className="w-full border border-gray-500 px-2 py-2 mt-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full  bg-blue-500 rounded-xl py-2 text-white hover:bg-blue-600
           hover:scale-105 transform ease-in duration-75 delay-75
            cursor-pointer"
          >
           {loading ? "Registering..." : "Register"}
          </button>
          <p className="text-center">
            Already have account?{" "}
            <NavLink to="/login" className="text-blue-700">
              Login
            </NavLink>
          </p>
        </form>
        {error && <p className="text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default Register;