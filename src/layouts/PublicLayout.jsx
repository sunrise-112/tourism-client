import { Outlet } from "react-router-dom";
import BublicHeader from "../components/Global/BublicHeader.jsx";
import Footer from "../components/Global/Footer";
import LanguageSwitcher from '../common/LanguageSwitcher';

const PublicLayout = () => {
  return (
    <div className='min-h-screen flex flex-col'>
      <BublicHeader />
      <main className='flex-1'>
        <Outlet />
        <LanguageSwitcher/>
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
