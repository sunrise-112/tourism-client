import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import userService from "../../services/userService";

const Header = ({ isOpen = false, setIsOpen }) => {
  const [user, setUser] = useState({});

  const handleIsOpen = (state) => {
    localStorage.setItem("checked", state);
    setIsOpen(state);
  };

  const fetchUser = async () => {
    const user = await userService.getMe();
    setUser(user);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className='w-full flex items-center justify-between px-5 py-3 bg-base-100 shadow-sm border-b border-base-200'>
      {/* Left — Logo (desktop) + Hamburger (mobile) */}
      <div className='flex items-center gap-3'>
        {/* Hamburger — mobile only */}
        <button
          className='btn btn-sm btn-ghost btn-square lg:hidden'
          onClick={() => handleIsOpen(!isOpen)}
        >
          <i
            className={`fa ${
              isOpen ? "fa-times" : "fa-bars"
            } text-base-content text-base`}
          />
        </button>

        {/* Logo — desktop only */}
        <Link
          to='/'
          className='hidden lg:flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent select-none'
        >
          <i className='fa fa-globe text-accent text-xl' />
          {import.meta.env.VITE_COMPANY}
        </Link>
      </div>

      {/* Center — Page title / breadcrumb (mobile) */}
      <div className='lg:hidden text-sm font-semibold text-base-content/70 truncate max-w-[160px]'>
        {import.meta.env.VITE_COMPANY}
      </div>

      {/* Right — Notifications + User */}
      <div className='flex items-center gap-3'>
        {/* Notifications */}

        {/* Divider */}
        <div className='w-px h-6 bg-base-300' />

        {/* User info + Avatar */}
        <Link
          to='/profile/me'
          className='flex items-center gap-2.5 group'
          title='View profile'
        >
          {/* Name + Role */}
          <div className='hidden sm:flex flex-col items-end leading-tight'>
            <span className='text-sm font-medium text-base-content group-hover:text-accent transition-colors'>
              {user.name}
            </span>
            <span className='text-xs text-base-content/50 capitalize'>
              {user.role}
            </span>
          </div>

          {/* Avatar */}
          <div className='avatar'>
            <div className='w-9 rounded-full ring-2 ring-accent ring-offset-2 ring-offset-base-100 group-hover:scale-105 transition-transform'>
              <img
                src={`${import.meta.env.VITE_BACK_END_URL}${user.avatar}`}
                alt='profile'
              />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Header;
