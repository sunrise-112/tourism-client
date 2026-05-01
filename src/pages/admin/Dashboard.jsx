import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import userService from "../../services/userService";
import bookingService from "../../services/bookingService";
import tourService from "../../services/tourService";
import reviewService from "../../services/reviewService";
import statsService from "../../services/statsService";
import renderImage from "../../utils/renderImage";
import DateRangePicker from "../../common/DateRangePicker";
import getCurrentMonthRange from "../../utils/getCurrentMonthRange";

const NAT_COLORS = [
  "#F59E0B",
  "#FB923C",
  "#FBBF24",
  "#FDE68A",
  "#F97316",
  "#EF4444",
  "#10B981",
  "#60A5FA",
  "#A78BFA",
  "#F472B6",
];

const delta = (primary, compare) => {
  if (compare == null || compare === 0) return null;
  const pct = ((primary - compare) / Math.abs(compare)) * 100;
  return {
    pct: Math.abs(pct).toFixed(1),
    up: pct >= 0,
    color: pct >= 0 ? "text-emerald-600" : "text-red-500",
    bg: pct >= 0 ? "bg-emerald-50" : "bg-red-50",
    arrow: pct >= 0 ? "fa-arrow-up" : "fa-arrow-down",
  };
};

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
  const { t } = useTranslation();
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {t(`dashboard.status.${status}`, {
        defaultValue: status?.charAt(0).toUpperCase() + status?.slice(1),
      })}
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

const DeltaBadge = ({ primary, compare, formatter = (v) => v }) => {
  const { t } = useTranslation();
  const d = delta(primary, compare);
  if (!d) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${d.bg} ${d.color}`}
    >
      <i className={`fa ${d.arrow} text-[8px]`} />
      {d.pct}%
      <span className='font-normal opacity-60'>
        {t("dashboard.delta.vs")} {formatter(compare)}
      </span>
    </span>
  );
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const fmt = (name, value) => {
    if (name === "revenue" || name === "cmpRevenue")
      return `$${Number(value).toLocaleString()}`;
    return value;
  };
  return (
    <div className='bg-[#1C1107] text-white px-3 py-2 rounded-xl text-xs shadow-xl'>
      <p className='text-white/50 mb-1'>{label}</p>
      {payload.map((p, i) => (
        <p
          key={i}
          className='font-black'
          style={{ color: p.color || "#F59E0B" }}
        >
          {fmt(p.name, p.value)}{" "}
          <span className='font-normal opacity-60'>{p.name}</span>
        </p>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [tours, setTours] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
        const u = await userService.getMe();
        setUser(u);
        const b = await bookingService.getAll({ limit: 5, page: 1 });
        setBookings(b.data);
        setBookingsCount(b?.pagination?.totalItems);
        const t = await tourService.getAll({ type: "tour", limit: 4 });
        setTours(t?.data);
        const r = await reviewService.getAll({ limit: 3, approve: false });
        setReviews(r?.data);
        const s = await statsService.getAdminStats({
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate,
          compareStartDate: compareDateRange?.startDate,
          compareEndDate: compareDateRange?.endDate,
        });
        setStats(s?.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [dateRange, compareDateRange]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setMobileOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const ps = stats?.primaryStats;
  const cs = stats?.compareStats;
  const hasCompare = !!cs;

  const totalRevenue = ps?.totalRevenue ?? 0;
  const confirmedRevenue = ps?.confirmedRevenue || 0;
  const confirmedCount = ps?.confirmedBookings ?? 0;
  const pendingCount = ps?.pendingBookings ?? 0;
  const cancelledCount = ps?.cancelledBookings ?? 0;
  const totalBookings = ps?.totalBookings ?? bookingsCount;
  const avgValue = ps?.avgBookingValue ?? 0;
  const totalPeople = ps?.totalPeople ?? 0;
  const topTours = ps?.topTours ?? [];

  const nationalityData = (ps?.nationalityBreakdown ?? []).map((n, i) => ({
    name: n.nationality,
    value: parseInt(n.count),
    color: NAT_COLORS[i % NAT_COLORS.length],
  }));

  const cTotalRevenue = cs?.totalRevenue ?? null;
  const cConfirmedRevenue = cs?.confirmedRevenue || 0;

  const cTotalBookings = cs?.totalBookings ?? null;
  const cConfirmed = cs?.confirmedBookings ?? null;
  const cPending = cs?.pendingBookings ?? null;
  const cCancelled = cs?.cancelledBookings ?? null;
  const cAvgValue = cs?.avgBookingValue ?? null;
  const cTotalPeople = cs?.totalPeople ?? null;

  const cNatMap = (cs?.nationalityBreakdown ?? []).reduce((acc, n) => {
    acc[n.nationality] = parseInt(n.count);
    return acc;
  }, {});

  const primaryMonthMap = Object.fromEntries(
    (ps?.monthlyBreakdown ?? []).map((m) => [m.month, m])
  );
  const compareMonthMap = Object.fromEntries(
    (cs?.monthlyBreakdown ?? []).map((m) => [m.month, m])
  );
  const allMonthLabels = Array.from(
    new Set([
      ...(ps?.monthlyBreakdown ?? []).map((m) => m.month),
      ...(cs?.monthlyBreakdown ?? []).map((m) => m.month),
    ])
  );
  const monthlyData = allMonthLabels.map((month) => ({
    month,
    revenue: primaryMonthMap[month]?.revenue ?? 0,
    bookings: primaryMonthMap[month]?.bookings ?? 0,
    people: primaryMonthMap[month]?.total_people ?? 0,
    cmpRevenue: hasCompare ? compareMonthMap[month]?.revenue ?? 0 : undefined,
    cmpBookings: hasCompare ? compareMonthMap[month]?.bookings ?? 0 : undefined,
  }));

  const pendingReviews = reviews.filter((r) => !r.approved).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("dashboard.greeting.morning");
    if (hour < 18) return t("dashboard.greeting.afternoon");
    return t("dashboard.greeting.evening");
  };

  const kpiCards = [
    {
      icon: "fa-dollar-sign",
      label: t("dashboard.kpi.totalRevenue"),
      value: loading ? "—" : `$${confirmedRevenue.toLocaleString()}`,
      primaryRaw: confirmedRevenue,
      compareRaw: cConfirmedRevenue,
      formatter: (v) => `$${Number(v).toLocaleString()}`,
      sub: t("dashboard.kpi.avgPerBooking", { value: avgValue }),
      color: "from-amber-400 to-orange-500",
      ring: "ring-amber-200",
      trend: t("dashboard.kpi.confirmedRevenue", {
        value: ps?.confirmedRevenue?.toLocaleString() ?? 0,
      }),
      up: true,
    },
    {
      icon: "fa-suitcase",
      label: t("dashboard.kpi.totalBookings"),
      value: loading ? "—" : totalBookings,
      primaryRaw: totalBookings,
      compareRaw: cTotalBookings,
      formatter: (v) => v,
      sub: t("dashboard.kpi.confirmedPending", {
        confirmed: confirmedCount,
        pending: pendingCount,
      }), 
      color: "from-emerald-400 to-teal-500",
      ring: "ring-emerald-200",
      trend: t("dashboard.kpi.cancelledCount", { count: cancelledCount }),
      up: true,
    },
    {
      icon: "fa-users",
      label: t("dashboard.kpi.totalTravellers"),
      value: loading ? "—" : totalPeople.toLocaleString(),
      primaryRaw: totalPeople,
      compareRaw: cTotalPeople,
      formatter: (v) => Number(v).toLocaleString(),
      sub: t("dashboard.kpi.exclCancelled"),
      color: "from-blue-400 to-indigo-500",
      ring: "ring-blue-200",
      trend: t("dashboard.kpi.toursBooked", { count: topTours.length }),
      up: true,
    },
    {
      icon: "fa-star",
      label: t("dashboard.kpi.pendingReviews"),
      value: loading ? "—" : pendingReviews,
      primaryRaw: pendingReviews,
      compareRaw: null,
      formatter: (v) => v,
      sub: t("dashboard.kpi.awaitingApproval"),
      color: "from-rose-400 to-pink-500",
      ring: "ring-rose-200",
      trend: t("dashboard.kpi.newReviews", { count: pendingReviews }),
      up: false,
    },
  ];

  return (
    <div
      className='min-h-screen bg-stone-100'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <main className='min-h-screen bg-stone-100'>
        <div className='p-2 md:p-8 max-w-[1400px] space-y-3'>
          {/* ── Welcome banner ──────────────────────────── */}
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
                  {t("dashboard.banner.adminPanel")}
                </span>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse' />
                <span className='text-[10px] text-emerald-400 font-semibold'>
                  {t("dashboard.banner.live")}
                </span>
              </div>
              <h1
                className='text-2xl md:text-3xl font-black text-white mb-1'
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {getGreeting()},{" "}
                {user?.name?.split(" ")[0] ||
                  t("dashboard.banner.defaultAdmin")}{" "}
              </h1>
              <p className='text-stone-400 text-sm'>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}{" "}
                — {t("dashboard.banner.overview")}
              </p>
            </div>
            <div className='relative z-10 flex items-center gap-3 shrink-0 flex-wrap'>
              <Link
                to='/admin/tours/create'
                className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-5 py-2.5 rounded-xl shadow-lg shadow-amber-900/30'
              >
                <i className='fa fa-plus text-xs' />{" "}
                {t("dashboard.banner.addTour")}
              </Link>
              <Link
                to='/admin/bookings'
                className='flex items-center gap-2 text-sm font-semibold text-stone-300 hover:text-white border border-white/15 hover:border-white/30 px-5 py-2.5 rounded-xl transition-all'
              >
                <i className='fa fa-suitcase text-xs' />{" "}
                {t("dashboard.banner.viewBookings")}
              </Link>
            </div>
          </div>

          {/* ── Date range filter ────────────────────────── */}
          <div className='bg-white rounded-2xl border border-stone-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
            <div>
              <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-0.5'>
                {t("dashboard.filter.title")}
              </p>
              <div className='flex items-center gap-2 flex-wrap'>
                <p className='text-sm font-semibold text-stone-700'>
                  {dateRange.startDate && dateRange.endDate
                    ? `${dateRange.startDate} → ${dateRange.endDate}`
                    : t("dashboard.filter.allTime")}
                </p>
                {hasCompare && compareDateRange.startDate && (
                  <span className='text-xs text-stone-400 flex items-center gap-1'>
                    {t("dashboard.filter.vs")}
                    <span className='font-semibold text-blue-500'>
                      {compareDateRange.startDate} → {compareDateRange.endDate}
                    </span>
                  </span>
                )}
              </div>
            </div>
            <DateRangePicker
              setRangeSelect={handleRangeSelect}
              setCompareDateRange={handleCompareDateSelect}
              dateRange={dateRange}
              enableCompare
            />
          </div>

          {/* ── KPI Stats ────────────────────────────────── */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
            {kpiCards.map((s) => (
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
                {!loading && hasCompare && s.compareRaw != null && (
                  <div className='mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 flex-wrap'>
                    <DeltaBadge
                      primary={s.primaryRaw}
                      compare={s.compareRaw}
                      formatter={s.formatter}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Charts row ───────────────────────────────── */}
          <div className='grid lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2 bg-white rounded-2xl border border-stone-100 p-6'>
              <div className='flex items-center justify-between mb-6 flex-wrap gap-3'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-1'>
                    {t("dashboard.charts.performance")}
                  </p>
                  <h3 className='font-black text-stone-800 text-lg'>
                    {t("dashboard.charts.revenueBookings")}
                  </h3>
                </div>
                <div className='flex items-center gap-3 text-xs text-stone-400 flex-wrap'>
                  <span className='flex items-center gap-1.5'>
                    <span className='w-2.5 h-2.5 rounded-full bg-amber-400' />{" "}
                    {t("dashboard.charts.revenue")}
                  </span>
                  <span className='flex items-center gap-1.5'>
                    <span className='w-2.5 h-2.5 rounded-full bg-blue-400' />{" "}
                    {t("dashboard.charts.bookings")}
                  </span>
                  {hasCompare && (
                    <>
                      <span className='flex items-center gap-1.5'>
                        <span className='w-5 border-t-2 border-dashed border-amber-400' />{" "}
                        {t("dashboard.charts.revCmp")}
                      </span>
                      <span className='flex items-center gap-1.5'>
                        <span className='w-5 border-t-2 border-dashed border-blue-400' />{" "}
                        {t("dashboard.charts.bkgsCmp")}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {loading ? (
                <Sk className='h-[210px]' />
              ) : monthlyData.length === 0 ? (
                <div className='h-[210px] flex items-center justify-center text-stone-300 text-sm'>
                  {t("dashboard.charts.noData")}
                </div>
              ) : (
                <ResponsiveContainer width='100%' height={210}>
                  <AreaChart
                    data={monthlyData}
                    margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
                  >
                    <defs>
                      <linearGradient id='revGrad' x1='0' y1='0' x2='0' y2='1'>
                        <stop
                          offset='5%'
                          stopColor='#F59E0B'
                          stopOpacity={0.2}
                        />
                        <stop
                          offset='95%'
                          stopColor='#F59E0B'
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id='bkGrad' x1='0' y1='0' x2='0' y2='1'>
                        <stop
                          offset='5%'
                          stopColor='#60A5FA'
                          stopOpacity={0.2}
                        />
                        <stop
                          offset='95%'
                          stopColor='#60A5FA'
                          stopOpacity={0}
                        />
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
                    {hasCompare && (
                      <>
                        <Area
                          type='monotone'
                          dataKey='cmpRevenue'
                          stroke='#F59E0B'
                          strokeWidth={1.5}
                          strokeDasharray='5 4'
                          fill='none'
                          dot={false}
                          name='cmpRevenue'
                        />
                        <Area
                          type='monotone'
                          dataKey='cmpBookings'
                          stroke='#60A5FA'
                          strokeWidth={1.5}
                          strokeDasharray='5 4'
                          fill='none'
                          dot={false}
                          name='cmpBookings'
                        />
                      </>
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Nationality breakdown */}
            <div className='bg-white rounded-2xl border border-stone-100 p-6'>
              <div className='mb-5'>
                <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-1'>
                  {t("dashboard.nationality.breakdown")}
                </p>
                <h3 className='font-black text-stone-800 text-lg'>
                  {t("dashboard.nationality.title")}
                </h3>
              </div>
              {loading ? (
                <Sk className='h-[150px]' />
              ) : nationalityData.length === 0 ? (
                <div className='h-[150px] flex items-center justify-center text-stone-300 text-sm'>
                  {t("dashboard.charts.noData")}
                </div>
              ) : (
                <ResponsiveContainer width='100%' height={150}>
                  <PieChart>
                    <Pie
                      data={nationalityData}
                      cx='50%'
                      cy='50%'
                      innerRadius={42}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey='value'
                    >
                      {nationalityData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className='space-y-2 mt-3'>
                {nationalityData.map((c) => {
                  const cVal = hasCompare ? cNatMap[c.name] : null;
                  const d = cVal != null ? delta(c.value, cVal) : null;
                  return (
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
                      <div className='flex items-center gap-2'>
                        <span className='font-bold text-stone-700'>
                          {c.value}
                        </span>
                        {d && (
                          <span
                            className={`text-[10px] font-bold flex items-center gap-0.5 ${d.color}`}
                          >
                            <i className={`fa ${d.arrow} text-[8px]`} />
                            {d.pct}%
                          </span>
                        )}
                        {cVal != null && (
                          <span className='text-stone-300 text-[10px]'>
                            ({cVal})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Middle row ───────────────────────────────── */}
          <div className='grid lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2 bg-white rounded-2xl border border-stone-100 overflow-hidden'>
              <div className='flex items-center justify-between px-6 py-5 border-b border-stone-100'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-0.5'>
                    {t("dashboard.bookings.latest")}
                  </p>
                  <h3 className='font-black text-stone-800'>
                    {t("dashboard.bookings.recentBookings")}
                  </h3>
                </div>
                <Link
                  to='/admin/bookings'
                  className='text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors'
                >
                  {t("dashboard.bookings.manageAll")}{" "}
                  <i className='fa fa-arrow-right text-[10px]' />
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
              <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
                <div className='flex items-center justify-between px-5 py-4 border-b border-stone-100'>
                  <div>
                    <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-0.5'>
                      {t("dashboard.reviews.awaiting")}
                    </p>
                    <h3 className='font-black text-stone-800 text-sm'>
                      {t("dashboard.reviews.pendingReviews")}
                    </h3>
                  </div>
                  <Link
                    to='/admin/reviews'
                    className='text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors'
                  >
                    {t("dashboard.reviews.viewAll")}{" "}
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
                      {t("dashboard.reviews.allApproved")}
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
                              {t("dashboard.reviews.reviewAction")}
                            </Link>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Quick stats */}
              <div className='bg-white rounded-2xl border border-stone-100 p-5'>
                <div className='flex items-center justify-between mb-4'>
                  <p className='text-xs font-bold uppercase tracking-widest text-stone-400'>
                    {t("dashboard.quickStats.title")}
                  </p>
                  {hasCompare && (
                    <div className='flex items-center gap-1 text-[10px] text-stone-400'>
                      <span className='w-3 border-t-2 border-dashed border-blue-300' />
                      {t("dashboard.quickStats.comparePeriod")}
                    </div>
                  )}
                </div>
                {hasCompare && (
                  <div className='flex items-center justify-between mb-2 pb-2 border-b border-stone-100'>
                    <span className='text-[10px] text-stone-300 flex-1'>
                      {t("dashboard.quickStats.metric")}
                    </span>
                    <span className='text-[10px] font-bold text-stone-500 w-12 text-right'>
                      {t("dashboard.quickStats.now")}
                    </span>
                    <span className='text-[10px] font-bold text-blue-400 w-14 text-right'>
                      {t("dashboard.quickStats.before")}
                    </span>
                    <span className='text-[10px] font-bold text-stone-400 w-12 text-right'>
                      {t("dashboard.quickStats.delta")}
                    </span>
                  </div>
                )}
                <div className='space-y-3'>
                  {[
                    {
                      label: t("dashboard.quickStats.confirmedBookings"),
                      primary: confirmedCount,
                      compare: cConfirmed,
                      color: "text-emerald-600",
                      fmt: (v) => v,
                    },
                    {
                      label: t("dashboard.quickStats.pendingBookings"),
                      primary: pendingCount,
                      compare: cPending,
                      color: "text-amber-600",
                      fmt: (v) => v,
                    },
                    {
                      label: t("dashboard.quickStats.cancelledBookings"),
                      primary: cancelledCount,
                      compare: cCancelled,
                      color: "text-red-500",
                      fmt: (v) => v,
                    },
                    {
                      label: t("dashboard.quickStats.avgBookingValue"),
                      primary: avgValue,
                      compare: cAvgValue,
                      color: "text-blue-600",
                      fmt: (v) => `$${Number(v).toFixed(2)}`,
                    },
                    {
                      label: t("dashboard.quickStats.totalTravellers"),
                      primary: totalPeople,
                      compare: cTotalPeople,
                      color: "text-stone-700",
                      fmt: (v) => Number(v).toLocaleString(),
                    },
                  ].map((s) => {
                    const d =
                      hasCompare && s.compare != null
                        ? delta(s.primary, s.compare)
                        : null;
                    return (
                      <div
                        key={s.label}
                        className='flex items-center justify-between gap-1'
                      >
                        <p className='text-xs text-stone-500 flex-1 min-w-0 truncate'>
                          {s.label}
                        </p>
                        <p
                          className={`text-sm font-black ${s.color} w-12 text-right shrink-0`}
                        >
                          {loading ? "—" : s.fmt(s.primary)}
                        </p>
                        {hasCompare && (
                          <>
                            <p className='text-xs font-semibold text-blue-400 w-14 text-right shrink-0'>
                              {s.compare != null ? s.fmt(s.compare) : "—"}
                            </p>
                            <p
                              className={`text-[10px] font-bold w-12 text-right shrink-0 ${
                                d ? d.color : "text-stone-300"
                              }`}
                            >
                              {d ? (
                                <>
                                  <i
                                    className={`fa ${d.arrow} text-[8px] mr-0.5`}
                                  />
                                  {d.pct}%
                                </>
                              ) : (
                                "—"
                              )}
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom row ───────────────────────────────── */}
          <div className='grid lg:grid-cols-2 gap-6'>
            <div className='bg-white rounded-2xl border border-stone-100 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-1'>
                    {t("dashboard.volume.monthly")}
                  </p>
                  <h3 className='font-black text-stone-800 text-lg'>
                    {t("dashboard.volume.title")}
                  </h3>
                </div>
                <div className='flex items-center gap-2'>
                  {hasCompare && (
                    <span className='text-[10px] text-stone-400 flex items-center gap-1'>
                      <span className='inline-block w-3 h-3 rounded-sm bg-amber-200 opacity-70' />{" "}
                      {t("dashboard.volume.cmp")}
                    </span>
                  )}
                  <span className='text-xs font-bold text-stone-400 bg-stone-100 px-3 py-1.5 rounded-xl'>
                    {new Date().getFullYear()}
                  </span>
                </div>
              </div>
              {loading ? (
                <Sk className='h-[180px]' />
              ) : monthlyData.length === 0 ? (
                <div className='h-[180px] flex items-center justify-center text-stone-300 text-sm'>
                  {t("dashboard.charts.noData")}
                </div>
              ) : (
                <ResponsiveContainer width='100%' height={180}>
                  <BarChart
                    data={monthlyData}
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
                    {hasCompare && (
                      <Bar
                        dataKey='cmpBookings'
                        name='cmpBookings'
                        fill='#F59E0B'
                        opacity={0.25}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                      />
                    )}
                    <Bar
                      dataKey='bookings'
                      name='bookings'
                      fill='#F59E0B'
                      radius={[6, 6, 0, 0]}
                      maxBarSize={hasCompare ? 26 : 36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top tours */}
            <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
              <div className='flex items-center justify-between px-6 py-5 border-b border-stone-100'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-0.5'>
                    {t("dashboard.topTours.topPerformers")}
                  </p>
                  <h3 className='font-black text-stone-800'>
                    {t("dashboard.topTours.title")}
                  </h3>
                </div>
                <Link
                  to='/admin/tours'
                  className='text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors'
                >
                  {t("dashboard.topTours.manage")}{" "}
                  <i className='fa fa-arrow-right text-[10px]' />
                </Link>
              </div>
              <div className='divide-y divide-stone-50'>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className='flex items-center gap-3 px-5 py-3'>
                      <Sk className='w-10 h-9 rounded-xl shrink-0' />
                      <div className='flex-1'>
                        <Sk className='h-3 w-3/4' />
                      </div>
                    </div>
                  ))
                ) : topTours.length === 0 ? (
                  <div className='px-6 py-10 text-center text-stone-300 text-sm'>
                    {t("dashboard.topTours.noBookings")}
                  </div>
                ) : (
                  topTours.map((tour, i) => {
                    const ct = cs?.topTours?.find(
                      (c) => c.tour_id === tour.tour_id
                    );
                    const d = ct ? delta(tour.revenue, ct.revenue) : null;
                    return (
                      <div
                        key={tour.tour_id}
                        className='flex items-center gap-4 px-5 py-3.5 hover:bg-stone-50 transition-colors'
                      >
                        <span
                          className={`text-xs font-black w-5 shrink-0 ${
                            i === 0
                              ? "text-amber-500"
                              : i === 1
                              ? "text-stone-400"
                              : "text-stone-300"
                          }`}
                        >
                          #{i + 1}
                        </span>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-bold text-stone-800 truncate'>
                            {tour.name}
                          </p>
                          <p className='text-xs text-stone-400 mt-0.5'>
                            <span className='font-semibold text-stone-500'>
                              {tour.total_bookings}
                            </span>{" "}
                            {t("dashboard.topTours.bookings")} ·{" "}
                            <span className='font-semibold text-stone-500'>
                              {tour.total_people}
                            </span>{" "}
                            {t("dashboard.topTours.people")}
                          </p>
                        </div>
                        <div className='text-right shrink-0'>
                          <p className='text-sm font-black text-amber-600'>
                            ${Number(tour.revenue).toLocaleString()}
                          </p>
                          {d ? (
                            <p
                              className={`text-[10px] font-bold mt-0.5 flex items-center justify-end gap-0.5 ${d.color}`}
                            >
                              <i className={`fa ${d.arrow} text-[8px]`} />
                              {d.pct}%{" "}
                              <span className='text-stone-400 font-normal'>
                                {tour("dashboard.delta.vs")} $
                                {Number(ct.revenue).toLocaleString()}
                              </span>
                            </p>
                          ) : (
                            <p className='text-[10px] text-stone-400 mt-0.5'>
                              {t("dashboard.topTours.revenue")}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
