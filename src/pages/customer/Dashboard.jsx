import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import bookingService from "../../services/bookingService";
import tourService from "../../services/tourService";
import userService from "../../services/userService";
import Sidebar from "../../components/Global/SideBar";

// ─── Mock / fallback data ─────────────────────────────────────
const SPENDING_DATA = [
  { month: "Oct", amount: 0 },
  { month: "Nov", amount: 290 },
  { month: "Dec", amount: 0 },
  { month: "Jan", amount: 450 },
  { month: "Feb", amount: 380 },
  { month: "Mar", amount: 680 },
];

const CATEGORY_DATA = [
  { name: "Desert", value: 3, color: "#F59E0B" },
  { name: "Cultural", value: 5, color: "#FB923C" },
  { name: "Trekking", value: 2, color: "#FBBF24" },
  { name: "Coastal", value: 1, color: "#FDE68A" },
];

const MOCK_BOOKINGS = [
  {
    id: 1,
    tour: {
      title: "Sahara Desert Camel Trek",
      destination: "Merzouga",
      cover_image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Camel_on_Erg_Chebbi.jpg/400px-Camel_on_Erg_Chebbi.jpg",
      duration_days: 3,
    },
    status: "confirmed",
    total_price: 299,
    booking_date: "2026-04-12",
  },
  {
    id: 2,
    tour: {
      title: "Fez Medina Deep Dive",
      destination: "Fez",
      cover_image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Chouara_Tannery%2C_Fes.jpg/400px-Chouara_Tannery%2C_Fes.jpg",
      duration_days: 3,
    },
    status: "pending",
    total_price: 320,
    booking_date: "2026-05-03",
  },
  {
    id: 3,
    tour: {
      title: "Chefchaouen Blue City",
      destination: "Chefchaouen",
      cover_image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Chefchaouen%2C_Morocco_%2844435946544%29.jpg/400px-Chefchaouen%2C_Morocco_%2844435946544%29.jpg",
      duration_days: 3,
    },
    status: "completed",
    total_price: 280,
    booking_date: "2026-02-18",
  },
  {
    id: 4,
    tour: {
      title: "High Atlas Trekking",
      destination: "Atlas",
      cover_image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Toubkal_seen_from_Ouanoukrim.jpg/400px-Toubkal_seen_from_Ouanoukrim.jpg",
      duration_days: 6,
    },
    status: "completed",
    total_price: 520,
    booking_date: "2026-01-10",
  },
  {
    id: 5,
    tour: {
      title: "Marrakech City Experience",
      destination: "Marrakech",
      cover_image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Jamaa_el_Fna_at_dusk.jpg/400px-Jamaa_el_Fna_at_dusk.jpg",
      duration_days: 3,
    },
    status: "cancelled",
    total_price: 250,
    booking_date: "2025-12-05",
  },
];

const MOCK_FAVORITES = [
  {
    id: 6,
    title: "Essaouira Coastal Escape",
    destination: "Essaouira",
    price: 210,
    cover_image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Essaouira_ramparts.jpg/400px-Essaouira_ramparts.jpg",
  },
  {
    id: 7,
    title: "Todra Gorges Explorer",
    destination: "Dades",
    price: 360,
    cover_image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Todra_Gorge.jpg/400px-Todra_Gorge.jpg",
  },
  {
    id: 8,
    title: "Ouzoud Waterfalls Trek",
    destination: "Middle Atlas",
    price: 120,
    cover_image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Cascades_d%27Ouzoud.jpg/400px-Cascades_d%27Ouzoud.jpg",
  },
];

// ─── Helpers ──────────────────────────────────────────────────
const STATUS = {
  confirmed: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
    label: "Confirmed",
  },
  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-400",
    label: "Pending",
  },
  cancelled: {
    bg: "bg-red-100",
    text: "text-red-600",
    dot: "bg-red-400",
    label: "Cancelled",
  },
  completed: {
    bg: "bg-stone-100",
    text: "text-stone-500",
    dot: "bg-stone-400",
    label: "Completed",
  },
};

const Badge = ({ status }) => {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const Avatar = ({ name, src, size = "w-10 h-10", textSize = "text-sm" }) =>
  src ? (
    <img
      src={src}
      alt={name}
      className={`${size} rounded-xl object-cover ring-2 ring-amber-400/30`}
    />
  ) : (
    <div
      className={`${size} rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black ${textSize} shrink-0`}
    >
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );

const Sk = ({ className }) => (
  <div className={`animate-pulse bg-stone-100 rounded-xl ${className}`} />
);

// ─── Sidebar nav items ────────────────────────────────────────
// ─── Sidebar ──────────────────────────────────────────────────

// ─── Topbar ───────────────────────────────────────────────────
const Topbar = ({ user, collapsed, mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropRef = useRef(null);
  const notifRef = useRef(null);

  // Close on outside click
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

  const NOTIFS = [
    {
      icon: "fa-check-circle",
      color: "text-emerald-500",
      text: "Booking #1042 confirmed!",
      time: "2 min ago",
    },
    {
      icon: "fa-tag",
      color: "text-amber-500",
      text: "Hot deal: 20% off Sahara Trek",
      time: "1hr ago",
    },
    {
      icon: "fa-star",
      color: "text-blue-400",
      text: "Leave a review for Fez tour",
      time: "Yesterday",
    },
  ];

  return (
    <header
      className='fixed top-0 right-0 z-20 h-16 bg-white border-b border-stone-100 flex items-center px-4 gap-3'
      style={{
        left: `${collapsed ? 72 : 256}px`,
        transition: "left 300ms ease",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Mobile hamburger */}
      <button
        className='lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors'
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <i className={`fa ${mobileOpen ? "fa-times" : "fa-bars"} text-sm`} />
      </button>

      {/* Breadcrumb */}
      <div className='hidden sm:flex items-center gap-2 text-sm'>
        <span className='text-stone-400'>Dashboard</span>
        <i className='fa fa-chevron-right text-stone-300 text-[10px]' />
        <span className='font-semibold text-stone-700'>Overview</span>
      </div>

      <div className='flex-1' />

      {/* Search */}
      <div className='hidden md:flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 w-48'>
        <i className='fa fa-search text-stone-300 text-xs' />
        <input
          placeholder='Quick search...'
          className='bg-transparent text-xs outline-none text-stone-500 placeholder-stone-300 w-full'
        />
      </div>

      {/* Notifications */}
      <div ref={notifRef} className='relative'>
        <button
          onClick={() => {
            setNotifOpen((o) => !o);
            setDropOpen(false);
          }}
          className='relative w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors'
        >
          <i className='fa fa-bell text-sm' />
          <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full' />
        </button>

        {notifOpen && (
          <div className='absolute right-0 top-12 w-72 bg-white rounded-2xl border border-stone-100 shadow-2xl shadow-stone-300/30 overflow-hidden z-50'>
            <div className='px-4 py-3 border-b border-stone-100 flex items-center justify-between'>
              <p className='font-bold text-stone-800 text-sm'>Notifications</p>
              <span className='text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full'>
                {NOTIFS.length} new
              </span>
            </div>
            {NOTIFS.map((n, i) => (
              <div
                key={i}
                className='flex items-start gap-3 px-4 py-3 hover:bg-stone-50 transition-colors cursor-pointer border-b border-stone-50 last:border-0'
              >
                <div className='w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 mt-0.5'>
                  <i className={`fa ${n.icon} ${n.color} text-xs`} />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs font-semibold text-stone-700 leading-snug'>
                    {n.text}
                  </p>
                  <p className='text-[10px] text-stone-400 mt-0.5'>{n.time}</p>
                </div>
              </div>
            ))}
            <div className='px-4 py-2.5 text-center'>
              <button className='text-xs font-semibold text-amber-600 hover:text-amber-700'>
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User dropdown */}
      <div ref={dropRef} className='relative'>
        <button
          onClick={() => {
            setDropOpen((o) => !o);
            setNotifOpen(false);
          }}
          className='flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all'
        >
          <Avatar
            name={user?.name}
            src={
              user?.avatar
                ? `${import.meta.env.VITE_BACK_END_URL}${user.avatar}`
                : null
            }
            size='w-8 h-8'
            textSize='text-xs'
          />
          <div className='hidden sm:block text-left'>
            <p className='text-xs font-bold text-stone-700 leading-none mb-0.5'>
              {user?.name || "Traveler"}
            </p>
            <p className='text-[10px] text-stone-400 capitalize'>
              {user?.role || "Customer"}
            </p>
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
              <p className='font-bold text-stone-800 text-sm'>{user?.name}</p>
              <p className='text-xs text-stone-400 truncate'>{user?.email}</p>
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
    </header>
  );
};

// ─── Custom Tooltip ───────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className='bg-[#1C1107] text-white px-3 py-2 rounded-xl text-xs shadow-xl'>
      <p className='text-white/50 mb-1'>{label}</p>
      <p className='font-black text-amber-400'>${payload[0].value}</p>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────
const CustomerDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [u, b, f] = await Promise.all([
          userService.getMe(),
          bookingService.getMyBookings(),
          tourService.getFavorites(),
        ]);
        setUser(u);
        setBookings((b?.data || b || []).length ? b?.data || b : MOCK_BOOKINGS);
        setFavorites(
          (f?.data || f || []).length ? f?.data || f : MOCK_FAVORITES
        );
      } catch {
        setUser({
          name: "Karim Benali",
          email: "karim@example.com",
          role: "customer",
        });
        setBookings(MOCK_BOOKINGS);
        setFavorites(MOCK_FAVORITES);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Stats
  const totalSpent = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + Number(b.total_price || 0), 0);
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const upcoming = bookings.filter((b) =>
    ["confirmed", "pending"].includes(b.status)
  );
  const recent = [...bookings]
    .sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date))
    .slice(0, 4);
  const justBooked = bookings.filter((b) => b.status === "pending").slice(0, 2);

  const sidebarWidth = collapsed ? 72 : 256;

  return (
    <div
      className={`min-h-screen bg-stone-100 `}
    >
      {/* Main content */}
      <main className='pt-0 min-h-screen transition-all duration-300'>
        <div className='p-2 md:p-8 max-w-[1400px] space-y-2'>
          {/* ── Welcome banner ─────────────────────────── */}
          <div className='relative bg-[#1C1107] rounded-2xl overflow-hidden p-7 flex flex-col md:flex-row md:items-center justify-between gap-6'>
            <div
              className='absolute inset-0 opacity-[0.04]'
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className='absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-[80px] pointer-events-none' />
            <div className='relative z-10'>
              <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-2'>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h1
                className='text-2xl md:text-3xl font-black text-white mb-1'
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Welcome back, {user?.name?.split(" ")[0] || "Traveler"} 👋
              </h1>
              <p className='text-stone-400 text-sm'>
                Here's what's happening with your adventures.
              </p>
            </div>
            <div className='relative z-10 flex items-center gap-3 shrink-0'>
              <Link
                to='/tours'
                className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-5 py-2.5 rounded-xl shadow-lg shadow-amber-900/30'
              >
                <i className='fa fa-compass text-xs' /> Explore Tours
              </Link>
            </div>
          </div>

          {/* ── Stat cards ─────────────────────────────── */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
            {[
              {
                icon: "fa-suitcase-rolling",
                label: "Total Bookings",
                value: bookings.length,
                sub: "All time",
                color: "from-amber-400 to-orange-500",
                ring: "ring-amber-200",
              },
              {
                icon: "fa-check-circle",
                label: "Confirmed",
                value: confirmed,
                sub: "Active tours",
                color: "from-emerald-400 to-teal-500",
                ring: "ring-emerald-200",
              },
              {
                icon: "fa-flag-checkered",
                label: "Completed",
                value: completed,
                sub: "Tours finished",
                color: "from-blue-400 to-indigo-500",
                ring: "ring-blue-200",
              },
              {
                icon: "fa-dollar-sign",
                label: "Total Spent",
                value: `$${totalSpent.toLocaleString()}`,
                sub: "Excl. cancelled",
                color: "from-rose-400 to-pink-500",
                ring: "ring-rose-200",
              },
            ].map((s) => (
              <div
                key={s.label}
                className='bg-white rounded-2xl border border-stone-100 p-5 hover:shadow-lg hover:shadow-stone-200/60 transition-all group'
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-md ring-4 ${s.ring} group-hover:scale-105 transition-transform`}
                >
                  <i className={`fa ${s.icon} text-white text-sm`} />
                </div>
                <p className='text-2xl font-black text-stone-800 mb-0.5'>
                  {loading ? <Sk className='h-7 w-16 inline-block' /> : s.value}
                </p>
                <p className='text-sm font-semibold text-stone-600'>
                  {s.label}
                </p>
                <p className='text-xs text-stone-400 mt-0.5'>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Charts row ─────────────────────────────── */}
          <div className='grid lg:grid-cols-3 gap-6'>
            {/* Spending area chart */}
            <div className='lg:col-span-2 bg-white rounded-2xl border border-stone-100 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-1'>
                    Spending Overview
                  </p>
                  <h3 className='font-black text-stone-800 text-lg'>
                    Monthly Spend
                  </h3>
                </div>
                <span className='text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl'>
                  Last 6 months
                </span>
              </div>
              <ResponsiveContainer width='100%' height={200}>
                <AreaChart
                  data={SPENDING_DATA}
                  margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
                >
                  <defs>
                    <linearGradient id='spendGrad' x1='0' y1='0' x2='0' y2='1'>
                      <stop
                        offset='5%'
                        stopColor='#F59E0B'
                        stopOpacity={0.25}
                      />
                      <stop offset='95%' stopColor='#F59E0B' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='#f1ede8'
                    vertical={false}
                  />
                  <XAxis
                    dataKey='month'
                    tick={{ fontSize: 11, fill: "#a8a29e" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#a8a29e" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type='monotone'
                    dataKey='amount'
                    stroke='#F59E0B'
                    strokeWidth={2.5}
                    fill='url(#spendGrad)'
                    dot={{ fill: "#F59E0B", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: "#F59E0B" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category pie */}
            <div className='bg-white rounded-2xl border border-stone-100 p-6'>
              <div className='mb-6'>
                <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-1'>
                  Breakdown
                </p>
                <h3 className='font-black text-stone-800 text-lg'>
                  Tour Categories
                </h3>
              </div>
              <ResponsiveContainer width='100%' height={140}>
                <PieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    cx='50%'
                    cy='50%'
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey='value'
                  >
                    {CATEGORY_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className='space-y-2 mt-3'>
                {CATEGORY_DATA.map((c) => (
                  <div
                    key={c.name}
                    className='flex items-center justify-between text-xs'
                  >
                    <div className='flex items-center gap-2'>
                      <span
                        className='w-2.5 h-2.5 rounded-full shrink-0'
                        style={{ background: c.color }}
                      />
                      <span className='text-stone-500'>{c.name}</span>
                    </div>
                    <span className='font-bold text-stone-700'>{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bottom grid ────────────────────────────── */}
          <div className='grid lg:grid-cols-3 gap-6'>
            {/* Recent bookings */}
            <div className='lg:col-span-2 bg-white rounded-2xl border border-stone-100 overflow-hidden'>
              <div className='flex items-center justify-between px-6 py-5 border-b border-stone-100'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-0.5'>
                    History
                  </p>
                  <h3 className='font-black text-stone-800'>Recent Bookings</h3>
                </div>
                <Link
                  to='/my-bookings'
                  className='text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors'
                >
                  View all <i className='fa fa-arrow-right text-[10px]' />
                </Link>
              </div>
              <div className='divide-y divide-stone-50'>
                {loading
                  ? [...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className='flex items-center gap-4 px-6 py-4'
                      >
                        <Sk className='w-12 h-12 rounded-xl shrink-0' />
                        <div className='flex-1 space-y-2'>
                          <Sk className='h-3 w-2/3' />
                          <Sk className='h-3 w-1/3' />
                        </div>
                      </div>
                    ))
                  : recent.map((b) => (
                      <div
                        key={b.id}
                        className='flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors group'
                      >
                        <div className='w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0'>
                          {b.tour?.cover_image ? (
                            <img
                              src={b.tour.cover_image}
                              alt={b.tour?.title}
                              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center text-stone-300'>
                              <i className='fa fa-image text-sm' />
                            </div>
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-bold text-stone-800 truncate'>
                            {b.tour?.title}
                          </p>
                          <p className='text-xs text-amber-600 flex items-center gap-1 mt-0.5'>
                            <i className='fa fa-map-marker-alt text-[10px]' />{" "}
                            {b.tour?.destination}
                          </p>
                        </div>
                        <div className='text-right shrink-0'>
                          <p className='text-sm font-black text-stone-800 mb-1'>
                            ${Number(b.total_price).toLocaleString()}
                          </p>
                          <Badge status={b.status} />
                        </div>
                      </div>
                    ))}
              </div>
            </div>

            {/* Right column */}
            <div className='space-y-6'>
              {/* Just booked */}
              <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
                <div className='px-5 py-4 border-b border-stone-100'>
                  <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-0.5'>
                    New
                  </p>
                  <h3 className='font-black text-stone-800 text-sm'>
                    Just Booked
                  </h3>
                </div>
                {loading ? (
                  <div className='p-4 space-y-3'>
                    {[...Array(2)].map((_, i) => (
                      <Sk key={i} className='h-16 rounded-xl' />
                    ))}
                  </div>
                ) : justBooked.length === 0 ? (
                  <div className='px-5 py-8 text-center'>
                    <i className='fa fa-calendar-plus text-3xl text-stone-200 mb-2 block' />
                    <p className='text-xs text-stone-400'>
                      No pending bookings
                    </p>
                  </div>
                ) : (
                  <div className='p-3 space-y-2'>
                    {justBooked.map((b) => (
                      <div
                        key={b.id}
                        className='flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100'
                      >
                        <div className='w-10 h-10 rounded-xl overflow-hidden bg-stone-100 shrink-0'>
                          {b.tour?.cover_image ? (
                            <img
                              src={b.tour.cover_image}
                              alt=''
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center'>
                              <i className='fa fa-image text-stone-300 text-xs' />
                            </div>
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-xs font-bold text-stone-800 truncate'>
                            {b.tour?.title}
                          </p>
                          <p className='text-[10px] text-amber-600 font-semibold'>
                            Awaiting confirmation
                          </p>
                        </div>
                        <span className='text-xs font-black text-amber-600'>
                          ${b.total_price}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming tours */}
              <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
                <div className='px-5 py-4 border-b border-stone-100'>
                  <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-0.5'>
                    Next Up
                  </p>
                  <h3 className='font-black text-stone-800 text-sm'>
                    Upcoming Tours
                  </h3>
                </div>
                {loading ? (
                  <div className='p-4 space-y-3'>
                    {[...Array(2)].map((_, i) => (
                      <Sk key={i} className='h-16 rounded-xl' />
                    ))}
                  </div>
                ) : upcoming.length === 0 ? (
                  <div className='px-5 py-8 text-center'>
                    <i className='fa fa-map-marked-alt text-3xl text-stone-200 mb-2 block' />
                    <p className='text-xs text-stone-400 mb-3'>
                      No upcoming tours
                    </p>
                    <Link
                      to='/tours'
                      className='text-xs font-bold text-amber-600 hover:text-amber-700'
                    >
                      Browse tours →
                    </Link>
                  </div>
                ) : (
                  <div className='p-3 space-y-2'>
                    {upcoming.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        className='flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors'
                      >
                        <div className='w-10 h-10 rounded-xl overflow-hidden bg-stone-100 shrink-0'>
                          {b.tour?.cover_image ? (
                            <img
                              src={b.tour.cover_image}
                              alt=''
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center'>
                              <i className='fa fa-image text-stone-300 text-xs' />
                            </div>
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-xs font-bold text-stone-800 truncate'>
                            {b.tour?.title}
                          </p>
                          <p className='text-[10px] text-stone-400 mt-0.5'>
                            <i className='fa fa-calendar mr-1 text-[9px]' />
                            {b.booking_date
                              ? new Date(b.booking_date).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" }
                                )
                              : "—"}
                          </p>
                        </div>
                        <Badge status={b.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Favorites row ───────────────────────────── */}
          <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
            <div className='flex items-center justify-between px-6 py-5 border-b border-stone-100'>
              <div>
                <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-0.5'>
                  Saved
                </p>
                <h3 className='font-black text-stone-800'>Favorite Tours</h3>
              </div>
              <Link
                to='/tours'
                className='text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors'
              >
                Explore more <i className='fa fa-arrow-right text-[10px]' />
              </Link>
            </div>
            <div className='p-5 grid grid-cols-1 sm:grid-cols-3 gap-4'>
              {loading
                ? [...Array(3)].map((_, i) => (
                    <Sk key={i} className='h-44 rounded-xl' />
                  ))
                : favorites.slice(0, 3).map((t) => (
                    <Link
                      key={t.id}
                      to={`/tours/${t.id}`}
                      className='group relative rounded-xl overflow-hidden h-44 bg-stone-100 block'
                    >
                      {t.cover_image && (
                        <img
                          src={t.cover_image}
                          alt={t.title}
                          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                        />
                      )}
                      <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent' />
                      <div className='absolute top-3 right-3 w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center shadow-lg'>
                        <i className='fa fa-heart text-white text-[10px]' />
                      </div>
                      <div className='absolute bottom-0 left-0 right-0 p-3'>
                        <p className='text-white font-bold text-xs line-clamp-1 mb-0.5'>
                          {t.title}
                        </p>
                        <div className='flex items-center justify-between'>
                          <p className='text-white/60 text-[10px] flex items-center gap-1'>
                            <i className='fa fa-map-marker-alt text-[9px]' />
                            {t.destination}
                          </p>
                          <p className='text-amber-400 font-black text-xs'>
                            ${t.price}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>

          {/* ── Bar chart ───────────────────────────────── */}
          <div className='bg-white rounded-2xl border border-stone-100 p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-1'>
                  Activity
                </p>
                <h3 className='font-black text-stone-800 text-lg'>
                  Booking Activity
                </h3>
              </div>
              <span className='text-xs font-bold text-stone-400 bg-stone-100 px-3 py-1.5 rounded-xl'>
                2026
              </span>
            </div>
            <ResponsiveContainer width='100%' height={180}>
              <BarChart
                data={SPENDING_DATA}
                margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='#f1ede8'
                  vertical={false}
                />
                <XAxis
                  dataKey='month'
                  tick={{ fontSize: 11, fill: "#a8a29e" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#a8a29e" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey='amount'
                  fill='#F59E0B'
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
