import { Outlet } from "react-router-dom";
import BublicHeader from "../components/Global/BublicHeader.jsx";
import Footer from "../components/Global/Footer";

const PublicLayout = () => {
  return (
    <div className='min-h-screen flex flex-col'>
      <BublicHeader />
      <main className='flex-1'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
