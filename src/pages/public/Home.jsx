import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import tourService from "../../services/tourService";

// ─── Stats ────────────────────────────────────────────────────
const stats = [
  { value: "120+", label: "Destinations" },
  { value: "4.9★", label: "Avg Rating" },
  { value: "8K+", label: "Happy Travelers" },
  { value: "12yr", label: "Experience" },
];

// ─── Categories ───────────────────────────────────────────────
const categories = [
  { label: "Adventure", icon: "fa-mountain", bg: "#FFF4ED", color: "#C2500A" },
  {
    label: "Beach",
    icon: "fa-umbrella-beach",
    bg: "#EDF7FF",
    color: "#0A6EC2",
  },
  { label: "Cultural", icon: "fa-landmark", bg: "#F5F0FF", color: "#6B21A8" },
  { label: "Wildlife", icon: "fa-paw", bg: "#EDFFF4", color: "#15803D" },
  { label: "City", icon: "fa-city", bg: "#EFF6FF", color: "#1D4ED8" },
  { label: "Wellness", icon: "fa-spa", bg: "#FFF0F6", color: "#BE185D" },
];

// ─── Tour Card ────────────────────────────────────────────────
const TourCard = ({ tour }) => (
  <Link
    to={`/tours/${tour.id}`}
    className='group relative bg-white rounded-2xl overflow-hidden border border-stone-100
      hover:shadow-2xl hover:shadow-amber-900/10 hover:-translate-y-1.5 transition-all duration-400'
    style={{ fontFamily: "'DM Sans', sans-serif" }}
  >
    {/* Image */}
    <div className='relative h-56 overflow-hidden bg-stone-100'>
      {tour.cover_image ? (
        <img
          src={`${import.meta.env.VITE_BACKEND_URL}${tour.cover_image}`}
          alt={tour.title}
          className='w-full h-full object-cover group-hover:scale-108 transition-transform duration-700'
        />
      ) : (
        <div className='w-full h-full flex items-center justify-center text-stone-300'>
          <i className='fa fa-image text-4xl' />
        </div>
      )}

      {/* Gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent' />

      {/* Badges */}
      <div className='absolute top-3 left-3 flex gap-1.5'>
        {tour.is_hot_deal && (
          <span className='flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white shadow-sm'>
            <i className='fa fa-fire text-[10px]' /> Hot Deal
          </span>
        )}
        {tour.is_featured && (
          <span className='flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-amber-900 shadow-sm'>
            <i className='fa fa-star text-[10px]' /> Featured
          </span>
        )}
      </div>

      {/* Duration pill */}
      <div className='absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1'>
        <i className='fa fa-clock text-[10px]' />
        {tour.duration_days} days
      </div>
    </div>

    {/* Content */}
    <div className='p-5'>
      <p className='text-xs text-amber-600 font-semibold flex items-center gap-1 mb-1.5 uppercase tracking-wide'>
        <i className='fa fa-map-marker-alt' />
        {tour.destination}
      </p>
      <h3 className='font-bold text-base text-stone-800 group-hover:text-amber-700 transition-colors line-clamp-1 mb-2'>
        {tour.title}
      </h3>
      <p className='text-sm text-stone-400 line-clamp-2 mb-4 leading-relaxed'>
        {tour.description}
      </p>
      <div className='flex items-center justify-between pt-3 border-t border-stone-100'>
        <div>
          <span className='text-xs text-stone-400 block'>From</span>
          <p className='text-xl font-black text-amber-600'>${tour.price}</p>
        </div>
        <span className='flex items-center gap-1.5 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-xl transition-colors'>
          Explore <i className='fa fa-arrow-right text-xs' />
        </span>
      </div>
    </div>
  </Link>
);

// ─── Section Header ───────────────────────────────────────────
const SectionHeader = ({ eyebrow, title, subtitle, right }) => (
  <div className='flex items-end justify-between mb-10'>
    <div>
      {eyebrow && (
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-600 mb-2'>
          {eyebrow}
        </p>
      )}
      <h2 className='text-3xl md:text-4xl font-black text-stone-800 leading-tight'>
        {title}
      </h2>
      {subtitle && <p className='text-stone-400 text-sm mt-2'>{subtitle}</p>}
    </div>
    {right}
  </div>
);

// ─── Skeleton Card ────────────────────────────────────────────
const SkeletonCard = () => (
  <div className='bg-white rounded-2xl overflow-hidden border border-stone-100 animate-pulse'>
    <div className='h-56 bg-stone-100' />
    <div className='p-5 space-y-3'>
      <div className='h-3 bg-stone-100 rounded w-1/3' />
      <div className='h-4 bg-stone-100 rounded w-3/4' />
      <div className='h-3 bg-stone-100 rounded w-full' />
      <div className='h-3 bg-stone-100 rounded w-2/3' />
    </div>
  </div>
);

// ─── Home Page ────────────────────────────────────────────────
const Home = () => {
  const [featuredTours, setFeaturedTours] = useState([]);
  const [hotDeals, setHotDeals] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [featured, deals] = await Promise.all([
          tourService.getAll({ is_featured: true, limit: 6 }),
          tourService.getAll({ is_hot_deal: true, limit: 3 }),
        ]);
        setFeaturedTours(featured?.data || []);
        setHotDeals(deals?.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) window.location.href = `/tours?q=${search}`;
  };

  return (
    <div
      className='min-h-screen bg-stone-50'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className='relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#1C1107]'>
        {/* Background texture */}
        <div
          className='absolute inset-0 opacity-[0.04]'
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Warm glow blobs */}
        <div className='absolute top-0 right-0 w-[600px] h-[600px] bg-amber-600/20 rounded-full blur-[120px] pointer-events-none' />
        <div className='absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-800/20 rounded-full blur-[100px] pointer-events-none' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-900/10 rounded-full blur-[80px] pointer-events-none' />

        <div className='relative z-10 max-w-5xl mx-auto px-6 text-center'>
          {/* Eyebrow pill */}
          <div className='inline-flex items-center gap-2 bg-amber-400/10 text-amber-300 text-xs font-semibold px-5 py-2.5 rounded-full border border-amber-400/20 mb-8 backdrop-blur-sm'>
            <i className='fa fa-globe-africa' />
            Discover Morocco & Beyond
          </div>

          {/* Heading */}
          <h1
            className='text-6xl md:text-8xl font-black text-white leading-[0.95] tracking-tight mb-6'
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Your Next
            <span
              className='block text-transparent bg-clip-text'
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #F59E0B, #FB923C, #FBBF24)",
              }}
            >
              Adventure
            </span>
            Awaits
          </h1>

          <p className='text-stone-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed'>
            Handcrafted tours through ancient medinas, golden deserts, and
            dramatic mountain passes — designed for the curious traveler.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className='flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto mb-8 backdrop-blur-md'
          >
            <div className='flex items-center gap-3 flex-1 px-4'>
              <i className='fa fa-search text-stone-500 text-sm' />
              <input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Where do you want to go?'
                className='flex-1 bg-transparent text-sm outline-none text-white placeholder-stone-500'
              />
            </div>
            <button
              type='submit'
              className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-6 py-3 rounded-xl'
            >
              Search <i className='fa fa-arrow-right text-xs' />
            </button>
          </form>

          {/* Quick tags */}
          <div className='flex flex-wrap justify-center gap-2'>
            {["Sahara", "Marrakech", "Atlas Mountains", "Coastal Tours"].map(
              (tag) => (
                <Link
                  key={tag}
                  to={`/tours?q=${tag}`}
                  className='text-xs text-stone-400 hover:text-amber-300 border border-white/10 hover:border-amber-400/40 px-4 py-1.5 rounded-full transition-all backdrop-blur-sm'
                >
                  {tag}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-stone-600 animate-bounce'>
          <span className='text-xs tracking-widest uppercase'>Scroll</span>
          <i className='fa fa-chevron-down text-xs' />
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className='bg-amber-500'>
        <div className='max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-amber-400/40'>
          {stats.map((s) => (
            <div key={s.label} className='text-center px-4'>
              <p className='text-3xl font-black text-amber-900'>{s.value}</p>
              <p className='text-sm text-amber-800/70 font-medium mt-1 uppercase tracking-wider'>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className='max-w-6xl mx-auto px-6 py-20'>
        <SectionHeader
          eyebrow='Explore by type'
          title='Browse by Category'
          subtitle='Find the perfect experience for your travel style'
        />
        <div className='grid grid-cols-3 md:grid-cols-6 gap-4'>
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={`/tours?category=${cat.label.toLowerCase()}`}
              className='flex flex-col items-center gap-3 p-5 rounded-2xl border border-stone-100 bg-white
                hover:-translate-y-1.5 hover:shadow-lg hover:shadow-stone-200/80 transition-all duration-200 group'
            >
              <div
                className='w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-transform group-hover:scale-110'
                style={{ background: cat.bg, color: cat.color }}
              >
                <i className={`fa ${cat.icon}`} />
              </div>
              <span className='text-xs font-bold text-stone-500 group-hover:text-stone-700 transition-colors'>
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED TOURS ───────────────────────────────── */}
      <section className='bg-white py-20'>
        <div className='max-w-6xl mx-auto px-6'>
          <SectionHeader
            eyebrow='Handpicked for you'
            title='Featured Tours'
            subtitle='Experiences our travelers love most'
            right={
              <Link
                to='/tours?is_featured=true'
                className='flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors'
              >
                View all <i className='fa fa-arrow-right text-xs' />
              </Link>
            }
          />

          {loading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : featuredTours.length === 0 ? (
            <div className='text-center py-20 text-stone-300'>
              <i className='fa fa-map text-5xl mb-4 block' />
              <p className='text-stone-400'>No featured tours available yet</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {featuredTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── HOT DEALS ────────────────────────────────────── */}
      {hotDeals.length > 0 && (
        <section className='bg-stone-50 py-20'>
          <div className='max-w-6xl mx-auto px-6'>
            <SectionHeader
              eyebrow='Limited time'
              title={
                <span className='flex items-center gap-3'>
                  <i className='fa fa-fire text-red-500 text-3xl' />
                  Hot Deals
                </span>
              }
              subtitle="Grab these before they're gone"
              right={
                <Link
                  to='/tours?is_hot_deal=true'
                  className='flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors'
                >
                  View all <i className='fa fa-arrow-right text-xs' />
                </Link>
              }
            />
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {hotDeals.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className='max-w-6xl mx-auto px-6 py-20'>
        <div className='relative rounded-3xl overflow-hidden bg-[#1C1107] p-16 text-center'>
          {/* Texture */}
          <div
            className='absolute inset-0 opacity-[0.04]'
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Glow */}
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-amber-500/20 rounded-full blur-[80px] pointer-events-none' />

          <div className='relative z-10'>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-4'>
              Start your journey
            </p>
            <h2
              className='text-5xl font-black text-white mb-4'
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Ready to Explore?
            </h2>
            <p className='text-stone-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed'>
              Join thousands of happy travelers and start planning your dream
              trip today.
            </p>
            <div className='flex items-center justify-center gap-4 flex-wrap'>
              <Link
                to='/tours'
                className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-8 py-3.5 rounded-xl'
              >
                Browse Tours <i className='fa fa-arrow-right' />
              </Link>
              <Link
                to='/contact'
                className='flex items-center gap-2 text-sm font-semibold text-stone-300 hover:text-white border border-white/15 hover:border-white/30 px-8 py-3.5 rounded-xl transition-all'
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
