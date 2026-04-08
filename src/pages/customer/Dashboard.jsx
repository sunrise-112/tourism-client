import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import renderImage from "../../utils/renderImage";
import statsService from "../../services/statsService";
import getCurrentMonthRange from "../../utils/getCurrentMonthRange";
import DateRangePicker from "../../common/DateRangePicker";

// ─── Helpers ──────────────────────────────────────────────────
const STATUS_KEYS = {
  confirmed: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  cancelled: {
    bg: "bg-red-100",
    text: "text-red-600",
    dot: "bg-red-400",
  },
  completed: {
    bg: "bg-stone-100",
    text: "text-stone-500",
    dot: "bg-stone-400",
  },
};

const Badge = ({ status }) => {
  const { t } = useTranslation();
  const s = STATUS_KEYS[status] || STATUS_KEYS.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {t(`customerDashboard.status.${status}`, { defaultValue: status })}
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

const Delta = ({ current, previous }) => {
  if (previous == null || previous === 0) return null;
  const diff = current - previous;
  const pct = Math.round((diff / previous) * 100);
  const up = diff >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
        up ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
      }`}
    >
      <i className={`fa fa-arrow-${up ? "up" : "down"} text-[8px]`} />
      {Math.abs(pct)}%
    </span>
  );
};

// ─── Topbar ───────────────────────────────────────────────────
const Topbar = ({ user, collapsed, mobileOpen, setMobileOpen }) => {
  const { t } = useTranslation();
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
      icon: "fa-check-circle",
      color: "text-emerald-500",
      text: t("customerDashboard.topbar.notif1"),
      time: t("customerDashboard.topbar.notif1Time"),
    },
    {
      icon: "fa-tag",
      color: "text-amber-500",
      text: t("customerDashboard.topbar.notif2"),
      time: t("customerDashboard.topbar.notif2Time"),
    },
    {
      icon: "fa-star",
      color: "text-blue-400",
      text: t("customerDashboard.topbar.notif3"),
      time: t("customerDashboard.topbar.notif3Time"),
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
      <button
        className='lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors'
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <i className={`fa ${mobileOpen ? "fa-times" : "fa-bars"} text-sm`} />
      </button>

      <div className='hidden sm:flex items-center gap-2 text-sm'>
        <span className='text-stone-400'>
          {t("customerDashboard.topbar.breadcrumbDashboard")}
        </span>
        <i className='fa fa-chevron-right text-stone-300 text-[10px]' />
        <span className='font-semibold text-stone-700'>
          {t("customerDashboard.topbar.breadcrumbOverview")}
        </span>
      </div>

      <div className='flex-1' />

      <div className='hidden md:flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 w-48'>
        <i className='fa fa-search text-stone-300 text-xs' />
        <input
          placeholder={t("customerDashboard.topbar.searchPlaceholder")}
          className='bg-transparent text-xs outline-none text-stone-500 placeholder-stone-300 w-full'
        />
      </div>

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
              <p className='font-bold text-stone-800 text-sm'>
                {t("customerDashboard.topbar.notifications")}
              </p>
              <span className='text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full'>
                {NOTIFS.length} {t("customerDashboard.topbar.newBadge")}
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
                {t("customerDashboard.topbar.viewAllNotifications")}
              </button>
            </div>
          </div>
        )}
      </div>

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
              {user?.name || t("customerDashboard.topbar.defaultName")}
            </p>
            <p className='text-[10px] text-stone-400 capitalize'>
              {user?.role || t("customerDashboard.topbar.defaultRole")}
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
              {
                icon: "fa-user",
                label: t("customerDashboard.topbar.myProfile"),
                path: "/profile/me",
              },
              {
                icon: "fa-suitcase",
                label: t("customerDashboard.topbar.myBookings"),
                path: "/my-bookings",
              },
              {
                icon: "fa-heart",
                label: t("customerDashboard.topbar.favorites"),
                path: "/favorites",
              },
              {
                icon: "fa-cog",
                label: t("customerDashboard.topbar.settings"),
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
                onClick={() => {
                  setDropOpen(false);
                  navigate("/login");
                }}
                className='w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-sm text-red-500 hover:text-red-600'
              >
                <i className='fa fa-sign-out-alt text-xs w-4 text-center' />
                {t("customerDashboard.topbar.signOut")}
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

const toChartData = (monthlyBreakdown = []) =>
  monthlyBreakdown.map((m) => ({
    month: m.month?.slice(0, 3) ?? "—",
    fullMonth: m.month,
    amount: Number(m.spent ?? 0),
    bookings: Number(m.bookings ?? 0),
    people: Number(m.people ?? 0),
  }));

// ─── Main Dashboard ───────────────────────────────────────────
const CustomerDashboard = () => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const { start, end } = getCurrentMonthRange();
  const [dateRange, setDateRange] = useState({
    startDate: start,
    endDate: end,
  });
  const [compareDateRange, setCompareDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const handleRangeSelect = (range) => setDateRange(range);
  const handleCompareDateSelect = (range) => setCompareDateRange(range);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const fetchedUser = await userService.getMe();
        setUser(fetchedUser);
        const fetchedBookings = await bookingService.getMyBookings();
        setBookings(fetchedBookings);
        const fetchedStats = await statsService.getCustomerStats({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          compareStartDate: dateRange.compareStartDate,
          compareEndDate: dateRange.compareEndDate,
        });
        setStats(fetchedStats);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [dateRange, compareDateRange]);

  const primary = stats?.primaryStats ?? {};
  const compare = stats?.compareStats ?? null;

  const totalBookings = primary.totalBookings ?? 0;
  const confirmedCount = primary.confirmedBookings ?? 0;
  const completedCount = primary.totalBookings
    ? totalBookings -
      (primary.pendingBookings ?? 0) -
      (primary.cancelledBookings ?? 0) -
      confirmedCount
    : 0;
  const totalSpent = Number(primary.totalSpent ?? 0);
  const avgSpend = Number(primary.avgSpend ?? 0);
  const totalPeople = primary.totalPeople ?? 0;
  const mostActiveMonth = primary.mostActiveMonth ?? null;
  const recentBookings = primary.recentBookings ?? [];
  const chartData = toChartData(primary.monthlyBreakdown);

  const cmp = compare
    ? {
        totalBookings: compare.totalBookings ?? 0,
        totalSpent: Number(compare.totalSpent ?? 0),
        confirmedBookings: compare.confirmedBookings ?? 0,
      }
    : null;

  const upcoming = bookings.filter((b) =>
    ["confirmed", "pending"].includes(b.status)
  );
  const justBooked = bookings.filter((b) => b.status === "pending").slice(0, 2);
  const recent =
    recentBookings.length > 0
      ? recentBookings
      : [...bookings]
          .sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date))
          .slice(0, 4);

  return (
    <div className='min-h-screen bg-stone-100'>
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
                {t("customerDashboard.banner.welcome", {
                  name:
                    user?.name?.split(" ")[0] ||
                    t("customerDashboard.banner.defaultTraveler"),
                })}{" "}
                👋
              </h1>
              <p className='text-stone-400 text-sm'>
                {t("customerDashboard.banner.subtitle")}
              </p>
              {mostActiveMonth && (
                <p className='text-stone-500 text-xs mt-1'>
                  <i className='fa fa-fire text-amber-400 mr-1' />
                  {t("customerDashboard.banner.mostActiveMonth")}{" "}
                  <span className='text-amber-400 font-bold'>
                    {mostActiveMonth.month}
                  </span>{" "}
                  — ${Number(mostActiveMonth.spent).toLocaleString()}{" "}
                  {t("customerDashboard.banner.spent")}
                </p>
              )}
            </div>
            <div className='relative z-10 flex items-center gap-3 shrink-0'>
              <Link
                to='/tours'
                className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-5 py-2.5 rounded-xl shadow-lg shadow-amber-900/30'
              >
                <i className='fa fa-compass text-xs' />{" "}
                {t("customerDashboard.banner.exploreTours")}
              </Link>
            </div>
          </div>

          {/* ── Date range picker ──────────────────────── */}
          <DateRangePicker
            setRangeSelect={handleRangeSelect}
            setCompareDateRange={handleCompareDateSelect}
            dateRange={dateRange}
            enableCompare
          />

          {/* ── Stat cards ─────────────────────────────── */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
            {[
              {
                icon: "fa-suitcase-rolling",
                label: t("customerDashboard.kpi.totalBookings"),
                value: totalBookings,
                compareValue: cmp?.totalBookings,
                sub: t("customerDashboard.kpi.travellers", {
                  count: totalPeople,
                  s: totalPeople !== 1 ? "s" : "",
                }),
                color: "from-amber-400 to-orange-500",
                ring: "ring-amber-200",
              },
              {
                icon: "fa-check-circle",
                label: t("customerDashboard.kpi.confirmed"),
                value: confirmedCount,
                compareValue: cmp?.confirmedBookings,
                sub: t("customerDashboard.kpi.activeTours"),
                color: "from-emerald-400 to-teal-500",
                ring: "ring-emerald-200",
              },
              {
                icon: "fa-flag-checkered",
                label: t("customerDashboard.kpi.completed"),
                value: completedCount,
                compareValue: null,
                sub: t("customerDashboard.kpi.toursFinished"),
                color: "from-blue-400 to-indigo-500",
                ring: "ring-blue-200",
              },
              {
                icon: "fa-dollar-sign",
                label: t("customerDashboard.kpi.totalSpent"),
                value: `$${totalSpent.toLocaleString()}`,
                rawValue: totalSpent,
                compareValue: cmp?.totalSpent,
                sub: avgSpend
                  ? t("customerDashboard.kpi.avgPerBooking", {
                      value: Number(avgSpend).toLocaleString(),
                    })
                  : t("customerDashboard.kpi.exclCancelled"),
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
                <div className='flex items-center gap-2 mb-0.5'>
                  <p className='text-2xl font-black text-stone-800'>
                    {loading ? (
                      <Sk className='h-7 w-16 inline-block' />
                    ) : (
                      s.value
                    )}
                  </p>
                  {!loading && cmp && s.compareValue != null && (
                    <Delta
                      current={
                        s.rawValue ??
                        (typeof s.value === "number" ? s.value : null)
                      }
                      previous={s.compareValue}
                    />
                  )}
                </div>
                <p className='text-sm font-semibold text-stone-600'>
                  {s.label}
                </p>
                <p className='text-xs text-stone-400 mt-0.5'>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Charts row ─────────────────────────────── */}
          <div className='grid lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2 bg-white rounded-2xl border border-stone-100 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-1'>
                    {t("customerDashboard.charts.spendingOverview")}
                  </p>
                  <h3 className='font-black text-stone-800 text-lg'>
                    {t("customerDashboard.charts.monthlySpend")}
                  </h3>
                </div>
                <span className='text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl'>
                  {chartData.length > 0
                    ? `${chartData[0].fullMonth} – ${
                        chartData[chartData.length - 1].fullMonth
                      }`
                    : t("customerDashboard.charts.selectedRange")}
                </span>
              </div>
              <ResponsiveContainer width='100%' height={200}>
                <AreaChart
                  data={chartData}
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

            <div className='bg-white rounded-2xl border border-stone-100 p-6'>
              <div className='mb-6'>
                <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-1'>
                  {t("customerDashboard.charts.breakdown")}
                </p>
                <h3 className='font-black text-stone-800 text-lg'>
                  {t("customerDashboard.charts.monthlyActivity")}
                </h3>
              </div>
              <ResponsiveContainer width='100%' height={140}>
                <PieChart>
                  <Pie
                    data={
                      chartData.length > 0
                        ? chartData.map((d) => ({
                            name: d.month,
                            value: d.amount,
                          }))
                        : [
                            {
                              name: t("customerDashboard.charts.noData"),
                              value: 1,
                            },
                          ]
                    }
                    cx='50%'
                    cy='50%'
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey='value'
                  >
                    {chartData.map((_, i) => {
                      const COLORS = [
                        "#F59E0B",
                        "#FB923C",
                        "#FBBF24",
                        "#FDE68A",
                        "#FCA5A1",
                        "#6EE7B7",
                      ];
                      return <Cell key={i} fill={COLORS[i % COLORS.length]} />;
                    })}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`$${v}`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className='space-y-2 mt-3'>
                {chartData.length > 0 ? (
                  chartData.map((d, i) => {
                    const COLORS = [
                      "#F59E0B",
                      "#FB923C",
                      "#FBBF24",
                      "#FDE68A",
                      "#FCA5A1",
                      "#6EE7B7",
                    ];
                    return (
                      <div
                        key={d.month}
                        className='flex items-center justify-between text-xs'
                      >
                        <div className='flex items-center gap-2'>
                          <span
                            className='w-2.5 h-2.5 rounded-full shrink-0'
                            style={{ background: COLORS[i % COLORS.length] }}
                          />
                          <span className='text-stone-500'>{d.fullMonth}</span>
                        </div>
                        <span className='font-bold text-stone-700'>
                          ${d.amount.toLocaleString()}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className='text-xs text-stone-400 text-center py-2'>
                    {t("customerDashboard.charts.noDataPeriod")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Bottom grid ────────────────────────────── */}
          <div className='grid lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2 bg-white rounded-2xl border border-stone-100 overflow-hidden'>
              <div className='flex items-center justify-between px-6 py-5 border-b border-stone-100'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-0.5'>
                    {t("customerDashboard.bookings.history")}
                  </p>
                  <h3 className='font-black text-stone-800'>
                    {t("customerDashboard.bookings.recentBookings")}
                  </h3>
                </div>
                <Link
                  to='/my-bookings'
                  className='text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors'
                >
                  {t("customerDashboard.bookings.viewAll")}{" "}
                  <i className='fa fa-arrow-right text-[10px]' />
                </Link>
              </div>
              <div className='divide-y divide-stone-50'>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className='flex items-center gap-4 px-6 py-4'>
                      <Sk className='w-12 h-12 rounded-xl shrink-0' />
                      <div className='flex-1 space-y-2'>
                        <Sk className='h-3 w-2/3' />
                        <Sk className='h-3 w-1/3' />
                      </div>
                    </div>
                  ))
                ) : recent.length === 0 ? (
                  <div className='px-6 py-10 text-center'>
                    <i className='fa fa-suitcase text-3xl text-stone-200 mb-2 block' />
                    <p className='text-xs text-stone-400'>
                      {t("customerDashboard.bookings.noBookings")}
                    </p>
                  </div>
                ) : (
                  recent.map((b) => (
                    <div
                      key={b.id}
                      className='flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors group'
                    >
                      <div className='w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0'>
                        {b.tour_cover_image ? (
                          <img
                            src={renderImage(b.tour_cover_image)}
                            alt={b.tour_title}
                            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50'>
                            <i className='fa fa-map-marked-alt text-amber-300 text-sm' />
                          </div>
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-bold text-stone-800 truncate'>
                          {b.tour_title ??
                            `${t("customerDashboard.bookings.bookingPrefix")}${
                              b.id
                            }`}
                        </p>
                        <p className='text-xs text-stone-400 flex items-center gap-1 mt-0.5'>
                          <i className='fa fa-calendar text-[10px]' />
                          {b.booking_date
                            ? new Date(b.booking_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                          {b.num_people && (
                            <span className='ml-2 text-stone-400'>
                              <i className='fa fa-user text-[10px] mr-0.5' />
                              {b.num_people}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className='text-right shrink-0'>
                        <p className='text-sm font-black text-stone-800 mb-1'>
                          ${Number(b.total_price).toLocaleString()}
                        </p>
                        <Badge status={b.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right column */}
            <div className='space-y-6'>
              {/* Just booked */}
              <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
                <div className='px-5 py-4 border-b border-stone-100'>
                  <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-0.5'>
                    {t("customerDashboard.justBooked.new")}
                  </p>
                  <h3 className='font-black text-stone-800 text-sm'>
                    {t("customerDashboard.justBooked.title")}
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
                      {t("customerDashboard.justBooked.empty")}
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
                          {b.tour_cover_image ? (
                            <img
                              src={renderImage(b.tour_cover_image)}
                              alt=''
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50'>
                              <i className='fa fa-map-marked-alt text-amber-300 text-xs' />
                            </div>
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-xs font-bold text-stone-800 truncate'>
                            {b.tour_title ??
                              `${t(
                                "customerDashboard.bookings.bookingPrefix"
                              )}${b.id}`}
                          </p>
                          <p className='text-[10px] text-amber-600 font-semibold'>
                            {t(
                              "customerDashboard.justBooked.awaitingConfirmation"
                            )}
                          </p>
                        </div>
                        <span className='text-xs font-black text-amber-600'>
                          ${Number(b.total_price).toLocaleString()}
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
                    {t("customerDashboard.upcoming.nextUp")}
                  </p>
                  <h3 className='font-black text-stone-800 text-sm'>
                    {t("customerDashboard.upcoming.title")}
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
                      {t("customerDashboard.upcoming.empty")}
                    </p>
                    <Link
                      to='/tours'
                      className='text-xs font-bold text-amber-600 hover:text-amber-700'
                    >
                      {t("customerDashboard.upcoming.browseTours")}
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
                          {b.tour_cover_image ? (
                            <img
                              src={renderImage(b.tour_cover_image)}
                              alt=''
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50'>
                              <i className='fa fa-map-marked-alt text-amber-300 text-xs' />
                            </div>
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-xs font-bold text-stone-800 truncate'>
                            {b.tour_title ??
                              `${t(
                                "customerDashboard.bookings.bookingPrefix"
                              )}${b.id}`}
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

              {/* Period summary */}
              {!loading && primary.firstBookingDate && (
                <div className='bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-5'>
                  <p className='text-xs font-bold uppercase tracking-widest text-amber-500 mb-3'>
                    {t("customerDashboard.summary.title")}
                  </p>
                  <div className='space-y-2'>
                    {[
                      {
                        label: t("customerDashboard.summary.avgSpend"),
                        value: `$${Number(avgSpend).toLocaleString()}`,
                      },
                      {
                        label: t("customerDashboard.summary.totalTravellers"),
                        value: totalPeople,
                      },
                      {
                        label: t("customerDashboard.summary.firstBooking"),
                        value: new Date(
                          primary.firstBookingDate
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }),
                      },
                      {
                        label: t("customerDashboard.summary.lastBooking"),
                        value: new Date(
                          primary.lastBookingDate
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }),
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className='flex items-center justify-between text-xs'
                      >
                        <span className='text-stone-500'>{row.label}</span>
                        <span className='font-bold text-stone-800'>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Favorites row ───────────────────────────── */}
          <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
            <div className='flex items-center justify-between px-6 py-5 border-b border-stone-100'>
              <div>
                <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-0.5'>
                  {t("customerDashboard.favorites.saved")}
                </p>
                <h3 className='font-black text-stone-800'>
                  {t("customerDashboard.favorites.title")}
                </h3>
              </div>
              <Link
                to='/tours'
                className='text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors'
              >
                {t("customerDashboard.favorites.exploreMore")}{" "}
                <i className='fa fa-arrow-right text-[10px]' />
              </Link>
            </div>
            <div className='p-5 grid grid-cols-1 sm:grid-cols-3 gap-4'>
              {loading
                ? [...Array(3)].map((_, i) => (
                    <Sk key={i} className='h-44 rounded-xl' />
                  ))
                : favorites.slice(0, 3).map((fav) => (
                    <Link
                      key={fav.id}
                      to={`/tours/${fav.id}`}
                      className='group relative rounded-xl overflow-hidden h-44 bg-stone-100 block'
                    >
                      {fav.cover_image && (
                        <img
                          src={fav.cover_image}
                          alt={fav.title}
                          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                        />
                      )}
                      <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent' />
                      <div className='absolute top-3 right-3 w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center shadow-lg'>
                        <i className='fa fa-heart text-white text-[10px]' />
                      </div>
                      <div className='absolute bottom-0 left-0 right-0 p-3'>
                        <p className='text-white font-bold text-xs line-clamp-1 mb-0.5'>
                          {fav.title}
                        </p>
                        <div className='flex items-center justify-between'>
                          <p className='text-white/60 text-[10px] flex items-center gap-1'>
                            <i className='fa fa-map-marker-alt text-[9px]' />
                            {fav.destination}
                          </p>
                          <p className='text-amber-400 font-black text-xs'>
                            ${fav.price}
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
                  {t("customerDashboard.activityChart.activity")}
                </p>
                <h3 className='font-black text-stone-800 text-lg'>
                  {t("customerDashboard.activityChart.title")}
                </h3>
              </div>
              <span className='text-xs font-bold text-stone-400 bg-stone-100 px-3 py-1.5 rounded-xl'>
                {chartData.length > 0
                  ? `${chartData[0].fullMonth} – ${
                      chartData[chartData.length - 1].fullMonth
                    }`
                  : t("customerDashboard.charts.selectedRange")}
              </span>
            </div>
            <ResponsiveContainer width='100%' height={180}>
              <BarChart
                data={chartData}
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
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div className='bg-[#1C1107] text-white px-3 py-2 rounded-xl text-xs shadow-xl'>
                        <p className='text-white/50 mb-1'>
                          {d?.fullMonth ?? label}
                        </p>
                        <p className='font-black text-amber-400'>
                          {d?.bookings}{" "}
                          {t("customerDashboard.activityChart.tooltipBooking", {
                            count: d?.bookings,
                          })}
                        </p>
                        <p className='text-white/70'>
                          ${d?.amount?.toLocaleString()}{" "}
                          {t("customerDashboard.activityChart.tooltipSpent")}
                        </p>
                        {d?.people > 0 && (
                          <p className='text-white/50'>
                            {d.people}{" "}
                            {t(
                              "customerDashboard.activityChart.tooltipTraveller",
                              { count: d?.people }
                            )}
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey='bookings'
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
