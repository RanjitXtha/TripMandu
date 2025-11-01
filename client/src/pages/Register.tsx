import { NavLink } from "react-router-dom";
import type { RegisterForm } from "../types/user";
import React, { useState } from "react";
import { registerFormData } from "../apiHandle/user";
import { useNavigate } from "react-router-dom";

interface FieldErrors {
  fName?: string;
  lName?: string;
  email?: string;
  password?: string;
  profile?: string;
}

const Register = () => {
  const [registerData, setRegisterData] = useState<RegisterForm>({
    fName: "",
    lName: "",
    email: "",
    password: "",
    profile: undefined,
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  // Validate individual field
  const validateField = (name: string, value: string | File | undefined): string => {
    switch (name) {
      case "fName":
        if (!value || (typeof value === "string" && value.trim() === "")) {
          return "First name is required";
        }
        if (typeof value === "string" && value.trim().length < 2) {
          return "First name must be at least 2 characters";
        }
        break;
      case "lName":
        if (!value || (typeof value === "string" && value.trim() === "")) {
          return "Last name is required";
        }
        if (typeof value === "string" && value.trim().length < 2) {
          return "Last name must be at least 2 characters";
        }
        break;
      case "email":
        if (!value || (typeof value === "string" && value.trim() === "")) {
          return "Email is required";
        }
        if (typeof value === "string") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return "Please enter a valid email address";
          }
        }
        break;
      case "password":
        if (!value || (typeof value === "string" && value.trim() === "")) {
          return "Password is required";
        }
        if (typeof value === "string" && value.length < 6) {
          return "Password must be at least 6 characters";
        }
        break;
    }
    return "";
  };

  // Input handling with validation
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({
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

  // File handling with validation
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors((prev) => ({
          ...prev,
          profile: "File size must be less than 5MB",
        }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setFieldErrors((prev) => ({
          ...prev,
          profile: "Please upload an image file",
        }));
        return;
      }

      setRegisterData((prev) => ({
        ...prev,
        profile: file,
      }));
      setFieldErrors((prev) => ({
        ...prev,
        profile: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields
    const errors: FieldErrors = {};
    errors.fName = validateField("fName", registerData.fName);
    errors.lName = validateField("lName", registerData.lName);
    errors.email = validateField("email", registerData.email);
    errors.password = validateField("password", registerData.password);

    // Check if there are any errors
    const hasErrors = Object.values(errors).some((error) => error !== "");
    if (hasErrors) {
      setFieldErrors(errors);
      return;
    }

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
      if (response?.success) {
        alert(response?.message);
        navigate("/login");
        setError(null);
      }
    } catch (err: any) {
      setError(err?.message || "register failed");
    } finally {
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
              className={`w-full border ${
                fieldErrors.fName ? "border-red-500" : "border-gray-500"
              } px-2 py-2 mt-2
                    rounded-sm focus:outline-none focus:ring-2 ${
                      fieldErrors.fName
                        ? "focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
            />
            {fieldErrors.fName && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.fName}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-700">Last Name:</label>
            <input
              type="text"
              name="lName"
              value={registerData.lName}
              onChange={handleInput}
              className={`w-full border ${
                fieldErrors.lName ? "border-red-500" : "border-gray-500"
              } px-2 py-2 mt-2
                    rounded-sm focus:outline-none focus:ring-2 ${
                      fieldErrors.lName
                        ? "focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
            />
            {fieldErrors.lName && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.lName}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-700">Email:</label>
            <input
              type="email"
              name="email"
              value={registerData.email}
              onChange={handleInput}
              className={`w-full border ${
                fieldErrors.email ? "border-red-500" : "border-gray-500"
              } px-2 py-2 mt-2
                    rounded-sm focus:outline-none focus:ring-2 ${
                      fieldErrors.email
                        ? "focus:ring-red-500"
                        : "focus:ring-blue-500"
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
              value={registerData.password}
              onChange={handleInput}
              className={`w-full border ${
                fieldErrors.password ? "border-red-500" : "border-gray-500"
              } px-2 py-2 mt-2
                    rounded-sm focus:outline-none focus:ring-2 ${
                      fieldErrors.password
                        ? "focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-700">Profile:</label>
            <input
              type="file"
              name="profile"
              accept="image/*"
              onChange={handleFile}
              className={`w-full border ${
                fieldErrors.profile ? "border-red-500" : "border-gray-500"
              } px-2 py-2 mt-2 rounded-sm focus:outline-none focus:ring-2 ${
                fieldErrors.profile
                  ? "focus:ring-red-500"
                  : "focus:ring-blue-500"
              }`}
            />
            {fieldErrors.profile && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.profile}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full  bg-blue-500 rounded-xl py-2 text-white hover:bg-blue-600
           hover:scale-105 transform ease-in duration-75 delay-75
            cursor-pointer disabled:bg-blue-300 disabled:cursor-not-allowed"
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
        {error && <p className="text-center text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default Register;