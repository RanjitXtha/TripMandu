import Header from "./components/Header";
import Footer from "./component/Footer";
import Overlay from "./components/Overlay";
import Home from "./pages/Home";
import { Outlet } from "react-router-dom";
const Layout = () => {
  return (
    <div className="relative">
      <Header />
      <main>
{/* <Overlay /> */}
       <Outlet />
      </main>
      
      <Footer />
     
    </div>
  );
};

export default Layout;
