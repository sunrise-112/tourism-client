// ── UserPreview.jsx ───────────────────────────────────────────
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import userService from "../../services/userService";
import renderImage from "../../utils/renderImage";

// ─── Role config ──────────────────────────────────────────────
const ROLE_META = {
  admin: {
    gradient: "from-rose-400 to-pink-600",
    soft: "from-rose-50 to-pink-50",
    border: "border-rose-100",
    ring: "ring-rose-200",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    accent: "text-rose-500",
    icon: "fa-crown",
    bar: "bg-gradient-to-r from-rose-400 to-pink-500",
  },
  guide: {
    gradient: "from-blue-400 to-indigo-600",
    soft: "from-blue-50 to-indigo-50",
    border: "border-blue-100",
    ring: "ring-blue-200",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    accent: "text-blue-500",
    icon: "fa-map",
    bar: "bg-gradient-to-r from-blue-400 to-indigo-500",
  },
  customer: {
    gradient: "from-amber-400 to-orange-500",
    soft: "from-amber-50 to-orange-50",
    border: "border-amber-100",
    ring: "ring-amber-200",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    accent: "text-amber-500",
    icon: "fa-user",
    bar: "bg-gradient-to-r from-amber-400 to-orange-500",
  },
};

// ─── Skeleton ─────────────────────────────────────────────────
const Sk = ({ className }) => (
  <div className={`animate-pulse bg-stone-100 rounded-xl ${className}`} />
);

// ─── Avatar ───────────────────────────────────────────────────
const Avatar = ({ name, src, role, size = "w-24 h-24", text = "text-3xl" }) => {
  const meta = ROLE_META[role] ?? ROLE_META.customer;
  return src ? (
    <img
      src={src}
      alt={name}
      className={`${size} rounded-2xl object-cover ring-4 ${meta.ring} shadow-xl`}
    />
  ) : (
    <div
      className={`${size} rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white font-black ${text} ring-4 ${meta.ring} shadow-xl`}
    >
      {name?.charAt(0)?.toUpperCase() ?? "?"}
    </div>
  );
};

// ─── Info row ─────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, accent = false }) => (
  <div className='flex items-center gap-3 py-3 border-b border-stone-50 last:border-0'>
    <div className='w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center shrink-0'>
      <i className={`fa ${icon} text-stone-400 text-xs`} />
    </div>
    <div className='flex-1 min-w-0'>
      <p className='text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-0.5'>
        {label}
      </p>
      <p
        className={`text-sm font-semibold truncate ${
          accent ? "text-amber-600" : "text-stone-700"
        }`}
      >
        {value || <span className='text-stone-300 font-normal italic'>—</span>}
      </p>
    </div>
  </div>
);

// ─── Stat card ────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, ring, gradient }) => (
  <div className='bg-white rounded-2xl border border-stone-100 p-5 hover:shadow-lg hover:shadow-stone-200/60 transition-all group'>
    <div
      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-md ring-4 ${ring} group-hover:scale-105 transition-transform`}
    >
      <i className={`fa ${icon} text-white text-xs`} />
    </div>
    <p className='text-2xl font-black text-stone-800 mb-0.5'>{value ?? "—"}</p>
    <p className='text-xs font-semibold text-stone-500'>{label}</p>
  </div>
);

// ─── Status pill ──────────────────────────────────────────────
const StatusPill = ({ active, icon, label, onColor, offColor }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
      active ? onColor : "bg-stone-50 text-stone-400 border-stone-200"
    }`}
  >
    <i className={`fa ${icon} text-[10px]`} />
    {label}
  </span>
);

// ─── Main component ───────────────────────────────────────────
const UserPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await userService.getById(id);
        setUser(data);
      } catch (err) {
        console.error(err);
        setError("User not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const meta = ROLE_META[user?.role] ?? ROLE_META.customer;

  // ── Error state ───────────────────────────────────────────
  if (error) {
    return (
      <div className='min-h-screen bg-stone-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4'>
            <i className='fa fa-exclamation-triangle text-rose-400 text-xl' />
          </div>
          <p className='font-bold text-stone-700 mb-1'>Something went wrong</p>
          <p className='text-sm text-stone-400 mb-4'>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className='text-xs font-bold text-amber-600 hover:text-amber-700'
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-stone-100 p-4 md:p-8'>
      <div className='max-w-5xl mx-auto space-y-5'>
        {/* ── Page header ──────────────────────────────────── */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate(-1)}
              className='w-9 h-9 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-all'
            >
              <i className='fa fa-arrow-left text-xs' />
            </button>
            <div>
              <p className='text-xs font-bold uppercase tracking-widest text-stone-400'>
                Admin / Users
              </p>
              <h1
                className='text-2xl font-black text-stone-800 leading-tight'
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                User Profile
              </h1>
            </div>
          </div>

          {!loading && user && (
            <Link
              to={`/admin/users/edit/${id}`}
              className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-4 py-2.5 rounded-xl shadow-lg shadow-amber-900/20'
            >
              <i className='fa fa-pen text-xs' /> Edit User
            </Link>
          )}
        </div>

        {/* ── Hero card ─────────────────────────────────────── */}
        <div className='relative bg-[#1C1107] rounded-2xl overflow-hidden'>
          {/* Dot grid */}
          <div
            className='absolute inset-0 opacity-[0.04]'
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Glow */}
          <div
            className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${meta.gradient} opacity-10 rounded-full blur-[80px] pointer-events-none`}
          />

          {/* Role colour bar */}
          <div className={`h-1 ${meta.bar}`} />

          <div className='relative z-10 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6'>
            {/* Avatar */}
            {loading ? (
              <Sk className='w-24 h-24 rounded-2xl shrink-0' />
            ) : (
              <Avatar
                name={user?.name}
                src={
                  user?.avatar
                    ? renderImage(user?.avatar)
                    : null
                }
                role={user?.role}
                size='w-24 h-24'
                text='text-3xl'
              />
            )}

            {/* Name / meta */}
            <div className='flex-1 min-w-0'>
              {loading ? (
                <div className='space-y-2'>
                  <Sk className='h-7 w-48' />
                  <Sk className='h-4 w-32' />
                </div>
              ) : (
                <>
                  <h2
                    className='text-2xl md:text-3xl font-black text-white leading-tight truncate'
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {user?.name}
                  </h2>
                  <p className='text-stone-400 text-sm mt-1 truncate'>
                    {user?.email}
                  </p>
                  <div className='flex flex-wrap items-center gap-2 mt-3'>
                    {/* Role badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${meta.badge}`}
                    >
                      <i className={`fa ${meta.icon} text-[10px]`} />
                      {user?.role?.charAt(0).toUpperCase() +
                        user?.role?.slice(1)}
                    </span>
                    {/* Active */}
                    <StatusPill
                      active={user?.active}
                      icon={user?.active ? "fa-circle" : "fa-ban"}
                      label={user?.active ? "Active" : "Inactive"}
                      onColor='bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    />
                    {/* Verified */}
                    <StatusPill
                      active={user?.verified}
                      icon={
                        user?.verified ? "fa-check-circle" : "fa-times-circle"
                      }
                      label={user?.verified ? "Verified" : "Unverified"}
                      onColor='bg-blue-500/15 text-blue-400 border-blue-500/30'
                    />
                  </div>
                </>
              )}
            </div>

            {/* Joined date */}
            {!loading && user?.created_at && (
              <div className='shrink-0 text-right hidden sm:block'>
                <p className='text-[10px] text-white/30 uppercase tracking-widest mb-1'>
                  Member since
                </p>
                <p className='text-sm font-bold text-white/60'>
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats row ─────────────────────────────────────── */}
{/*         <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {loading
            ? [...Array(4)].map((_, i) => (
                <Sk key={i} className='h-28 rounded-2xl' />
              ))
            : [
                {
                  icon: "fa-suitcase-rolling",
                  label: "Total Bookings",
                  value: user?.stats?.totalBookings ?? 0,
                  gradient: "from-amber-400 to-orange-500",
                  ring: "ring-amber-200",
                },
                {
                  icon: "fa-check-circle",
                  label: "Confirmed",
                  value: user?.stats?.confirmedBookings ?? 0,
                  gradient: "from-emerald-400 to-teal-500",
                  ring: "ring-emerald-200",
                },
                {
                  icon: "fa-dollar-sign",
                  label: "Total Spent",
                  value:
                    user?.stats?.totalSpent != null
                      ? `$${Number(user.stats.totalSpent).toLocaleString()}`
                      : "—",
                  gradient: "from-rose-400 to-pink-500",
                  ring: "ring-rose-200",
                },
                {
                  icon: "fa-users",
                  label: "Travellers",
                  value: user?.stats?.totalPeople ?? 0,
                  gradient: "from-blue-400 to-indigo-500",
                  ring: "ring-blue-200",
                },
              ].map((s) => <StatCard key={s.label} {...s} />)}
        </div> */}

        {/* ── Main grid ─────────────────────────────────────── */}
        <div className='grid lg:grid-cols-3 gap-5'>
          {/* ── Personal details ──────────────────────────── */}
          <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden lg:col-span-1'>
            <div className='px-5 py-4 border-b border-stone-100 flex items-center gap-3'>
              <div className='w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center'>
                <i className='fa fa-id-card text-amber-400 text-xs' />
              </div>
              <div>
                <p className='text-[10px] font-bold uppercase tracking-widest text-stone-400'>
                  Profile
                </p>
                <h3 className='font-black text-stone-800 text-sm'>
                  Personal Details
                </h3>
              </div>
            </div>
            <div className='px-5 py-2'>
              {loading ? (
                <div className='space-y-4 py-3'>
                  {[...Array(4)].map((_, i) => (
                    <Sk key={i} className='h-10' />
                  ))}
                </div>
              ) : (
                <>
                  <InfoRow
                    icon='fa-user'
                    label='Full Name'
                    value={user?.name}
                  />
                  <InfoRow
                    icon='fa-envelope'
                    label='Email'
                    value={user?.email}
                  />
                  <InfoRow icon='fa-phone' label='Phone' value={user?.phone} />
                  <InfoRow
                    icon='fa-flag'
                    label='Nationality'
                    value={user?.nationality}
                  />
                  <InfoRow
                    icon='fa-calendar'
                    label='Joined'
                    value={
                      user?.created_at
                        ? new Date(user.created_at).toLocaleDateString(
                            "en-US",
                            { month: "long", day: "numeric", year: "numeric" }
                          )
                        : null
                    }
                  />
                  <InfoRow
                    icon='fa-clock'
                    label='Last Updated'
                    value={
                      user?.updated_at
                        ? new Date(user.updated_at).toLocaleDateString(
                            "en-US",
                            { month: "long", day: "numeric", year: "numeric" }
                          )
                        : null
                    }
                  />
                </>
              )}
            </div>
          </div>

          {/* ── Account & activity ────────────────────────── */}
          <div className='lg:col-span-2 space-y-5'>
            {/* Account status card */}
            <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
              <div className='px-5 py-4 border-b border-stone-100 flex items-center gap-3'>
                <div className='w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center'>
                  <i className='fa fa-shield-alt text-stone-400 text-xs' />
                </div>
                <div>
                  <p className='text-[10px] font-bold uppercase tracking-widest text-stone-400'>
                    Permissions
                  </p>
                  <h3 className='font-black text-stone-800 text-sm'>
                    Account Status
                  </h3>
                </div>
              </div>
              <div className='p-5 grid sm:grid-cols-3 gap-4'>
                {loading
                  ? [...Array(3)].map((_, i) => (
                      <Sk key={i} className='h-20 rounded-xl' />
                    ))
                  : [
                      {
                        icon: meta.icon,
                        label: "Role",
                        value:
                          user?.role?.charAt(0).toUpperCase() +
                          user?.role?.slice(1),
                        bg: `bg-gradient-to-br ${meta.soft}`,
                        border: meta.border,
                        textColor: meta.accent,
                      },
                      {
                        icon: user?.active ? "fa-circle" : "fa-ban",
                        label: "Account",
                        value: user?.active ? "Active" : "Inactive",
                        bg: user?.active ? "bg-emerald-50" : "bg-stone-50",
                        border: user?.active
                          ? "border-emerald-100"
                          : "border-stone-200",
                        textColor: user?.active
                          ? "text-emerald-600"
                          : "text-stone-400",
                      },
                      {
                        icon: user?.verified
                          ? "fa-check-circle"
                          : "fa-times-circle",
                        label: "Verification",
                        value: user?.verified ? "Verified" : "Unverified",
                        bg: user?.verified ? "bg-blue-50" : "bg-stone-50",
                        border: user?.verified
                          ? "border-blue-100"
                          : "border-stone-200",
                        textColor: user?.verified
                          ? "text-blue-600"
                          : "text-stone-400",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`${item.bg} border ${item.border} rounded-xl p-4 flex flex-col items-center text-center gap-2`}
                      >
                        <div className='w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center shadow-sm'>
                          <i
                            className={`fa ${item.icon} ${item.textColor} text-sm`}
                          />
                        </div>
                        <p className='text-[10px] font-bold uppercase tracking-widest text-stone-400'>
                          {item.label}
                        </p>
                        <p className={`text-sm font-black ${item.textColor}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
              </div>
            </div>

            {/* Recent activity / bookings mini-list */}
            <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
              <div className='px-5 py-4 border-b border-stone-100 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center'>
                    <i className='fa fa-history text-stone-400 text-xs' />
                  </div>
                  <div>
                    <p className='text-[10px] font-bold uppercase tracking-widest text-stone-400'>
                      History
                    </p>
                    <h3 className='font-black text-stone-800 text-sm'>
                      Recent Bookings
                    </h3>
                  </div>
                </div>
                <Link
                  to={`/admin/bookings?user=${id}`}
                  className='text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors'
                >
                  View all <i className='fa fa-arrow-right text-[10px]' />
                </Link>
              </div>

              {loading ? (
                <div className='divide-y divide-stone-50'>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className='flex items-center gap-4 px-5 py-4'>
                      <Sk className='w-10 h-10 rounded-xl shrink-0' />
                      <div className='flex-1 space-y-2'>
                        <Sk className='h-3 w-2/3' />
                        <Sk className='h-3 w-1/3' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !user?.recentBookings?.length ? (
                <div className='px-5 py-10 text-center'>
                  <i className='fa fa-suitcase text-3xl text-stone-200 mb-3 block' />
                  <p className='text-sm font-semibold text-stone-400'>
                    No bookings yet
                  </p>
                  <p className='text-xs text-stone-300 mt-1'>
                    This user hasn't made any bookings
                  </p>
                </div>
              ) : (
                <div className='divide-y divide-stone-50'>
                  {user.recentBookings.slice(0, 5).map((b) => {
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
                    const s = STATUS[b.status] ?? STATUS.pending;
                    return (
                      <div
                        key={b.id}
                        className='flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition-colors group'
                      >
                        <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center shrink-0'>
                          <i className='fa fa-map-marked-alt text-amber-300 text-sm' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-bold text-stone-800 truncate'>
                            {b.tour_title ?? `Booking #${b.id}`}
                          </p>
                          <p className='text-xs text-stone-400 mt-0.5 flex items-center gap-2'>
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
                              <span>
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
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${s.dot}`}
                            />
                            {s.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Danger zone ───────────────────────────────────── */}
        <div className='bg-white rounded-2xl border border-red-100 overflow-hidden'>
          <div className='px-5 py-4 border-b border-red-50 flex items-center gap-3'>
            <div className='w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center'>
              <i className='fa fa-exclamation-triangle text-red-400 text-xs' />
            </div>
            <div>
              <p className='text-[10px] font-bold uppercase tracking-widest text-red-300'>
                Caution
              </p>
              <h3 className='font-black text-stone-800 text-sm'>Danger Zone</h3>
            </div>
          </div>
          <div className='p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <div>
              <p className='text-sm font-bold text-stone-700'>
                Delete this user
              </p>
              <p className='text-xs text-stone-400 mt-0.5'>
                Permanently remove this account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <button
              disabled={loading}
              className='shrink-0 flex items-center gap-2 text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all px-4 py-2.5 rounded-xl disabled:opacity-40'
            >
              <i className='fa fa-trash text-xs' /> Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPreview;
