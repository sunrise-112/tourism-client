import { Outlet } from "react-router-dom";
import BublicHeader from "../components/Global/BublicHeader.jsx";
import Footer from "../components/Global/Footer";
import LanguageSwitcher from "../common/LanguageSwitcher";

const PublicLayout = () => {
  return (
    <div className='min-h-screen flex flex-col'>
      <BublicHeader />
      <main className='flex-1'>
        <Outlet />
      </main>
      <Footer />

      {/* Floating language switcher – bottom-left corner */}
      <div className='fixed bottom-6 left-4 z-50'>
        <LanguageSwitcher />
      </div>
    </div>
  );
};

export default PublicLayout;
