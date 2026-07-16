import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
import authService from "../../services/authService";

const Header = ({
  isOpen = false,
  setIsOpen,
  mobileOpen,
  setMobileOpen,
  collapsed,
}) => {
  const { t } = useTranslation();
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

  const isAdmin = user?.role === role.ADMIN;

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
  };

  const handleLogOut = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;
    window.location.href = "/login";

    try {
      await authService.logout();
      setDropOpen(false);
    } catch (error) {
      console.log("Error: ", error);
    }
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
        const currentUser = userService.getCurrentUser();
        const notifs = await notificationService.getAll({
          is_read: false,
          limit: 6,
          ...(currentUser?.role === role.ADMIN && { user_id: currentUser?.id }),
        });
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

  const getRelativeTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return t("header.notifications.time.justNow");
    if (diff < 3600)
      return t("header.notifications.time.minutesAgo", {
        count: Math.floor(diff / 60),
      });
    if (diff < 86400)
      return t("header.notifications.time.hoursAgo", {
        count: Math.floor(diff / 3600),
      });
    if (diff < 86400 * 7)
      return t("header.notifications.time.daysAgo", {
        count: Math.floor(diff / 86400),
      });
    return new Date(dateStr).toLocaleDateString();
  };

  const iconMap = {
    info: { icon: "fa-info-circle", color: "text-blue-400" },
    success: { icon: "fa-check-circle", color: "text-green-400" },
    warning: { icon: "fa-exclamation-triangle", color: "text-yellow-400" },
    error: { icon: "fa-times-circle", color: "text-red-400" },
  };

  return (
    <div className='w-auto h-16 z-20 bg-white border-b border-stone-100 shadow-sm flex items-center px-4 gap-3 transition-all duration-300 lg:ml-60 md:ml-0 sm:ml-0'>
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
        <span className='font-semibold text-stone-700'>
          {t("header.breadcrumb.dashboard")}
        </span>
      </div>

      <div className='flex-1 hidden lg:block' />

      {/* Search — desktop */}
      <div className='hidden md:flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 w-48'>
        <i className='fa fa-search text-stone-300 text-xs' />
        <input
          placeholder={t("header.search.placeholder")}
          onChange={(e) => setSearchParam({ q: e.currentTarget.value })}
          className='bg-transparent text-xs outline-none text-stone-500 placeholder-stone-300 w-full'
        />
      </div>

      {/* Notifications */}
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
          <div className='fixed left-4 right-4 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[288px] bg-white rounded-2xl border border-stone-100 shadow-2xl shadow-stone-300/30 overflow-hidden z-50'>
            <div className='px-4 py-3 border-b border-stone-100 flex items-center justify-between'>
              <p className='font-bold text-stone-800 text-sm'>
                {t("header.notifications.title")}
              </p>
              <span className='text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full'>
                {t("header.notifications.newCount", { count: notifs?.length })}
              </span>
            </div>

            {/* Max height + scroll for many notifications */}
            <div className='max-h-[60vh] overflow-y-auto'>
              {notifs?.map((n) => {
                const { icon, color } = iconMap[n?.type] ?? iconMap.info;
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
              })}
            </div>

            <div className='px-4 py-2.5 text-center border-t border-stone-100'>
              <Link
                to={
                  isAdmin ? "/admin/notifications" : "/customer/notifications"
                }
                onClick={() => setNotifOpen(false)}
                className='text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors'
              >
                {t("header.notifications.viewAll")}
              </Link>
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
          className='flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all'
        >
          {/* Avatar */}
          {user?.avatar ? (
            <div className='w-8 h-8 rounded-xl overflow-hidden ring-2 ring-amber-400/40 ring-offset-1 shrink-0'>
              <img
                src={renderImage(user?.avatar)}
                alt={t("header.userMenu.avatarAlt")}
                className='w-full h-full object-cover'
              />
            </div>
          ) : (
            <div className='w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0'>
              {user.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}

          {/* ✅ Name + role — visible on ALL screens */}
          <div className='flex flex-col items-start leading-tight'>
            <span className='text-xs font-bold text-stone-700 leading-none mb-0.5 max-w-[80px] truncate'>
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
          <div className='absolute right-0 top-12 w-[calc(100vw-32px)] max-w-[208px] bg-white rounded-2xl border border-stone-100 shadow-2xl shadow-stone-300/30 overflow-hidden z-50'>
            <div className='px-4 py-3 border-b border-stone-100'>
              <p className='font-bold text-stone-800 text-sm truncate'>
                {user.name}
              </p>
              <p className='text-xs text-stone-400 truncate'>{user.email}</p>
            </div>

            {[
              {
                icon: "fa-user",
                label: t("header.userMenu.myProfile"),
                path: "/profile/me",
              },
              {
                icon: "fa-suitcase",
                label: isAdmin
                  ? t("header.userMenu.bookings")
                  : t("header.userMenu.myBookings"),
                path: isAdmin ? "/admin/bookings" : "/my-bookings",
              },
              {
                icon: "fa-cog",
                label: t("header.userMenu.settings"),
                path: "/settings",
              },
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
                onClick={handleLogOut}
                className='w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-sm text-red-500 hover:text-red-600'
              >
                <i className='fa fa-sign-out-alt text-xs w-4 text-center' />
                {t("header.userMenu.signOut")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
