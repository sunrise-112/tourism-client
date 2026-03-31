import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import bookingService from "../../services/bookingService";
import renderImage from "../../utils/renderImage";

const STATUS = {
  confirmed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
    label: "Confirmed",
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
    label: "Pending",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-400",
    label: "Cancelled",
  },
  completed: {
    bg: "bg-stone-50",
    text: "text-stone-500",
    border: "border-stone-200",
    dot: "bg-stone-400",
    label: "Completed",
  },
};

const Badge = ({ status }) => {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const Sk = ({ className }) => (
  <div className={`animate-pulse bg-stone-100 rounded-xl ${className}`} />
);

const FILTERS = ["all", "confirmed", "pending", "completed", "cancelled"];

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    bookingService
      .getMyBookings()
      .then((res) => setBookings(res?.data || res || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings
    .filter((b) => filter === "all" || b.status === filter)
    .filter(
      (b) =>
        !search.trim() ||
        b.tour?.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.tour?.destination?.toLowerCase().includes(search.toLowerCase())
    );

  const counts = FILTERS.reduce(
    (acc, f) => ({
      ...acc,
      [f]:
        f === "all"
          ? bookings.length
          : bookings.filter((b) => b.status === f).length,
    }),
    {}
  );

  return (
    <div
      className='min-h-screen bg-stone-50 p-6 md:p-8'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Page header */}
      <div className='mb-8'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-1'>
          History
        </p>
        <h1
          className='text-3xl font-black text-stone-800'
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          My Bookings
        </h1>
        <p className='text-stone-400 text-sm mt-1'>
          {bookings.length} total booking{bookings.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Toolbar */}
      <div className='flex flex-col sm:flex-row gap-3 mb-6'>
        {/* Search */}
        <div className='relative flex-1 max-w-xs'>
          <i className='fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 text-xs' />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search tours...'
            className='w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-stone-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 transition-all placeholder-stone-300 text-stone-700'
          />
        </div>

        {/* Filter tabs */}
        <div className='flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-1 overflow-x-auto'>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors capitalize ${
                filter === f
                  ? "bg-amber-400 text-amber-900 shadow-sm"
                  : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
              }`}
            >
              {f}
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  filter === f
                    ? "bg-amber-300/60 text-amber-900"
                    : "bg-stone-100 text-stone-400"
                }`}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className='space-y-4'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='bg-white rounded-2xl border border-stone-100 flex overflow-hidden'
            >
              <Sk className='w-40 h-36 rounded-none shrink-0' />
              <div className='flex-1 p-5 space-y-3'>
                <Sk className='h-4 w-2/3' />
                <Sk className='h-3 w-1/3' />
                <Sk className='h-3 w-1/2' />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className='bg-white rounded-2xl border border-stone-100 py-20 text-center'>
          <i className='fa fa-suitcase-rolling text-5xl text-stone-200 mb-4 block' />
          <p className='font-bold text-stone-500 mb-1'>No bookings found</p>
          <p className='text-sm text-stone-400 mb-6'>
            {search || filter !== "all"
              ? "Try adjusting your filters"
              : "You haven't booked any tours yet"}
          </p>
          <Link
            to='/tours'
            className='inline-flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 px-5 py-2.5 rounded-xl transition-colors'
          >
            <i className='fa fa-compass text-xs' /> Explore Tours
          </Link>
        </div>
      ) : (
        <div className='space-y-4'>
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className='bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-lg hover:shadow-stone-200/50 transition-all group'
            >
              <div className='flex flex-col sm:flex-row'>
                {/* Image */}
                <div className='sm:w-44 h-44 sm:h-auto shrink-0 relative overflow-hidden bg-stone-100'>
                  {booking?.tour_cover_image ? (
                    <img
                      src={renderImage(booking.tour_cover_image)}
                      alt={booking?.title}
                      className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-stone-300 min-h-[120px]'>
                      <i className='fa fa-image text-3xl' />
                    </div>
                  )}
                  {/* Duration pill */}
                  {booking?.duration_days && (
                    <div className='absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm font-medium flex items-center gap-1'>
                      <i className='fa fa-clock text-[9px]' />{" "}
                      {booking.duration_days}d
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className='flex-1 p-5 flex flex-col justify-between min-w-0'>
                  <div>
                    <div className='flex items-start justify-between gap-3 mb-2'>
                      <div className='min-w-0'>
                        <p className='text-xs text-amber-600 font-semibold flex items-center gap-1 mb-1 uppercase tracking-wide'>
                          <i className='fa fa-map-marker-alt text-[10px]' />
                          {booking?.tour_destination || "—"}
                        </p>
                        <h3 className='font-black text-stone-800 text-base line-clamp-1'>
                          {booking?.tour_title || "Tour"}
                        </h3>
                      </div>
                      <Badge status={booking.status} />
                    </div>
                    <p className='text-sm text-stone-400 line-clamp-2 leading-relaxed'>
                      {booking?.tour_destination}
                    </p>
                  </div>

                  <div className='flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-stone-100'>
                    {/* Meta */}
                    <div className='flex flex-wrap gap-4 text-xs text-stone-400'>
                      {booking.booking_date && (
                        <span className='flex items-center gap-1.5'>
                          <i className='fa fa-calendar text-amber-400' />
                          {new Date(booking.booking_date).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </span>
                      )}
                      {booking.guests && (
                        <span className='flex items-center gap-1.5'>
                          <i className='fa fa-users text-amber-400' />
                          {booking.guests} guest
                          {booking.guests !== 1 ? "s" : ""}
                        </span>
                      )}
                      {booking?.tour_durations_days && (
                        <span className='flex items-center gap-1.5'>
                          <i className='fa fa-moon text-amber-400' />
                          {booking.tour_durations_days} days
                        </span>
                      )}
                    </div>

                    {/* Price + CTA */}
                    <div className='flex items-center gap-3'>
                      <div className='text-right'>
                        <p className='text-xs text-stone-400'>Total paid</p>
                        <p className='text-lg font-black text-amber-600'>
                          ${Number(booking.total_price || 0).toLocaleString()}
                        </p>
                      </div>
                      <Link
                        to={`/booking/view/${booking?.id}`}
                        className='flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 px-4 py-2 rounded-xl transition-colors'
                      >
                        View Booking
                        <i className='fa fa-arrow-right text-[10px]' />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
