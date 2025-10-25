import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import SignIn from "./pages/SignIn";
import { useEffect } from "react";
import { api } from "./utils/axiosInstance";
import { setUser } from "./features/auth";
import type { AppDispatch } from "./app/store";
import { useDispatch } from "react-redux";
import type { User } from "./types/user";
import Home from "./pages/Home";
import ManageYourPlan from "./pages/ManageYourPlan";
import ProtectedRoute from "./components/ProtectedRoute";
import SinglePlan from "./pages/SinglePlan";
const App = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const localHost = async () => {
      const token = localStorage.getItem("token");
      if (!token) return null;
      try {
        const response = await api.get("/user/protected", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          console.log(response?.data?.data);
          const data: User = response?.data?.data;
          dispatch(setUser(data));
        }
      } catch (err: any) {
        console.error(err?.message);
      }
    };
    localHost();
  }, [dispatch]);
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        {/* Unprotected Route */}
        <Route path="register" element={<Register />} />
        <Route path="login" element={<SignIn />} />
               <Route
          path="/plan"
          element={
            <ProtectedRoute>
              <ManageYourPlan />
            </ProtectedRoute>
          }
        />


         <Route
          path="/plan/:id"
          element={
            <ProtectedRoute>
              <SinglePlan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/:id"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        {/* Protected Route */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;