import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import tourService from "../../services/tourService";
import renderImage from "../../utils/renderImage";

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  tour: {
    label: "Tour",
    icon: "🌍",
    gradient: "from-amber-500 to-orange-500",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  excursion: {
    label: "Excursion",
    icon: "🧭",
    gradient: "from-sky-500 to-blue-600",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
  },
  activity: {
    label: "Activity",
    icon: "⚡",
    gradient: "from-emerald-500 to-teal-600",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
};

const DIFFICULTY_CONFIG = {
  easy: { color: "bg-green-100 text-green-700 border-green-200" },
  moderate: { color: "bg-amber-100 text-amber-700 border-amber-200" },
  hard: { color: "bg-orange-100 text-orange-700 border-orange-200" },
  expert: { color: "bg-red-100 text-red-700 border-red-200" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getImageSrc = (value) => {
  if (!value) return null;
  if (typeof value === "string") return renderImage(value);
  return null;
};

// ─── Atoms ───────────────────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <h3 className='text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 mb-3'>
    {children}
  </h3>
);

const StatCard = ({ icon, label, value }) => (
  <div className='flex flex-col items-center justify-center bg-white rounded-2xl p-4 border border-gray-100 shadow-sm gap-1 text-center min-h-[84px]'>
    <span className='text-xl'>{icon}</span>
    <p className='text-sm font-bold text-gray-800 leading-tight'>
      {value ?? "—"}
    </p>
    <p className='text-[10px] text-gray-400 font-medium uppercase tracking-wider'>
      {label}
    </p>
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className='flex items-center gap-3 py-3 border-b border-gray-50 last:border-0'>
    <span className='text-base w-6 text-center flex-shrink-0'>{icon}</span>
    <span className='text-sm text-gray-500'>{label}</span>
    <span className='text-sm font-semibold text-gray-800 ml-auto text-right'>
      {value}
    </span>
  </div>
);

// ─── Gallery ──────────────────────────────────────────────────────────────────
const GallerySection = ({ images }) => {
  const [active, setActive] = useState(0);
  if (!images?.length) return null;
  return (
    <div>
      <SectionTitle>Gallery · {images.length} photos</SectionTitle>
      <div className='rounded-2xl overflow-hidden aspect-video bg-gray-100 mb-2'>
        <img
          key={active}
          src={getImageSrc(images[active]?.url ?? images[active])}
          alt=''
          className='w-full h-full object-cover transition-all duration-300'
        />
      </div>
      <div className='flex gap-2 overflow-x-auto pb-1'>
        {images.map((img, i) => (
          <button
            key={i}
            type='button'
            onClick={() => setActive(i)}
            className={`flex-shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
              i === active
                ? "border-amber-400 scale-105 shadow-sm"
                : "border-transparent opacity-50 hover:opacity-80"
            }`}
          >
            <img
              src={getImageSrc(img?.url ?? img)}
              alt=''
              className='w-full h-full object-cover'
            />
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Inclusions / Exclusions ──────────────────────────────────────────────────
const InclusionsExclusions = ({ inclusions, exclusions }) => {
  if (!inclusions?.length && !exclusions?.length) return null;
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
      {inclusions?.length > 0 && (
        <div>
          <SectionTitle>Inclusions</SectionTitle>
          <div className='space-y-2'>
            {inclusions.map((inc, i) => (
              <div key={i} className='flex items-center gap-2.5'>
                <span className='w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-black flex-shrink-0'>
                  ✓
                </span>
                <span className='text-sm text-gray-700'>
                  {inc.text ?? inc.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {exclusions?.length > 0 && (
        <div>
          <SectionTitle>Exclusions</SectionTitle>
          <div className='space-y-2'>
            {exclusions.map((exc, i) => (
              <div key={i} className='flex items-center gap-2.5'>
                <span className='w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-[10px] font-black flex-shrink-0'>
                  ✕
                </span>
                <span className='text-sm text-gray-700'>
                  {exc.text ?? exc.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Type-specific main content ───────────────────────────────────────────────
const TourDetails = ({ tour }) => (
  <>
    <div className='grid grid-cols-3 gap-3'>
      <StatCard
        icon='📅'
        label='Duration'
        value={tour.duration_days ? `${tour.duration_days} days` : null}
      />
      <StatCard icon='👥' label='Max Group' value={tour.max_group_size} />
      <StatCard
        icon='💰'
        label='Per Day'
        value={
          tour.price && tour.duration_days
            ? `$${Math.round(tour.price / tour.duration_days)}`
            : null
        }
      />
    </div>

    {tour.itineraries?.length > 0 && (
      <div>
        <SectionTitle>Itinerary · {tour.itineraries.length} days</SectionTitle>
        <div className='relative'>
          <div className='absolute left-[18px] top-0 bottom-0 w-px bg-amber-100' />
          <div className='space-y-4'>
            {tour.itineraries.map((day, i) => (
              <div key={i} className='flex gap-4 relative'>
                <div className='w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-amber-900 font-black text-xs shrink-0 z-10 shadow-sm shadow-amber-200'>
                  {day.day}
                </div>
                <div className='flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm'>
                  {day.image && (
                    <img
                      src={renderImage(day.image)}
                      alt={day.title}
                      className='w-full h-28 object-cover'
                    />
                  )}
                  <div className='p-3'>
                    <p className='font-bold text-gray-800 text-sm'>
                      {day.title}
                    </p>
                    {day.location && (
                      <p className='text-xs text-gray-400 flex items-center gap-1 mt-0.5'>
                        <svg
                          className='w-3 h-3 flex-shrink-0'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                          />
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                          />
                        </svg>
                        {day.location}
                      </p>
                    )}
                    {day.description && (
                      <p className='text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2'>
                        {day.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </>
);

const ExcursionDetails = ({ tour }) => (
  <>
    <div className='grid grid-cols-3 gap-3'>
      <StatCard
        icon='⏱️'
        label='Duration'
        value={tour.duration_hours ? `${tour.duration_hours}h` : null}
      />
      <StatCard icon='👥' label='Max Group' value={tour.max_group_size} />
      <StatCard
        icon='💰'
        label='Price'
        value={tour.price ? `$${Number(tour.price).toLocaleString()}` : null}
      />
    </div>
    <div>
      <SectionTitle>Logistics</SectionTitle>
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm px-4'>
        {tour.departure_time && (
          <InfoRow icon='🕗' label='Departure' value={tour.departure_time} />
        )}
        {tour.return_time && (
          <InfoRow icon='🕕' label='Return' value={tour.return_time} />
        )}
        {tour.meeting_point && (
          <InfoRow icon='📍' label='Meeting Point' value={tour.meeting_point} />
        )}
        <InfoRow
          icon={tour.guide_included ? "✅" : "❌"}
          label='Guide'
          value={tour.guide_included ? "Included" : "Not included"}
        />
      </div>
    </div>
  </>
);

const ActivityDetails = ({ tour }) => (
  <>
    <div className='grid grid-cols-3 gap-3'>
      <StatCard
        icon='⏱️'
        label='Duration'
        value={tour.duration_hours ? `${tour.duration_hours}h` : null}
      />
      <StatCard icon='👥' label='Max Group' value={tour.max_group_size} />
      <StatCard
        icon='💰'
        label='Price'
        value={tour.price ? `$${Number(tour.price).toLocaleString()}` : null}
      />
    </div>
    <div>
      <SectionTitle>Details</SectionTitle>
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm px-4'>
        {tour.difficulty_level && (
          <div className='flex items-center gap-3 py-3 border-b border-gray-50'>
            <span className='text-base w-6 text-center'>📊</span>
            <span className='text-sm text-gray-500'>Difficulty</span>
            <span
              className={`ml-auto text-xs font-bold px-3 py-1 rounded-full border capitalize ${
                DIFFICULTY_CONFIG[tour.difficulty_level]?.color
              }`}
            >
              {tour.difficulty_level}
            </span>
          </div>
        )}
        <InfoRow
          icon={tour.equipment_included ? "✅" : "❌"}
          label='Equipment'
          value={tour.equipment_included ? "Included" : "Not included"}
        />
      </div>
    </div>
  </>
);

// ─── Sticky booking card ──────────────────────────────────────────────────────
const BookingCard = ({ tour, config }) => (
  <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6'>
    <div className={`bg-gradient-to-r ${config.gradient} px-5 py-4`}>
      {/*       <p className='text-white/75 text-xs font-medium mb-0.5'>Starting from</p>
       */}{" "}
      <p className='text-white text-3xl font-black leading-none'>
        ${Number(tour.price ?? 0).toLocaleString()}
      </p>
    </div>

    <div className='p-5 space-y-4'>
      <div className='space-y-2.5'>
        {tour.duration_days && (
          <div className='flex justify-between text-sm'>
            <span className='text-gray-500'>Duration</span>
            <span className='font-semibold text-gray-800'>
              {tour.duration_days} days
            </span>
          </div>
        )}
        {tour.duration_hours && (
          <div className='flex justify-between text-sm'>
            <span className='text-gray-500'>Duration</span>
            <span className='font-semibold text-gray-800'>
              {tour.duration_hours} hours
            </span>
          </div>
        )}
        {tour.max_group_size && (
          <div className='flex justify-between text-sm'>
            <span className='text-gray-500'>Max group</span>
            <span className='font-semibold text-gray-800'>
              {tour.max_group_size} people
            </span>
          </div>
        )}
        {tour.category && (
          <div className='flex justify-between text-sm'>
            <span className='text-gray-500'>Category</span>
            <span className='font-semibold text-gray-800'>{tour.category}</span>
          </div>
        )}
        {tour.departure_time && (
          <div className='flex justify-between text-sm'>
            <span className='text-gray-500'>Departure</span>
            <span className='font-semibold text-gray-800'>
              {tour.departure_time}
            </span>
          </div>
        )}
        {tour.meeting_point && (
          <div className='flex justify-between text-sm'>
            <span className='text-gray-500'>Meet at</span>
            <span className='font-semibold text-gray-800 text-right max-w-[150px] truncate'>
              {tour.meeting_point}
            </span>
          </div>
        )}
        {tour.difficulty_level && (
          <div className='flex justify-between text-sm items-center'>
            <span className='text-gray-500'>Difficulty</span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize ${
                DIFFICULTY_CONFIG[tour.difficulty_level]?.color
              }`}
            >
              {tour.difficulty_level}
            </span>
          </div>
        )}
      </div>

      {/* <div className='border-t border-gray-100 pt-4 space-y-2'>
        <button
          type='button'
          className={`w-full py-3.5 rounded-xl font-bold text-sm text-white uppercase tracking-wide bg-gradient-to-r ${config.gradient} hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-sm`}
        >
          Book Now
        </button>
        <p className='text-[11px] text-gray-400 text-center'>
          Free cancellation · No hidden fees
        </p>
      </div> */}
    </div>
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className='animate-pulse'>
    <div className='h-[420px] lg:h-[520px] bg-gray-200' />
    <div className='max-w-7xl mx-auto px-4 md:px-8 py-10'>
      <div className='grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10'>
        <div className='space-y-5'>
          <div className='h-8 bg-gray-200 rounded-full w-3/4' />
          <div className='h-4 bg-gray-200 rounded-full w-1/3' />
          <div className='h-20 bg-gray-200 rounded-2xl' />
          <div className='grid grid-cols-3 gap-3'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='h-24 bg-gray-200 rounded-2xl' />
            ))}
          </div>
          <div className='h-48 bg-gray-200 rounded-2xl' />
        </div>
        <div className='space-y-4'>
          <div className='h-48 bg-gray-200 rounded-2xl' />
          <div className='h-20 bg-gray-200 rounded-2xl' />
        </div>
      </div>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const TourPreview = ({ tourId }) => {
  const params = useParams();
  const id = tourId ?? params.id;

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchTour = async () => {
      try {
        setLoading(true);
        const data = await tourService.getById(id);
        setTour(data);
      } catch (err) {
        setError("Failed to load. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  if (loading) return <Skeleton />;
  if (error)
    return (
      <div className='min-h-[60vh] flex flex-col items-center justify-center gap-3'>
        <p className='text-5xl'>😕</p>
        <p className='text-gray-500 font-medium'>{error}</p>
      </div>
    );
  if (!tour) return null;

  const type = tour.type ?? "tour";
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.tour;
  const coverSrc = getImageSrc(tour.cover_image);

  return (
    <div className='min-h-screen bg-gray-50/60'>
      {/* ── Full-bleed hero ── */}
      <div className='relative h-[420px] lg:h-[520px] overflow-hidden'>
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={tour.title}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center'>
            <svg
              className='w-20 h-20 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1}
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          </div>
        )}

        <div className='absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent' />

        <div className='absolute top-5 left-5 flex gap-2 flex-wrap'>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border backdrop-blur-sm ${config.badge}`}
          >
            {config.icon} {config.label}
          </span>
          {tour.is_featured && (
            <span className='bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow'>
              ⭐ Featured
            </span>
          )}
          {tour.is_hot_deal && (
            <span className='bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow'>
              🔥 Hot Deal
            </span>
          )}
        </div>

        {tour.category && (
          <div className='absolute top-5 right-5'>
            <span className='bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30'>
              {tour.category}
            </span>
          </div>
        )}

        <div className='absolute bottom-0 left-0 right-0 px-5 md:px-8 pb-8'>
          <div className='max-w-7xl mx-auto'>
            <h1 className='text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-2 drop-shadow-md'>
              {tour.title}
            </h1>
            {tour.destination && (
              <p className='text-white/70 text-sm flex items-center gap-1.5'>
                <svg
                  className='w-4 h-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
                {tour.destination}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-column content grid ── */}
      <div className='max-w-7xl mx-auto px-4 md:px-8 py-10'>
        <div className='grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 items-start'>
          {/* LEFT — main content */}
          <div className='space-y-10 min-w-0'>
            {tour.description && (
              <div>
                <SectionTitle>About</SectionTitle>
                <p className='text-gray-600 leading-relaxed'>
                  {tour.description}
                </p>
              </div>
            )}

            <div className='space-y-6'>
              {type === "tour" && <TourDetails tour={tour} />}
              {type === "excursion" && <ExcursionDetails tour={tour} />}
              {type === "activity" && <ActivityDetails tour={tour} />}
            </div>

            <GallerySection images={tour.images} />

            <InclusionsExclusions
              inclusions={tour.inclusions}
              exclusions={tour.exclusions}
            />
          </div>

          {/* RIGHT — sticky booking card (desktop) */}
          <div className='hidden lg:block'>
            <BookingCard tour={tour} config={config} />
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom CTA */}
      <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between shadow-lg z-30'>
        <div>
          <p className='text-xs text-gray-400 font-medium'>Starting from</p>
          <p className='text-xl font-black text-gray-900'>
            ${Number(tour.price ?? 0).toLocaleString()}
          </p>
        </div>
        <button
          type='button'
          className={`bg-gradient-to-r ${config.gradient} text-white font-bold text-sm px-8 py-3 rounded-xl shadow active:scale-95 transition-all`}
        >
          Book Now
        </button>
      </div>
      <div className='lg:hidden h-20' />
    </div>
  );
};

export default TourPreview;
