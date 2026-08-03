import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import userService from "../../services/userService";
import role from "../../constants/role";
import bookingService from "../../services/bookingService";
import { useTranslation } from "react-i18next";
import settingsService from "../../services/adminSettings";
import renderImage from "../../utils/renderImage";

const user = userService?.getCurrentUser();
const isAdmin = user?.role === role.ADMIN;
const isCustomer = user?.role === role.CUSTOMER;

const Sidebar = ({
  collapsed,
  setIsOpen,
  setCollapsed,
  user,
  mobileOpen,
  setMobileOpen,
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [openSections, setOpenSections] = useState({
    Main: true,
    Explore: true,
    Account: true,
  });

  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.get();
        setCompanyInfo(data);
      } catch (error) {
        console.log("Error: ", error);
      }
    };
    fetchSettings();
  }, []);

  const NAV = [
    {
      section: t("nav.main"),
      items: [
        {
          icon: "fa-th-large",
          label: t("nav.dashboard"),
          path: isAdmin ? "/admin/dashboard" : "/customer/dashboard",
        },
        {
          icon: "fa-suitcase-rolling",
          label: isAdmin ? t("nav.bookings") : t("nav.myBookings"),
          ...(isAdmin && { className: " animate-pulse" }),
          total: parseInt(bookings),
          path: isAdmin ? "/admin/bookings" : "/my-bookings",
        },

        ...(isAdmin
          ? [
              {
                icon: "fa-map-marked-alt",
                label: t("nav.tours"),
                path: "/admin/tours",
              },
              {
                icon: "fa-hiking",
                label: t("nav.excursions"),
                path: "/admin/excursions",
              },
              {
                icon: "fa-running",
                label: t("nav.activities"),
                path: "/admin/activities",
              },
              {
                icon: "fa-comments",
                label: t("nav.reviews"),
                path: "/admin/reviews",
              },
              {
                icon: "fa-user",
                label: t("nav.users"),
                path: "/admin/users",
              },
              {
                icon: "fa-envelope",
                label: t("nav.inquiries"),
                path: "/admin/inquiries",
              },
              {
                icon: "fa-layer-group",
                label: t("nav.categories"),
                path: "/categories",
              },
              {
                icon: "fa-ban",
                label: t("tourForm.fields.exclusions"),
                path: "/exclusions",
              },
              {
                icon: "fa-check-circle",
                label: t("tourForm.fields.inclusions"),
                path: "/inclusions",
              },
            ]
          : []),
      ],
    },
    {
      section: t("nav.account"),
      items: [
        {
          icon: "fa-user-circle",
          label: t("nav.profile"),
          path: "/profile/me",
        },
        {
          icon: "fa-bell",
          label: t("nav.notifications"),
          path: isAdmin ? "/admin/notifications" : "/customer/notifications",
        },
        {
          icon: "fa-cog",
          label: t("nav.settings"),
          path: "/settings",
        },
      ],
    },
  ];

  const toggleSection = (s) => setOpenSections((p) => ({ ...p, [s]: !p[s] }));

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (isAdmin) {
          const bookings = await bookingService.getAll({
            status: "pending",
            limit: 1000,
          });
          setBookings(bookings?.pagination?.totalItems);
        } else if (isCustomer) {
          const myBookings = await bookingService.getMyBookings("pending");
          console.log("My bookings: ", myBookings?.length);
          setBookings(myBookings?.length);
        }
        console.log("bookings: ", bookings);
      } catch (error) {
        console.log("Error: ", error);
      }
    };

    fetchBookings();
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className='fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ease-out'
          onClick={() => {
            setMobileOpen(false);
            setIsOpen(false);
          }}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col
          bg-[#1C1107] border-r border-white/[0.06]
          transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${collapsed ? "w-[72px]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: collapsed ? "none" : "4px 0 24px rgba(0,0,0,0.15)",
        }}
      >
        {/* Logo */}
        <div
          className={`
            flex items-center h-[68px] px-4 border-b border-white/[0.06] shrink-0
            transition-all duration-300
            ${collapsed ? "justify-center" : "gap-3"}
          `}
        >
          <div
            className='
              w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 
              flex items-center justify-center shrink-0 
              shadow-lg shadow-amber-500/20 ring-2 ring-white/10
              transition-transform duration-300 hover:scale-105
            '
          >
            {companyInfo?.logo ? (
              <img
                src={companyInfo?.logo}
                className='w-full h-full object-cover rounded-xl'
                alt=''
              />
            ) : (
              <i className='fa fa-globe text-white text-sm drop-shadow' />
            )}
          </div>
          {!collapsed && (
            <span
              className='text-white font-black text-base tracking-tight truncate'
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {import.meta.env.VITE_COMPANY || companyInfo?.company_name}
            </span>
          )}
        </div>

        {/* Nav */}
        <nav
          className='flex-1 overflow-y-auto py-5 px-2.5 space-y-5 scrollbar-hide'
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.1) transparent",
          }}
        >
          {NAV.map(({ items }, navIdx) => (
            <div key={navIdx} className='space-y-1'>
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  onClick={() => {
                    setMobileOpen(false);
                    setIsOpen(false);
                  }}
                  className={`
                    relative flex items-center gap-3 px-3 py-2.5 rounded-xl 
                    transition-all duration-200 ease-out group
                    ${collapsed ? "justify-center" : ""}
                    ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent text-amber-400 shadow-[inset_3px_0_0_0_rgba(251,191,36,0.9)]"
                        : "text-white/40 hover:text-white/90 hover:bg-white/[0.04] hover:shadow-[inset_3px_0_0_0_rgba(255,255,255,0.08)]"
                    }
                  `}
                >
                  {/* Ambient glow for active */}
                  {isActive(item.path) && (
                    <span className='absolute inset-0 rounded-xl bg-amber-400/[0.03] blur-md' />
                  )}

                  <span
                    className={`
                      relative flex items-center justify-center w-5 h-5
                      transition-all duration-200
                      ${
                        isActive(item.path)
                          ? "scale-110"
                          : "group-hover:scale-105 group-hover:text-white/70"
                      }
                    `}
                  >
                    <i
                      className={`
                        fa ${item.icon} text-[15px]
                        ${
                          isActive(item.path)
                            ? "drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                            : ""
                        }
                      `}
                    />
                  </span>

                  {item.total ? (
                    <span
                      className={`
                        ${bookings > 0 && item?.className}
                        absolute right-2 top-1/2 -translate-y-1/2
                        min-w-[20px] h-5 px-1.5
                        bg-gradient-to-br from-amber-400 to-amber-600 
                        rounded-full text-[10px] font-bold text-white 
                        flex items-center justify-center leading-none
                        shadow-lg shadow-amber-500/30 ring-2 ring-[#1C1107]
                        z-10
                      `}
                    >
                      {item.total}
                    </span>
                  ) : (
                    <div className='hidden' />
                  )}

                  {!collapsed && (
                    <span
                      className={`
                        relative text-sm font-medium tracking-wide
                        transition-all duration-200
                        ${
                          isActive(item.path)
                            ? "translate-x-0.5"
                            : "group-hover:translate-x-0.5"
                        }
                      `}
                    >
                      {item.label}
                    </span>
                  )}

                  {/* Collapsed tooltip */}
                  {collapsed && (
                    <div
                      className='
                        absolute left-full ml-3 px-3 py-2 
                        bg-[#2a1f15] text-white text-xs font-medium 
                        rounded-lg whitespace-nowrap 
                        opacity-0 group-hover:opacity-100 
                        pointer-events-none transition-all duration-200 z-50 
                        shadow-2xl border border-white/[0.08]
                        translate-x-2 group-hover:translate-x-0
                      '
                    >
                      <span
                        className='
                          absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 
                          w-2 h-2 bg-[#2a1f15] border-l border-b border-white/[0.08] rotate-45
                        '
                      />
                      {item.label}
                      {item.total > 0 && (
                        <span className='ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-amber-500 rounded-full text-[9px] font-bold'>
                          {item.total}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
              {/* Section divider */}
              {navIdx < NAV.length - 1 && (
                <div className='pt-4 mt-2 border-t border-white/[0.04]' />
              )}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className='shrink-0 border-t border-white/[0.06] p-3 bg-gradient-to-t from-black/20 to-transparent'>
          <div
            className={`
              group relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl 
              hover:bg-white/[0.04] active:bg-white/[0.06]
              transition-all duration-200 cursor-pointer
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <div
              className='
                w-8 h-8 rounded-full bg-gradient-to-br from-stone-600 to-stone-700 
                flex items-center justify-center text-white text-xs font-bold
                ring-2 ring-white/10 shadow-lg shrink-0
              '
            >
              {renderImage(user?.avatar)}
            </div>
            {!collapsed && (
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-bold text-white/90 truncate'>
                  {user?.name}
                </p>
                <p className='text-[11px] text-white/30 truncate capitalize font-medium'>
                  {user?.role}
                </p>
              </div>
            )}

            {/* Collapsed user tooltip */}
            {collapsed && (
              <div
                className='
                  absolute left-full ml-3 px-3 py-2 
                  bg-[#2a1f15] text-white text-xs font-medium 
                  rounded-lg whitespace-nowrap 
                  opacity-0 group-hover:opacity-100 
                  pointer-events-none transition-all duration-200 z-50 
                  shadow-2xl border border-white/[0.08]
                  translate-x-2 group-hover:translate-x-0
                '
              >
                <span
                  className='
                    absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 
                    w-2 h-2 bg-[#2a1f15] border-l border-b border-white/[0.08] rotate-45
                  '
                />
                {user?.name}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
