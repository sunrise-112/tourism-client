import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import userService from "../../services/userService";
import role from "../../constants/role";
import bookingService from "../../services/bookingService";
import { useTranslation } from "react-i18next";

const user = userService?.getCurrentUser();
const isAdmin = user?.role === role.ADMIN;
const isCustomer = user?.role === role.CUSTOMER;

const Sidebar = ({
  collapsed,
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
                icon: "fa-list",
                label: t("nav.categories"),
                path: "/categories",
              },
            ]
          : []),

        ...(isCustomer
          ? [
              {
                icon: "fa-heart",
                label: t("nav.favorites"),
                path: "/favorites",
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
          path: "/admin/notifications",
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
        const bookings = await bookingService.getAll({
          status: "pending",
          limit: 1000,
        });
        setBookings(bookings?.pagination?.totalItems);
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
          className='fixed inset-0 z-30 bg-black/50 lg:hidden'
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col
          bg-[#1C1107] border-r border-white/5
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Logo */}
        <div
          className={`flex items-center h-16 px-4 border-b border-white/5 shrink-0 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0'>
            <i className='fa fa-globe text-white text-sm' />
          </div>
          {!collapsed && (
            <span
              className='text-white font-black text-base tracking-tight'
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              MaghribTours
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className='flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-hide'>
          {NAV.map(({ items }) => (
            <div className='mb-2'>
              {/* Section header */}
              {/*   {!collapsed && (
                <button
                  onClick={() => toggleSection(section)}
                  className='w-full flex items-center justify-between px-3 py-1.5 mb-1 group'
                >
                  <span className='text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 group-hover:text-white/50 transition-colors'>
                    {section}
                  </span>
                  <i
                    className={`fa fa-chevron-down text-[8px] text-white/25 transition-transform duration-200 ${
                      openSections[section] ? "" : "-rotate-90"
                    }`}
                  />
                </button>
              )} */}
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150 group relative
                    ${
                      isActive(item.path)
                        ? "bg-amber-500/20 text-amber-400"
                        : "text-white/40 hover:text-white/80 hover:bg-white/5"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                >
                  {isActive(item.path) && (
                    <span className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-400 rounded-r-full' />
                  )}
                  <i className={`fa ${item.icon} text-sm w-4 text-center`} />
                  {item.total ? (
                    <div className='absolute  right-1.5 min-w-[18px] h-[18px] px-1 bg-amber-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center leading-none'>
                      {item.total}
                    </div>
                  ) : (
                    <div></div>
                  )}
                  {!collapsed && (
                    <span className='text-sm font-medium'>{item.label}</span>
                  )}
                  {/* Tooltip on collapsed */}
                  {collapsed && (
                    <div className='absolute left-full ml-3 px-2.5 py-1.5 bg-stone-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl'>
                      {item.label}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* User + collapse */}
        <div className='shrink-0 border-t border-white/5 p-3 space-y-2'>
          {/* User row */}
          <div
            className={`flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {/*             <Avatar
              name={user?.name}
              src={
                user?.avatar
                  ? `${import.meta.env.VITE_BACK_END_URL}${user.avatar}`
                  : null
              }
              size='w-8 h-8'
              textSize='text-xs'
            />
 */}{" "}
            {!collapsed && (
              <div className='flex-1 min-w-0'>
                <p className='text-xs font-bold text-white truncate'>
                  {user?.name || "Traveler"}
                </p>
                <p className='text-[10px] text-white/30 truncate capitalize'>
                  {user?.role || "Customer"}
                </p>
              </div>
            )}
          </div>
          {/* Collapse toggle */}
          {/*           <button
            onClick={() => setCollapsed((c) => !c)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/5 transition-all text-xs ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <i
              className={`fa ${
                collapsed ? "fa-chevron-right" : "fa-chevron-left"
              } text-xs`}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
 */}{" "}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
