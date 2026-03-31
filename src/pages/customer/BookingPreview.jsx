import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import bookingService from "../../services/bookingService";

const StatusBadge = ({ status }) => {
  const config = {
    pending: {
      color: "bg-amber-50 text-amber-600 border-amber-200",
      icon: "fa-clock",
      label: "Pending",
    },
    confirmed: {
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
      icon: "fa-check-circle",
      label: "Confirmed",
    },
    cancelled: {
      color: "bg-red-50 text-red-500 border-red-200",
      icon: "fa-times-circle",
      label: "Cancelled",
    },
    completed: {
      color: "bg-sky-50 text-sky-600 border-sky-200",
      icon: "fa-flag-checkered",
      label: "Completed",
    },
  };

  const c = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${c.color}`}
    >
      <i className={`fa ${c.icon} text-[10px]`} />
      {c.label}
    </span>
  );
};

const InfoRow = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className='flex items-start gap-3 py-3 border-b border-stone-100 last:border-0'>
      <div className='w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5'>
        <i className={`fa ${icon} text-amber-500 text-xs`} />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5'>
          {label}
        </p>
        <p className='text-sm font-semibold text-stone-700 break-words'>
          {value}
        </p>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
    <div className='px-6 py-4 border-b border-stone-100 bg-stone-50/50'>
      <h3 className='text-xs font-bold uppercase tracking-widest text-stone-400'>
        {title}
      </h3>
    </div>
    <div className='px-6 py-2'>{children}</div>
  </div>
);

const BookingPreview = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await bookingService.getById(id);
        setBooking(data);
        console.log("Data: ", data);
      } catch {
        setError("Booking not found or could not be loaded.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // ── Loading ───────────────────────────────────────────────
  if (loading)
    return (
      <div className='min-h-screen bg-stone-50 animate-pulse p-6 md:p-10'>
        <div className='max-w-4xl mx-auto space-y-4'>
          <div className='h-8 bg-stone-200 rounded w-1/3' />
          <div className='h-4 bg-stone-200 rounded w-1/4' />
          <div className='h-48 bg-stone-200 rounded-2xl' />
          <div className='h-48 bg-stone-200 rounded-2xl' />
        </div>
      </div>
    );

  // ── Error ─────────────────────────────────────────────────
  if (error || !booking)
    return (
      <div className='min-h-screen bg-stone-50 flex flex-col items-center justify-center text-center px-6'>
        <i className='fa fa-calendar-times text-5xl text-stone-200 mb-4' />
        <h2 className='text-xl font-bold text-stone-600 mb-2'>
          Booking not found
        </h2>
        <p className='text-stone-400 text-sm mb-6'>
          {error || "This booking doesn't exist or has been removed."}
        </p>
        <Link
          to='/bookings'
          className='flex items-center gap-2 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 px-5 py-2.5 rounded-xl hover:bg-amber-100 transition-colors'
        >
          <i className='fa fa-arrow-left text-xs' /> Back to Bookings
        </Link>
      </div>
    );

  const pricePerPerson = booking.num_people
    ? (booking.total_price / booking.num_people).toFixed(2)
    : null;

  return (
    <div
      className='min-h-screen bg-stone-50 py-8 px-4 md:px-8'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* ── Header ──────────────────────────────────── */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <Link
              to='/bookings'
              className='inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-stone-600 transition-colors mb-3'
            >
              <i className='fa fa-arrow-left text-[10px]' /> All Bookings
            </Link>
            <h1 className='text-2xl md:text-3xl font-black text-stone-800'>
              Booking{" "}
              <span className='text-amber-500'>
                #{String(booking.id).padStart(4, "0")}
              </span>
            </h1>
            <p className='text-sm text-stone-400 mt-1'>
              Created on{" "}
              {new Date(booking.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* ── Tour Card ────────────────────────────────── */}
        {booking && (
          <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden flex flex-col sm:flex-row'>
            {/* Cover image */}
            <div className='w-full sm:w-48 h-44 sm:h-auto bg-stone-100 shrink-0 relative overflow-hidden'>
              {booking.tour_cover_image ? (
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}${
                    booking.tour_cover_image
                  }`}
                  alt={booking.title}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center text-stone-300'>
                  <i className='fa fa-image text-3xl' />
                </div>
              )}
              <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent sm:bg-gradient-to-r' />
            </div>

            {/* Tour info */}
            <div className='flex-1 p-6'>
              <p className='text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1'>
                {booking.type} · {booking.category}
              </p>
              <h2 className='text-lg font-black text-stone-800 mb-3'>
                {booking.title}
              </h2>
              <div className='flex flex-wrap gap-3 text-xs text-stone-500'>
                {booking.destination && (
                  <span className='flex items-center gap-1.5'>
                    <i className='fa fa-map-marker-alt text-amber-400' />
                    {booking.destination}
                  </span>
                )}
                {booking.duration_days && (
                  <span className='flex items-center gap-1.5'>
                    <i className='fa fa-clock text-amber-400' />
                    {booking.duration_days} days
                  </span>
                )}
                {booking.duration_hours && (
                  <span className='flex items-center gap-1.5'>
                    <i className='fa fa-clock text-amber-400' />
                    {booking.duration_hours} hours
                  </span>
                )}
                {booking.max_group_size && (
                  <span className='flex items-center gap-1.5'>
                    <i className='fa fa-users text-amber-400' />
                    Max {booking.max_group_size} people
                  </span>
                )}
              </div>
              <Link
                to={`/tours/${booking.tour_id}`}
                className='inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors'
              >
                View Tour <i className='fa fa-arrow-right text-[10px]' />
              </Link>
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* ── Booking Details ───────────────────────── */}
          <Section title='Booking Details'>
            <InfoRow
              icon='fa-calendar'
              label='Booking Date'
              value={new Date(booking.booking_date).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            />
            <InfoRow
              icon='fa-clock'
              label='Booking Time'
              value={booking.booking_time}
            />
            <InfoRow
              icon='fa-users'
              label='Number of People'
              value={booking.num_people}
            />
            <InfoRow
              icon='fa-map-marker-alt'
              label='Pickup Location'
              value={booking.pickup_location}
            />
            {booking.special_requests && (
              <InfoRow
                icon='fa-comment-alt'
                label='Special Requests'
                value={booking.special_requests}
              />
            )}
          </Section>

          {/* ── Guest Details ─────────────────────────── */}
          <Section title='Guest Details'>
            <InfoRow
              icon='fa-user'
              label='Full Name'
              value={booking.full_name}
            />
            <InfoRow icon='fa-envelope' label='Email' value={booking.email} />
            <InfoRow icon='fa-phone' label='Phone' value={booking.phone} />
            <InfoRow
              icon='fa-flag'
              label='Nationality'
              value={booking.nationality}
            />
          </Section>
        </div>

        {/* ── Pricing Summary ──────────────────────────── */}
        <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
          <div className='px-6 py-4 border-b border-stone-100 bg-stone-50/50'>
            <h3 className='text-xs font-bold uppercase tracking-widest text-stone-400'>
              Pricing Summary
            </h3>
          </div>
          <div className='p-6 space-y-3'>
            {pricePerPerson && (
              <div className='flex items-center justify-between text-sm'>
                <span className='text-stone-400'>
                  Price per person × {booking.num_people}
                </span>
                <span className='font-semibold text-stone-600'>
                  ${pricePerPerson} × {booking.num_people}
                </span>
              </div>
            )}
            <div className='flex items-center justify-between pt-3 border-t border-stone-100'>
              <span className='text-base font-black text-stone-800'>
                Total Price
              </span>
              <span className='text-2xl font-black text-amber-600'>
                ${Number(booking.total_price).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────── */}
        <div className='flex flex-wrap gap-3 justify-end pb-8'>
          <Link
            to={`/bookings/${id}/edit`}
            className='flex items-center gap-2 text-sm font-bold text-stone-600 bg-white border border-stone-200 hover:border-stone-300 px-5 py-2.5 rounded-xl transition-colors'
          >
            <i className='fa fa-edit text-xs' /> Edit Booking
          </Link>
          {booking.status !== "cancelled" && booking.status !== "completed" && (
            <button className='flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 px-5 py-2.5 rounded-xl transition-colors'>
              <i className='fa fa-times text-xs' /> Cancel Booking
            </button>
          )}
          {booking.status === "confirmed" && (
            <button className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-amber-100'>
              <i className='fa fa-download text-xs' /> Download Voucher
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPreview;
