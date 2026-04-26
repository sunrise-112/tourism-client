import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import userService from "../../services/userService";
import role from "../../constants/role";
import renderImage from "../../utils/renderImage";

const PublicHeader = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    userService
      .getMe()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "?");

  const NAV_LINKS = [
    { labelKey: "publicHeader.nav.home", path: "/" },
    { labelKey: "publicHeader.nav.tours", path: "/tours" },
    { labelKey: "publicHeader.nav.about", path: "/about" },
    { labelKey: "publicHeader.nav.contact", path: "/contact" },
  ];

  // Translate user role
  const translateRole = (roleValue) => {
    if (!roleValue) return "";
    return t(`roles.${roleValue}`, { defaultValue: roleValue });
  };

  const dropdownItems = [
    {
      icon: "fa-th-large",
      labelKey: "publicHeader.dropdown.dashboard",
      path: `${
        user?.role === role.ADMIN ? "/admin/dashboard" : "/customer/dashboard"
      }`,
    },
    {
      icon: "fa-user",
      labelKey: "publicHeader.dropdown.profile",
      path: "/profile/me",
    },
    {
      icon: "fa-suitcase-rolling",
      labelKey: "publicHeader.dropdown.bookings",
      path: "/my-bookings",
    },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
          scrolled
            ? "shadow-md shadow-stone-200/60 border-b border-stone-100"
            : "border-b border-stone-100"
        }`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className='max-w-7xl mx-auto px-5 h-16 flex items-center gap-6'>
          {/* ── Logo ─────────────────────────────────── */}
          <Link
            to='/'
            className='flex items-center gap-2.5 select-none group shrink-0'
          >
            <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm shadow-amber-200 group-hover:shadow-amber-300 transition-shadow'>
              <i className='fa fa-globe text-white text-sm' />
            </div>
            <span
              className='text-base font-black text-stone-800 tracking-tight hidden sm:block'
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {import.meta.env.VITE_COMPANY}
            </span>
          </Link>

          {/* ── Desktop Nav ───────────────────────────── */}
          <nav className='hidden lg:flex items-center gap-1 flex-1'>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  isActive(link.path)
                    ? "text-amber-600 bg-amber-50"
                    : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                }`}
              >
                {t(link.labelKey)}
                {isActive(link.path) && (
                  <span className='absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full' />
                )}
              </Link>
            ))}
          </nav>

          <div className='flex-1 lg:hidden' />

          {/* ── Right side ───────────────────────────── */}
          <div className='flex items-center gap-3 shrink-0'>
            {user ? (
              <>
                {/* Role badge — desktop */}
                <span className='hidden md:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 capitalize'>
                  <span className='w-1.5 h-1.5 rounded-full bg-amber-400' />
                  {translateRole(user.role)}
                </span>

                {/* User dropdown */}
                <div ref={dropRef} className='relative'>
                  <button
                    onClick={() => setDropOpen((o) => !o)}
                    className='flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all'
                  >
                    {/* Avatar */}
                    {user?.avatar ? (
                      <div className='w-8 h-8 rounded-xl overflow-hidden ring-2 ring-amber-400/40 ring-offset-1 shrink-0'>
                        <img
                          src={renderImage(user?.avatar)}
                          alt={user.name}
                          className='w-full h-full object-cover'
                        />
                      </div>
                    ) : (
                      <div className='w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0'>
                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}

                    {/* Name */}
                    <div className='hidden sm:flex flex-col items-start leading-tight'>
                      <span className='text-xs font-bold text-stone-700'>
                        {user.name}
                      </span>
                      <span className='text-[10px] text-stone-400 capitalize'>
                        {translateRole(user.role)}
                      </span>
                    </div>

                    <i
                      className={`fa fa-chevron-down text-stone-400 text-[10px] transition-transform duration-200 ${
                        dropOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {dropOpen && (
                    <div className='absolute right-0 top-12 w-56 bg-white rounded-2xl border border-stone-100 shadow-2xl shadow-stone-300/30 overflow-hidden z-50'>
                      {/* User info */}
                      <div className='px-4 py-3 border-b border-stone-100 flex items-center gap-3'>
                        {user.avatar ? (
                          <div className='w-9 h-9 rounded-xl overflow-hidden shrink-0'>
                            <img
                              src={renderImage(user?.avatar)}
                              alt={user.name}
                              className='w-full h-full object-cover'
                            />
                          </div>
                        ) : (
                          <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0'>
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div className='min-w-0'>
                          <p className='font-bold text-stone-800 text-sm truncate'>
                            {user.name}
                          </p>
                          <span className='inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full capitalize mt-0.5'>
                            <span className='w-1.5 h-1.5 rounded-full bg-amber-400' />
                            {translateRole(user.role)}
                          </span>
                        </div>
                      </div>

                      {/* Links */}
                      {dropdownItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setDropOpen(false)}
                          className='flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 transition-colors text-sm text-stone-600 hover:text-stone-800'
                        >
                          <i
                            className={`fa ${item.icon} text-stone-400 w-4 text-center text-xs`}
                          />
                          {t(item.labelKey)}
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
                          {t("publicHeader.dropdown.signOut")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Not logged in */
              <div className='flex items-center gap-2'>
                <Link
                  to='/login'
                  className='text-sm font-semibold text-stone-600 hover:text-stone-800 px-4 py-2 rounded-xl hover:bg-stone-50 transition-colors'
                >
                  {t("publicHeader.auth.signIn")}
                </Link>
                <Link
                  to='/register'
                  className='text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-4 py-2 rounded-xl shadow-sm shadow-amber-200'
                >
                  {t("publicHeader.auth.getStarted")}
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className='lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors text-stone-500'
              onClick={() => setMenuOpen((o) => !o)}
            >
              <i
                className={`fa ${menuOpen ? "fa-times" : "fa-bars"} text-sm`}
              />
            </button>
          </div>
        </div>

        {/* ── Mobile menu ───────────────────────────────── */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            menuOpen ? "max-h-96 border-t border-stone-100" : "max-h-0"
          }`}
        >
          <nav className='px-5 py-3 space-y-1 bg-white'>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-amber-50 text-amber-700 font-semibold"
                    : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                }`}
              >
                {t(link.labelKey)}
              </Link>
            ))}

            {!user && (
              <div className='flex gap-2 pt-2 pb-1'>
                <Link
                  to='/login'
                  className='flex-1 text-center text-sm font-semibold text-stone-600 border border-stone-200 px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-colors'
                >
                  {t("publicHeader.auth.signIn")}
                </Link>
                <Link
                  to='/register'
                  className='flex-1 text-center text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 px-4 py-2.5 rounded-xl transition-colors'
                >
                  {t("publicHeader.auth.getStarted")}
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className='h-16' />
    </>
  );
};

export default PublicHeader;
