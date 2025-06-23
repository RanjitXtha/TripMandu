import Header from "./components/Header";
import Footer from "./component/Footer";
import Overlay from "./components/Overlay";
import Home from "./pages/Home";
const Layout = () => {
  return (
    <div className="relative">
      <Header />
      {/* <Overlay /> */}
      <Footer />
      <Home />
    </div>
  );
};

export default Layout;
