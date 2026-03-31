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
  LineChart,
  Line,
} from "recharts";
import userService from "../../services/userService";
import bookingService from "../../services/bookingService";
import tourService from "../../services/tourService";
import reviewService from "../../services/reviewService";
import renderImage from "../../utils/renderImage";

// ─── Mock / fallback data ─────────────────────────────────────
const REVENUE_DATA = [
  { month: "Oct", revenue: 1300, bookings: 4 },
  { month: "Nov", revenue: 2800, bookings: 9 },
  { month: "Dec", revenue: 1900, bookings: 6 },
  { month: "Jan", revenue: 4200, bookings: 14 },
  { month: "Feb", revenue: 3600, bookings: 11 },
  { month: "Mar", revenue: 5800, bookings: 18 },
];

const CATEGORY_DATA = [
  { name: "Desert", value: 6, color: "#F59E0B" },
  { name: "Cultural", value: 8, color: "#FB923C" },
  { name: "Trekking", value: 4, color: "#FBBF24" },
  { name: "Coastal", value: 3, color: "#FDE68A" },
  { name: "Adventure", value: 2, color: "#F97316" },
];

// ─── Helpers ──────────────────────────────────────────────────
const STATUS_STYLES = {
  confirmed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-400",
  },
  completed: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

const Avatar = ({ name, src, size = "w-9 h-9", textSize = "text-xs" }) =>
  src ? (
    <img src={src} alt={name} className={`${size} rounded-xl object-cover`} />
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

const StarRating = ({ rating }) => (
  <div className='flex items-center gap-0.5'>
    {[1, 2, 3, 4, 5].map((s) => (
      <i
        key={s}
        className={`fa fa-star text-[9px] ${
          s <= rating ? "text-amber-400" : "text-stone-200"
        }`}
      />
    ))}
  </div>
);

// ─── Topbar ───────────────────────────────────────────────────
const Topbar = ({ user, collapsed, mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropRef = useRef(null);
  const notifRef = useRef(null);

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
      icon: "fa-user-plus",
      color: "text-blue-500",
      text: "New user registered",
      time: "5 min ago",
    },
    {
      icon: "fa-suitcase",
      color: "text-amber-500",
      text: "New booking #1043 received",
      time: "12 min ago",
    },
    {
      icon: "fa-star",
      color: "text-yellow-500",
      text: "3 reviews awaiting approval",
      time: "1hr ago",
    },
    {
      icon: "fa-exclamation-circle",
      color: "text-red-500",
      text: "Booking #1039 cancelled",
      time: "2hr ago",
    },
  ];

  const sidebarWidth = mobileOpen ? 0 : collapsed ? 72 : 256;

  return (
    <header
      className='fixed top-0 right-0 z-20 h-16 bg-white border-b border-stone-100 flex items-center px-4 gap-3'
      style={{
        left: `${sidebarWidth}px`,
        transition: "left 300ms ease",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <button
        className='lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors'
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <i className={`fa ${mobileOpen ? "fa-times" : "fa-bars"} text-sm`} />
      </button>

      <div className='hidden sm:flex items-center gap-2 text-sm'>
        <span className='text-stone-400'>Admin</span>
        <i className='fa fa-chevron-right text-stone-300 text-[10px]' />
        <span className='font-semibold text-stone-700'>Dashboard</span>
      </div>

      <div className='flex-1' />

      {/* Search */}
      <div className='hidden md:flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 w-52'>
        <i className='fa fa-search text-stone-300 text-xs' />
        <input
          placeholder='Search tours, users...'
          className='bg-transparent text-xs outline-none text-stone-500 placeholder-stone-300 w-full'
        />
      </div>

      {/* Quick actions */}
      <Link
        to='/admin/tours/create'
        className='hidden sm:flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-3 py-2 rounded-xl shadow-sm shadow-amber-200'
      >
        <i className='fa fa-plus text-[10px]' /> New Tour
      </Link>

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
          <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full' />
        </button>
        {notifOpen && (
          <div
            className='absolute right-0 top-12 w-76 bg-white rounded-2xl border border-stone-100 shadow-2xl shadow-stone-300/30 overflow-hidden z-50'
            style={{ width: "300px" }}
          >
            <div className='px-4 py-3 border-b border-stone-100 flex items-center justify-between'>
              <p className='font-bold text-stone-800 text-sm'>Notifications</p>
              <span className='text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full'>
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
              {user?.name || "Admin"}
            </p>
            <p className='text-[10px] text-amber-600 font-bold uppercase tracking-widest'>
              Administrator
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
              <p className='text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-0.5'>
                Administrator
              </p>
            </div>
            {[
              { icon: "fa-th-large", label: "Dashboard", path: "/admin" },
              {
                icon: "fa-user-shield",
                label: "My Profile",
                path: "/profile/me",
              },
              { icon: "fa-cog", label: "Settings", path: "/admin/settings" },
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
      {payload.map((p, i) => (
        <p
          key={i}
          className='font-black'
          style={{ color: p.color || "#F59E0B" }}
        >
          {p.name === "revenue" ? `$${p.value}` : p.value}{" "}
          {p.name !== "revenue" && p.name}
        </p>
      ))}
    </div>
  );
};

// ─── Admin Dashboard ──────────────────────────────────────────
const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [tours, setTours] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [u, b, t, r] = await Promise.all([
          userService.getMe(),
          bookingService.getAll({ limit: 5, page: 1 }),
          tourService.getAll({ type: "tour", limit: 4 }),
          reviewService.getAll({ limit: 3, approve: false }),
        ]);

        setUser(u);
        setBookings(b.data);
        setBookingsCount(b?.pagination?.totalItems);
        setTours(t?.data);
        setReviews(r?.data);
        setUserCount(u?.data?.total || 0);
      } catch {
        setUser({
          name: "Admin User",
          email: "admin@maghribtours.com",
          role: "admin",
        });
        setBookings(MOCK_BOOKINGS);
        setTours(MOCK_TOURS);
        setReviews(MOCK_REVIEWS);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

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

  // Derived stats
  const totalRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + Number(b.total_price || 0), 0);
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const pendingReviews = reviews.filter((r) => !r.approved).length;
  const sidebarWidth = mobileOpen ? 0 : collapsed ? 72 : 256;

  return (
    <div
      className='min-h-screen bg-stone-100'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <main className={`min-h-screen bg-stone-100 `}>
        <div className='p-2 md:p-8 max-w-[1400px] space-y-3'>
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
            <div className='absolute top-0 right-0 w-72 h-72 bg-amber-500/15 rounded-full blur-[80px] pointer-events-none' />
            <div className='absolute bottom-0 left-1/3 w-48 h-48 bg-orange-600/10 rounded-full blur-[60px] pointer-events-none' />
            <div className='relative z-10'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-xs font-bold uppercase tracking-[0.2em] text-amber-400'>
                  Admin Panel
                </span>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse' />
                <span className='text-[10px] text-emerald-400 font-semibold'>
                  Live
                </span>
              </div>
              <h1
                className='text-2xl md:text-3xl font-black text-white mb-1'
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Good{" "}
                {new Date().getHours() < 12
                  ? "Morning"
                  : new Date().getHours() < 18
                  ? "Afternoon"
                  : "Evening"}
                , {user?.name?.split(" ")[0] || "Admin"} 👋
              </h1>
              <p className='text-stone-400 text-sm'>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}{" "}
                — Here's your business overview.
              </p>
            </div>
            <div className='relative z-10 flex items-center gap-3 shrink-0 flex-wrap'>
              <Link
                to='/admin/tours/create'
                className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-5 py-2.5 rounded-xl shadow-lg shadow-amber-900/30'
              >
                <i className='fa fa-plus text-xs' /> Add Tour
              </Link>
              <Link
                to='/admin/bookings'
                className='flex items-center gap-2 text-sm font-semibold text-stone-300 hover:text-white border border-white/15 hover:border-white/30 px-5 py-2.5 rounded-xl transition-all'
              >
                <i className='fa fa-suitcase text-xs' /> View Bookings
              </Link>
            </div>
          </div>

          {/* ── KPI Stats ──────────────────────────────── */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
            {[
              {
                icon: "fa-dollar-sign",
                label: "Total Revenue",
                value: loading ? "—" : `$${totalRevenue.toLocaleString()}`,
                sub: "Excl. cancelled",
                color: "from-amber-400 to-orange-500",
                ring: "ring-amber-200",
                trend: "+12%",
                up: true,
              },
              {
                icon: "fa-suitcase",
                label: "Total Bookings",
                value: bookingsCount,
                sub: `${confirmed} confirmed`,
                color: "from-emerald-400 to-teal-500",
                ring: "ring-emerald-200",
                trend: "+8%",
                up: true,
              },
              {
                icon: "fa-map-marked-alt",
                label: "Active Tours",
                value: loading ? "—" : tours.length,
                sub: `${tours.filter((t) => t.is_featured).length} featured`,
                color: "from-blue-400 to-indigo-500",
                ring: "ring-blue-200",
                trend: "+3",
                up: true,
              },
              {
                icon: "fa-star",
                label: "Pending Reviews",
                value: loading ? "—" : pendingReviews,
                sub: "Awaiting approval",
                color: "from-rose-400 to-pink-500",
                ring: "ring-rose-200",
                trend: `${pendingReviews} new`,
                up: false,
              },
            ].map((s) => (
              <div
                key={s.label}
                className='bg-white rounded-2xl border border-stone-100 p-5 hover:shadow-lg hover:shadow-stone-200/60 transition-all group'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md ring-4 ${s.ring} group-hover:scale-105 transition-transform`}
                  >
                    <i className={`fa ${s.icon} text-white text-sm`} />
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      s.up
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    <i
                      className={`fa fa-arrow-${
                        s.up ? "up" : "right"
                      } text-[9px] mr-1`}
                    />
                    {s.trend}
                  </span>
                </div>
                <p className='text-2xl font-black text-stone-800 mb-0.5'>
                  {s.value}
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
            {/* Revenue + Bookings area chart */}
            <div className='lg:col-span-2 bg-white rounded-2xl border border-stone-100 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-1'>
                    Performance
                  </p>
                  <h3 className='font-black text-stone-800 text-lg'>
                    Revenue & Bookings
                  </h3>
                </div>
                <div className='flex items-center gap-4 text-xs text-stone-400'>
                  <span className='flex items-center gap-1.5'>
                    <span className='w-2.5 h-2.5 rounded-full bg-amber-400' />
                    Revenue
                  </span>
                  <span className='flex items-center gap-1.5'>
                    <span className='w-2.5 h-2.5 rounded-full bg-blue-400' />
                    Bookings
                  </span>
                </div>
              </div>
              <ResponsiveContainer width='100%' height={210}>
                <AreaChart
                  data={REVENUE_DATA}
                  margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
                >
                  <defs>
                    <linearGradient id='revGrad' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#F59E0B' stopOpacity={0.2} />
                      <stop offset='95%' stopColor='#F59E0B' stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id='bkGrad' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#60A5FA' stopOpacity={0.2} />
                      <stop offset='95%' stopColor='#60A5FA' stopOpacity={0} />
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
                    dataKey='revenue'
                    stroke='#F59E0B'
                    strokeWidth={2.5}
                    fill='url(#revGrad)'
                    dot={{ fill: "#F59E0B", strokeWidth: 0, r: 3 }}
                  />
                  <Area
                    type='monotone'
                    dataKey='bookings'
                    stroke='#60A5FA'
                    strokeWidth={2}
                    fill='url(#bkGrad)'
                    dot={{ fill: "#60A5FA", strokeWidth: 0, r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown */}
            <div className='bg-white rounded-2xl border border-stone-100 p-6'>
              <div className='mb-5'>
                <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-1'>
                  Breakdown
                </p>
                <h3 className='font-black text-stone-800 text-lg'>
                  Tours by Category
                </h3>
              </div>
              <ResponsiveContainer width='100%' height={150}>
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
              <div className='space-y-2 mt-2'>
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

          {/* ── Middle row ─────────────────────────────── */}
          <div className='grid lg:grid-cols-3 gap-6'>
            {/* Recent bookings */}
            <div className='lg:col-span-2 bg-white rounded-2xl border border-stone-100 overflow-hidden'>
              <div className='flex items-center justify-between px-6 py-5 border-b border-stone-100'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-0.5'>
                    Latest
                  </p>
                  <h3 className='font-black text-stone-800'>Recent Bookings</h3>
                </div>
                <Link
                  to='/admin/bookings'
                  className='text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors'
                >
                  Manage all <i className='fa fa-arrow-right text-[10px]' />
                </Link>
              </div>
              <div className='divide-y divide-stone-50'>
                {loading
                  ? [...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className='flex items-center gap-4 px-6 py-4'
                      >
                        <Sk className='w-12 h-10 rounded-xl shrink-0' />
                        <div className='flex-1 space-y-2'>
                          <Sk className='h-3 w-2/3' />
                          <Sk className='h-3 w-1/3' />
                        </div>
                      </div>
                    ))
                  : bookings.slice(0, 5).map((b) => (
                      <div
                        key={b.id}
                        className='flex items-center gap-4 px-6 py-3.5 hover:bg-stone-50 transition-colors group'
                      >
                        <div className='w-11 h-10 rounded-xl overflow-hidden bg-stone-100 shrink-0'>
                          {b?.tour_cover_image ? (
                            <img
                              src={renderImage(b.tour_cover_image)}
                              alt=''
                              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center text-stone-300'>
                              <i className='fa fa-image text-xs' />
                            </div>
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-bold text-stone-800 truncate'>
                            {b?.tour_title}
                          </p>
                          <p className='text-xs text-stone-400 flex items-center gap-2 mt-0.5'>
                            <span className='flex items-center gap-1 text-amber-600 font-semibold'>
                              <i className='fa fa-map-marker-alt text-[9px]' />
                              {b?.tour_destination}
                            </span>
                            <span>·</span>
                            <span>{b.user_name}</span>
                          </p>
                        </div>
                        <div className='text-right shrink-0'>
                          <p className='text-sm font-black text-stone-800 mb-1'>
                            ${Number(b.total_price).toLocaleString()}
                          </p>
                          <StatusBadge status={b.status} />
                        </div>
                      </div>
                    ))}
              </div>
            </div>

            {/* Right column */}
            <div className='space-y-5'>
              {/* Pending reviews */}
              <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
                <div className='flex items-center justify-between px-5 py-4 border-b border-stone-100'>
                  <div>
                    <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-0.5'>
                      Awaiting
                    </p>
                    <h3 className='font-black text-stone-800 text-sm'>
                      Pending Reviews
                    </h3>
                  </div>
                  <Link
                    to='/admin/reviews'
                    className='text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors'
                  >
                    View all{" "}
                    <i className='fa fa-arrow-right text-[9px] ml-0.5' />
                  </Link>
                </div>
                {loading ? (
                  <div className='p-4 space-y-3'>
                    {[...Array(2)].map((_, i) => (
                      <Sk key={i} className='h-16 rounded-xl' />
                    ))}
                  </div>
                ) : reviews.filter((r) => !r.approved).length === 0 ? (
                  <div className='px-5 py-8 text-center'>
                    <i className='fa fa-check-circle text-3xl text-emerald-200 mb-2 block' />
                    <p className='text-xs text-stone-400'>
                      All reviews approved!
                    </p>
                  </div>
                ) : (
                  <div className='p-3 space-y-2'>
                    {reviews
                      .filter((r) => !r.approved)
                      .map((r) => (
                        <div
                          key={r.id}
                          className='p-3 rounded-xl bg-amber-50 border border-amber-100'
                        >
                          <div className='flex items-start justify-between gap-2 mb-1'>
                            <p className='text-xs font-bold text-stone-700'>
                              {r.user?.name}
                            </p>
                            <StarRating rating={r.rating} />
                          </div>
                          <p className='text-[10px] text-amber-600 font-semibold mb-1 truncate'>
                            {r.tour?.title}
                          </p>
                          <p className='text-xs text-stone-500 line-clamp-1'>
                            {r.comment}
                          </p>
                          <div className='flex gap-2 mt-2'>
                            <Link
                              to='/admin/reviews'
                              className='flex-1 text-center text-[10px] font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 px-2 py-1.5 rounded-lg transition-colors'
                            >
                              Review
                            </Link>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Quick stats panel */}
              <div className='bg-white rounded-2xl border border-stone-100 p-5'>
                <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-4'>
                  Quick Stats
                </p>
                <div className='space-y-3'>
                  {[
                    {
                      label: "Pending bookings",
                      value: pending,
                      color: "text-amber-600",
                    },
                    {
                      label: "Featured tours",
                      value: tours.filter((t) => t.is_featured).length,
                      color: "text-blue-600",
                    },
                    {
                      label: "Hot deals",
                      value: tours.filter((t) => t.is_hot_deal).length,
                      color: "text-red-500",
                    },
                    {
                      label: "Cancellations",
                      value: bookings.filter((b) => b.status === "cancelled")
                        .length,
                      color: "text-stone-500",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className='flex items-center justify-between'
                    >
                      <p className='text-xs text-stone-500'>{s.label}</p>
                      <p className={`text-sm font-black ${s.color}`}>
                        {loading ? "—" : s.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom row ─────────────────────────────── */}
          <div className='grid lg:grid-cols-2 gap-6'>
            {/* Bar chart */}
            <div className='bg-white rounded-2xl border border-stone-100 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-1'>
                    Monthly
                  </p>
                  <h3 className='font-black text-stone-800 text-lg'>
                    Booking Volume
                  </h3>
                </div>
                <span className='text-xs font-bold text-stone-400 bg-stone-100 px-3 py-1.5 rounded-xl'>
                  2026
                </span>
              </div>
              <ResponsiveContainer width='100%' height={180}>
                <BarChart
                  data={REVENUE_DATA}
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
                    dataKey='bookings'
                    fill='#F59E0B'
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top tours */}
            <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
              <div className='flex items-center justify-between px-6 py-5 border-b border-stone-100'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-0.5'>
                    Catalog
                  </p>
                  <h3 className='font-black text-stone-800'>Tour Highlights</h3>
                </div>
                <Link
                  to='/admin/tours'
                  className='text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors'
                >
                  Manage <i className='fa fa-arrow-right text-[10px]' />
                </Link>
              </div>
              <div className='divide-y divide-stone-50'>
                {loading
                  ? [...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className='flex items-center gap-3 px-5 py-3'
                      >
                        <Sk className='w-10 h-9 rounded-xl shrink-0' />
                        <div className='flex-1'>
                          <Sk className='h-3 w-3/4' />
                        </div>
                      </div>
                    ))
                  : tours.slice(0, 4).map((t, i) => (
                      <div
                        key={t.id}
                        className='flex items-center gap-4 px-5 py-3 hover:bg-stone-50 transition-colors group'
                      >
                        <span className='text-xs font-black text-stone-300 w-4 shrink-0'>
                          {i + 1}
                        </span>
                        <div className='w-10 h-9 rounded-xl overflow-hidden bg-stone-100 shrink-0'>
                          {t.cover_image ? (
                            <img
                              src={renderImage(t.cover_image)}
                              alt=''
                              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center text-stone-300'>
                              <i className='fa fa-image text-xs' />
                            </div>
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-xs font-bold text-stone-700 truncate'>
                            {t.title}
                          </p>
                          <p className='text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-0.5'>
                            <i className='fa fa-map-marker-alt text-[9px]' />
                            {t.destination}
                          </p>
                        </div>
                        <div className='text-right shrink-0'>
                          <p className='text-sm font-black text-amber-600'>
                            ${t.price}
                          </p>
                          <div className='flex gap-1 mt-0.5 justify-end'>
                            {t.is_featured && (
                              <span className='text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold'>
                                Featured
                              </span>
                            )}
                            {t.is_hot_deal && (
                              <span className='text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold'>
                                Hot
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
