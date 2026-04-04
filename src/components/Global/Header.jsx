import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

// Services
import userService from "../../services/userService";
import notificationService from "../../services/notificationService";

// Utils
import renderImage from "../../utils/renderImage";
import playNotificationSound from "../../utils/playNotificationSound";

// Hooks
import useSocketEvent from "../../hooks/useSocketEvent";

// Context
import { useSocket } from "../../context/SocketContext";
import role from "../../constants/role";

const Header = ({
  isOpen = false,
  setIsOpen,
  mobileOpen,
  setMobileOpen,
  collapsed,
}) => {
  const socket = useSocket();
  const [searchParam, setSearchParam] = useSearchParams();
  const [user, setUser] = useState({});
  const [dropOpen, setDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const dropRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const events = ["booking_created", "ad_created"];
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notify.mp3");
    audioRef.current.volume = 0.8;
  }, []);

  const handleIsOpen = (state) => {
    localStorage.setItem("checked", state);
    setIsOpen(state);
    if (setMobileOpen) setMobileOpen(state);
  };

  const fetchUser = async () => {
    const fetchedUser = await userService.getMe();
    setUser(fetchedUser);
    console.log("Fetched User: ", fetchedUser);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const notifs = await notificationService.getAll();
        console.log("Notifs: ", notifs?.data);
        setNotifs(notifs?.data);
      } catch (error) {
        console.log("Error: ", error);
      }
    };

    fetchNotifs();
  }, []);

  events.forEach((event) => {
    useSocketEvent(event, (data) => {
      setNotifs((prev) => [data, ...prev]);
      playNotificationSound(audioRef);
    });
  });

  return (
    <div
      className={`w-auto h-16 z-20 bg-white border-b border-stone-100 shadow-sm flex items-center px-4 gap-3 transition-all duration-300 lg:ml-60 md:ml-0 sm:ml-0`}
    >
      {/* Hamburger — mobile only */}
      <button
        className='lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors text-stone-500 shrink-0'
        onClick={() => handleIsOpen(!isOpen)}
      >
        <i className={`fa ${mobileOpen ? "fa-times" : "fa-bars"} text-sm`} />
      </button>

      {/* Logo — mobile center */}
      <div className='lg:hidden flex-1 flex justify-center'>
        <span
          className='text-sm font-black text-stone-800 truncate max-w-[160px]'
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {import.meta.env.VITE_COMPANY}
        </span>
      </div>

      {/* Breadcrumb — desktop only */}
      <div className='hidden lg:flex items-center gap-2 text-sm'>
        <i className='fa fa-chevron-right text-stone-300 text-[10px]' />
        <span className='font-semibold text-stone-700'>Dashboard</span>
      </div>

      <div className='flex-1 hidden lg:block' />

      {/* Search — desktop */}
      <div className='hidden md:flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 w-48'>
        <i className='fa fa-search text-stone-300 text-xs' />
        <input
          placeholder='Quick search...'
          onChange={(e) => {
            setSearchParam({ q: e.currentTarget.value });
          }}
          className='bg-transparent text-xs outline-none text-stone-500 placeholder-stone-300 w-full'
        />
      </div>

      {/* Notifications */}
      <div ref={notifRef} className='relative shrink-0'>
        <button
          onClick={() => {
            setNotifOpen((o) => !o);
            setDropOpen(false);
          }}
          className='relative cursor-pointer w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors'
        >
          <i className='fa fa-bell text-sm' />
          {notifs?.filter((n) => !n.is_read).length > 0 && (
            <span className='absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-400 rounded-full text-[10px] font-bold text-white flex items-center justify-center leading-none'>
              {notifs.filter((n) => !n.is_read).length}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className='absolute right-0 top-12 w-72 bg-white rounded-2xl border border-stone-100 shadow-2xl shadow-stone-300/30 overflow-hidden z-50'>
            <div className='px-4 py-3 border-b border-stone-100 flex items-center justify-between'>
              <p className='font-bold text-stone-800 text-sm'>Notifications</p>
              <span className='text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full'>
                {notifs?.length} new
              </span>
            </div>
            {notifs?.map((n) => {
              const iconMap = {
                info: { icon: "fa-info-circle", color: "text-blue-400" },
                success: { icon: "fa-check-circle", color: "text-green-400" },
                warning: {
                  icon: "fa-exclamation-triangle",
                  color: "text-yellow-400",
                },
                error: { icon: "fa-times-circle", color: "text-red-400" },
              };

              const { icon, color } = iconMap[n?.type] ?? iconMap.info;

              const getRelativeTime = (dateStr) => {
                const diff = Math.floor(
                  (Date.now() - new Date(dateStr)) / 1000
                ); // seconds ago
                if (diff < 60) return "Just now";
                if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
                return new Date(dateStr).toLocaleDateString();
              };

              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-stone-50 transition-colors cursor-pointer border-b border-stone-50 last:border-0 ${
                    !n.is_read ? "bg-blue-50/40" : ""
                  }`}
                >
                  <div className='w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 mt-0.5'>
                    <i className={`fa ${icon} ${color} text-xs`} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs font-semibold text-stone-700 leading-snug'>
                      {n?.title}
                    </p>
                    <p className='text-xs text-stone-500 leading-snug mt-0.5'>
                      {n?.message}
                    </p>
                    <p className='text-[10px] text-stone-400 mt-0.5'>
                      {getRelativeTime(n?.created_at)}
                    </p>
                  </div>
                  {!n.is_read && (
                    <span className='w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5' />
                  )}
                </div>
              );
            })}{" "}
            <div className='px-4 py-2.5 text-center'>
              <button className='text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors'>
                {user?.role === role.ADMIN ? (
                  <Link to={"/admin/notifications"}>
                    View all notifications
                  </Link>
                ) : (
                  <Link to={"/customer/notifications"}>
                    View all notifications
                  </Link>
                )}{" "}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className='w-px h-5 bg-stone-200 shrink-0' />

      {/* User dropdown */}
      <div ref={dropRef} className='relative shrink-0'>
        <button
          onClick={() => {
            setDropOpen((o) => !o);
            setNotifOpen(false);
          }}
          className='flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all'
        >
          {/* Avatar */}
          {user?.avatar ? (
            <div className='w-8 h-8 rounded-xl overflow-hidden ring-2 ring-amber-400/40 ring-offset-1'>
              <img
                src={renderImage(user?.avatar)}
                alt='profile'
                className='w-full h-full object-cover'
              />
            </div>
          ) : (
            <div className='w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0'>
              {user.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}

          {/* Name + role — hidden on small */}
          <div className='hidden sm:flex flex-col items-start leading-tight'>
            <span className='text-xs font-bold text-stone-700 leading-none mb-0.5'>
              {user.name}
            </span>
            <span className='text-[10px] text-stone-400 capitalize'>
              {user.role}
            </span>
          </div>

          <i
            className={`fa fa-chevron-down text-stone-400 text-[10px] transition-transform ${
              dropOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {dropOpen && (
          <div className='absolute right-0 top-12 w-52 bg-white rounded-2xl border border-stone-100 shadow-2xl shadow-stone-300/30 overflow-hidden z-50'>
            <div className='px-4 py-3 border-b border-stone-100'>
              <p className='font-bold text-stone-800 text-sm'>{user.name}</p>
              <p className='text-xs text-stone-400 truncate'>{user.email}</p>
            </div>
            {[
              { icon: "fa-user", label: "My Profile", path: "/profile/me" },
              {
                icon: "fa-suitcase",
                label: "My Bookings",
                path: "/my-bookings",
              },
              { icon: "fa-heart", label: "Favorites", path: "/favorites" },
              { icon: "fa-cog", label: "Settings", path: "/settings" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setDropOpen(false)}
                className='flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 transition-colors text-sm text-stone-600 hover:text-stone-800'
              >
                <i
                  className={`fa ${item.icon} text-stone-400 w-4 text-center text-xs`}
                />
                {item.label}
              </Link>
            ))}
            <div className='border-t border-stone-100'>
              <button
                onClick={() => {
                  setDropOpen(false);
                  navigate("/login");
                }}
                className='w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-sm text-red-500 hover:text-red-600'
              >
                <i className='fa fa-sign-out-alt text-xs w-4 text-center' />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
