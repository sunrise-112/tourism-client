import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Global/SideBar";
import Header from "../components/Global/Header";
import userService from "../services/userService";

export default ({ children, allowedRole }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const fetchedUser = await userService.getMe();
      if (!fetchedUser) return navigate("/login");
      if (fetchedUser.role !== allowedRole) return navigate("/not-authorized");
      setUser(fetchedUser);
    };
    fetchUser();
  }, []);

  return (
    <div className='min-h-screen bg-base-200 flex'>
      <Sidebar user={user} isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isOpen ? "lg:ml-64" : "lg:ml-16"
        }`}
      >
        <Header isOpen={isOpen} setIsOpen={setIsOpen} />
        <main className='flex-1 p-4 md:p-6 overflow-auto'>{children}</main>
      </div>
    </div>
  );
};
