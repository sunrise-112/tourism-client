import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Roles from "../../constants/role.jsx";

const Sidebar = ({ user, isOpen = false, setIsOpen }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = user?.role === Roles.ADMIN;
  const isCustomer = user?.role === Roles.CUSTOMER;

  // RTL detection
  useEffect(() => {
    const lang = i18n.language || localStorage.getItem("i18nextLng");
    setIsRTL(lang === "ar");
  }, [i18n.language]);

  // Responsive detection
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
        setCollapsed(false);
      } else {
        const stored = localStorage.getItem("sidebarOpen");
        setIsOpen(stored ? JSON.parse(stored) : true);
        const storedCollapsed = localStorage.getItem("sidebarCollapsed");
        setCollapsed(storedCollapsed ? JSON.parse(storedCollapsed) : false);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [setIsOpen]);

  const handleIsOpen = (val) => {
    localStorage.setItem("sidebarOpen", JSON.stringify(val));
    setIsOpen(val);
  };

  const handleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(next));
    if (next) setOpenMenus({});
  };

  const toggleMenu = (label) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenMenus({ [label]: true });
      return;
    }
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path) => location.pathname === path;
  const isParentActive = (children) =>
    children?.some((c) => location.pathname === c.path);

  // ─── Menu definitions ─────────────────────────────────────────
  const allMenus = {
    home: { label: "Home", icon: "fa-home", path: "/", roles: "all" },
    tours: {
      label: "Tours",
      icon: "fa-map-marked-alt",
      roles: "all",
      children: [
        { label: "All tours", path: "/tours/all" },
        { label: "Add tour", path: "/tours/new", restrict: [Roles.ADMIN] },
      ],
    },
    bookings: {
      label: "Bookings",
      icon: "fa-calendar-check",
      roles: "all",
      children: [
        { label: "All bookings", path: "/bookings/all" },
        {
          label: "My bookings",
          path: "/bookings/my",
          restrict: [Roles.CUSTOMER],
        },
      ],
    },
    reviews: {
      label: "Reviews",
      icon: "fa-star",
      roles: "all",
      children: [
        { label: "All reviews", path: "/reviews/all" },
        {
          label: "My reviews",
          path: "/reviews/my",
          restrict: [Roles.CUSTOMER],
        },
      ],
    },
    users: {
      label: "Users",
      icon: "fa-users",
      roles: [Roles.ADMIN],
      children: [
        { label: "All users", path: "/users" },
        { label: "Add user", path: "/users/new" },
      ],
    },
    profile: {
      label: "Profile",
      icon: "fa-user-circle",
      path: "/profile/me",
      roles: "all",
    },
    settings: {
      label: "Settings",
      icon: "fa-cog",
      path: "/settings",
      roles: "all",
    },
    logout: {
      label: "Logout",
      icon: "fa-sign-out-alt",
      path: "/logout",
      roles: "all",
    },
  };

  const roleMenuMap = {
    [Roles.ADMIN]: [
      "home",
      "tours",
      "bookings",
      "reviews",
      "users",
      "settings",
      "logout",
    ],
    [Roles.CUSTOMER]: [
      "home",
      "tours",
      "bookings",
      "reviews",
      "profile",
      "settings",
      "logout",
    ],
  };

  const menuKeys = roleMenuMap[user?.role] || ["home", "logout"];

  const finalMenuItems = menuKeys.map((key) => {
    const item = { ...allMenus[key] };
    if (item.children) {
      item.children = item.children.filter(
        (c) => !c.restrict || c.restrict.includes(user?.role)
      );
    }
    return item;
  });

  // ─── Role badge ───────────────────────────────────────────────
  const roleBadge = {
    [Roles.ADMIN]: {
      bg: "bg-success/15 text-success border-success/30",
      icon: "fa-shield-alt",
    },
    [Roles.CUSTOMER]: {
      bg: "bg-accent/15 text-accent border-accent/30",
      icon: "fa-user",
    },
  };
  const badge = roleBadge[user?.role] || {
    bg: "bg-base-300 text-base-content",
    icon: "fa-user",
  };

  const dir = isRTL ? "rtl" : "ltr";

  return (
    <>
      {/* ── Mobile overlay ── */}
      {isMobile && isOpen && (
        <div
          className='fixed inset-0 bg-black/40 z-30 lg:hidden'
          onClick={() => handleIsOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        dir={dir}
        className={`
          fixed top-0 ${isRTL ? "right-0" : "left-0"} h-screen z-40
          bg-base-100 border-${isRTL ? "l" : "r"} border-base-200
          flex flex-col shadow-xl
          transition-all duration-300 ease-in-out
          ${
            isMobile
              ? isOpen
                ? "translate-x-0"
                : isRTL
                ? "translate-x-full"
                : "-translate-x-full"
              : "translate-x-0"
          }
          ${collapsed && !isMobile ? "w-16" : "w-64"}
        `}
      >
        {/* ── Top: Logo + Collapse btn ── */}
        <div
          className={`flex items-center h-16 px-3 border-b border-base-200 flex-shrink-0 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && (
            <Link
              to='/'
              className='flex items-center gap-2 text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate'
            >
              <i className='fa fa-globe text-accent text-lg flex-shrink-0' />
              {import.meta.env.VITE_COMPANY}
            </Link>
          )}
          {/* Collapse toggle — desktop only */}
          <button
            onClick={isMobile ? () => handleIsOpen(false) : handleCollapse}
            className='btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-accent'
            title={collapsed ? "Expand" : "Collapse"}
          >
            <i
              className={`fa ${
                isMobile
                  ? "fa-times"
                  : collapsed
                  ? isRTL
                    ? "fa-chevron-left"
                    : "fa-chevron-right"
                  : isRTL
                  ? "fa-chevron-right"
                  : "fa-chevron-left"
              } text-sm`}
            />
          </button>
        </div>

        {/* ── User profile strip ── */}
        <div
          className={`flex items-center gap-3 px-3 py-3 border-b border-base-200 flex-shrink-0 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className='avatar flex-shrink-0'>
            <div className='w-8 rounded-full ring-2 ring-accent ring-offset-1 ring-offset-base-100'>
              <img
                src={`${import.meta.env.VITE_BACK_END_URL}${user?.avatar}`}
                alt='avatar'
              />
            </div>
          </div>
          {!collapsed && (
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-semibold text-base-content truncate'>
                {user?.name}
              </p>
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border mt-0.5 ${badge.bg}`}
              >
                <i className={`fa ${badge.icon} text-xs`} />
                <span className='capitalize'>{user?.role}</span>
              </span>
            </div>
          )}
        </div>

        {/* ── Menu ── */}
        <nav className='flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5'>
          {finalMenuItems.map((item) => {
            const hasChildren = item.children?.length > 0;
            const parentActive = hasChildren && isParentActive(item.children);

            if (hasChildren) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    title={collapsed ? t(item.label) : ""}
                    className={`
                      w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm
                      transition-colors duration-150 group
                      ${
                        parentActive
                          ? "bg-accent/10 text-accent"
                          : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                      }
                      ${
                        collapsed
                          ? "justify-center"
                          : isRTL
                          ? "flex-row-reverse"
                          : ""
                      }
                    `}
                  >
                    <i
                      className={`fa ${
                        item.icon
                      } w-4 text-center flex-shrink-0 ${
                        parentActive
                          ? "text-accent"
                          : "group-hover:text-accent transition-colors"
                      }`}
                    />
                    {!collapsed && (
                      <>
                        <span className='flex-1 text-left font-medium truncate'>
                          {t(item.label)}
                        </span>
                        <i
                          className={`fa fa-chevron-${
                            openMenus[item.label]
                              ? "down"
                              : isRTL
                              ? "left"
                              : "right"
                          } text-xs opacity-50`}
                        />
                      </>
                    )}
                  </button>

                  {/* Submenu */}
                  {!collapsed && openMenus[item.label] && (
                    <ul
                      className={`mt-0.5 mb-1 space-y-0.5 ${
                        isRTL ? "pr-4 border-r-2" : "pl-4 border-l-2"
                      } border-base-300 mx-2`}
                    >
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Link
                            to={child.path}
                            onClick={() => isMobile && handleIsOpen(false)}
                            className={`
                              flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                              ${
                                isActive(child.path)
                                  ? "bg-accent text-accent-content font-medium"
                                  : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
                              }
                            `}
                          >
                            <span className='w-1 h-1 rounded-full bg-current opacity-60 flex-shrink-0' />
                            {t(child.label)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            }

            // Leaf item
            const active = isActive(item.path);
            const isLogout = item.label === "Logout";

            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => isMobile && handleIsOpen(false)}
                title={collapsed ? t(item.label) : ""}
                className={`
                  flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm
                  transition-colors duration-150 group
                  ${
                    collapsed
                      ? "justify-center"
                      : isRTL
                      ? "flex-row-reverse"
                      : ""
                  }
                  ${
                    isLogout
                      ? "text-error/70 hover:bg-error/10 hover:text-error mt-1"
                      : active
                      ? "bg-accent text-accent-content font-medium"
                      : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                  }
                `}
              >
                <i
                  className={`fa ${item.icon} w-4 text-center flex-shrink-0 ${
                    !active && !isLogout
                      ? "group-hover:text-accent transition-colors"
                      : ""
                  }`}
                />
                {!collapsed && (
                  <span className='font-medium truncate'>{t(item.label)}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom: Theme + Language ── */}
        <div className='border-t border-base-200 p-3 space-y-2 flex-shrink-0'>
          {!collapsed && (
            <>
              <FancyThemeSwitcher />
              <LanguageSwitcher />
            </>
          )}
          {collapsed && (
            <div className='flex flex-col items-center gap-2'>
              <button className='btn btn-ghost btn-xs btn-square' title='Theme'>
                <i className='fa fa-palette text-sm' />
              </button>
              <button
                className='btn btn-ghost btn-xs btn-square'
                title='Language'
              >
                <i className='fa fa-language text-sm' />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
