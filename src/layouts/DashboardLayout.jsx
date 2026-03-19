import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Global/SideBar";
import Header from "../components/Global/Header";
import userService from "../services/userService";

export default ({ children, allowedRole = [] }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const fetchedUser = await userService.getMe();
      if (!fetchedUser) return navigate("/login");
      if (!allowedRole.includes(fetchedUser.role))
        return navigate("/not-authorized");
      setUser(fetchedUser);
    };
    fetchUser();
  }, []);

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = mobileOpen ? 0 : collapsed ? 72 : 256;

  return (
    <div
      className='min-h-screen bg-stone-100 flex'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        user={user}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Right side — header + content */}
      <div className='flex flex-col flex-1 min-w-0 transition-all duration-300'>
        {/* Header */}
        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          collapsed={collapsed}
        />

        {/* Page content */}
        <main className='flex-1 p-4 md:p-6 overflow-auto lg:ml-60 md:ml-0 sm:ml-0'>
          {children}
        </main>
      </div>
    </div>
  );
};
