import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import Register from "./pages/Register";
import SignIn from "./pages/SignIn";
import { useEffect } from "react";
import { api } from "./utils/axiosInstance";
import { setUser } from "./features/auth";
import type { AppDispatch } from "./app/store";
import { useDispatch } from "react-redux";
import type { User } from "./types/user";
const App = () => {

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const localHost = async() => {
      const token = localStorage.getItem('token');
      if(!token) return null;
      try {
        const response = await api.get("/user/protected", {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
        
        if(response.data.success) {
          console.log(response?.data?.data);
          const data: User = response?.data?.data;
          dispatch(setUser(data));
        }
      } catch (err:any) {
        console.error(err?.message);
      }
    }
    localHost();
  }, [dispatch]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* Unprotected Route */}
          <Route path="register" element={<Register />} />
          <Route path="login" element={<SignIn />} />

          {/* Protected Route */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
