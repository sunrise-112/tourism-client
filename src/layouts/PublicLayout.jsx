import { Outlet } from "react-router-dom";
import BublicHeader from "../components/Global/BublicHeader.jsx";
import Footer from "../components/Global/Footer";
import LanguageSwitcher from "../common/LanguageSwitcher";
import FloatingWhatsApp from "../common/FloatingWhatsApp.jsx";
import { useState } from "react";
import settingsService from "../services/adminSettings.jsx";
import { process } from "joi-browser";

const PublicLayout = () => {
  const [phoneNumber, setPhoneNumber] = useState(null);

  const fetchSettings = async () => {
    const data = await settingsService.get();
    setPhoneNumber(data?.company_phone);
  };

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
      <FloatingWhatsApp
        phoneNumber={phoneNumber}
        message={`Hi ${import.meta.env.VITE_COMPANY} I'm interested in one of your tours, can I get more info please?`}
      />
    </div>
  );
};

export default PublicLayout;
