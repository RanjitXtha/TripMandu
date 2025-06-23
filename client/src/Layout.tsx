import Header from "./components/Header";
import Footer from "./components/Footer";
import Overlay from "./components/Overlay";
const Layout = () => {
  return (
    <div className="relative">
      <Header />
      <Overlay />
      <Footer />
     
    </div>
  );
};

export default Layout;
