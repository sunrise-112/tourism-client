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
  {
    label: "Adventure",
    icon: "fa-mountain",
    color: "bg-orange-50 text-orange-600 border-orange-200",
  },
  {
    label: "Beach",
    icon: "fa-umbrella-beach",
    color: "bg-cyan-50 text-cyan-600 border-cyan-200",
  },
  {
    label: "Cultural",
    icon: "fa-landmark",
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    label: "Wildlife",
    icon: "fa-paw",
    color: "bg-green-50 text-green-600 border-green-200",
  },
  {
    label: "City",
    icon: "fa-city",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    label: "Wellness",
    icon: "fa-spa",
    color: "bg-pink-50 text-pink-600 border-pink-200",
  },
];

// ─── Tour Card ────────────────────────────────────────────────
const TourCard = ({ tour }) => (
  <Link
    to={`/tours/${tour.id}`}
    className='group relative bg-base-100 rounded-2xl overflow-hidden border border-base-200
      hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
  >
    {/* Image */}
    <div className='relative h-52 overflow-hidden bg-base-200'>
      {tour.cover_image ? (
        <img
          src={`${import.meta.env.VITE_BACK_END_URL}${tour.cover_image}`}
          alt={tour.title}
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
        />
      ) : (
        <div className='w-full h-full flex items-center justify-center text-base-content/20'>
          <i className='fa fa-image text-4xl' />
        </div>
      )}
      {/* Badges */}
      <div className='absolute top-3 left-3 flex gap-2'>
        {tour.is_hot_deal && (
          <span className='badge badge-error badge-sm font-semibold gap-1'>
            <i className='fa fa-fire text-xs' /> Hot Deal
          </span>
        )}
        {tour.is_featured && (
          <span className='badge badge-warning badge-sm font-semibold gap-1'>
            <i className='fa fa-star text-xs' /> Featured
          </span>
        )}
      </div>
      {/* Duration pill */}
      <div className='absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm'>
        <i className='fa fa-clock mr-1' />
        {tour.duration_days}d
      </div>
    </div>

    {/* Content */}
    <div className='p-4'>
      <div className='flex items-start justify-between gap-2 mb-1'>
        <h3 className='font-bold text-base text-base-content group-hover:text-accent transition-colors line-clamp-1'>
          {tour.title}
        </h3>
      </div>
      <p className='text-xs text-base-content/50 flex items-center gap-1 mb-3'>
        <i className='fa fa-map-marker-alt text-accent' />
        {tour.destination}
      </p>
      <p className='text-sm text-base-content/60 line-clamp-2 mb-4'>
        {tour.description}
      </p>
      <div className='flex items-center justify-between'>
        <div>
          <span className='text-xs text-base-content/40'>From</span>
          <p className='text-lg font-bold text-accent'>${tour.price}</p>
        </div>
        <div className='btn btn-accent btn-sm rounded-xl gap-1'>
          Explore <i className='fa fa-arrow-right text-xs' />
        </div>
      </div>
    </div>
  </Link>
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
    <div className='min-h-screen bg-base-200'>
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className='relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-base-100'>
        {/* Background pattern */}
        <div
          className='absolute inset-0 opacity-5'
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Decorative blobs */}
        <div className='absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute bottom-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none' />

        <div className='relative z-10 max-w-4xl mx-auto px-6 text-center'>
          {/* Eyebrow */}
          <div className='inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-semibold px-4 py-2 rounded-full border border-accent/20 mb-6'>
            <i className='fa fa-globe-africa' />
            Explore the world with us
          </div>

          {/* Heading */}
          <h1 className='text-5xl md:text-7xl font-black text-base-content leading-tight mb-6'>
            Your Next
            <span className='block bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent'>
              Adventure
            </span>
            Awaits
          </h1>

          <p className='text-base-content/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed'>
            Discover breathtaking destinations, handcrafted tours, and
            unforgettable experiences curated just for you.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className='flex items-center gap-3 bg-base-100 border border-base-300 rounded-2xl p-2 shadow-xl max-w-2xl mx-auto mb-8'
          >
            <div className='flex items-center gap-3 flex-1 px-3'>
              <i className='fa fa-search text-base-content/30' />
              <input
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Where do you want to go?'
                className='flex-1 bg-transparent text-sm outline-none text-base-content placeholder-base-content/30'
              />
            </div>
            <button
              type='submit'
              className='btn btn-accent rounded-xl px-6 gap-2'
            >
              Search <i className='fa fa-arrow-right' />
            </button>
          </form>

          {/* Quick links */}
          <div className='flex flex-wrap justify-center gap-2'>
            {["Sahara", "Marrakech", "Atlas Mountains", "Coastal Tours"].map(
              (tag) => (
                <Link
                  key={tag}
                  to={`/tours?q=${tag}`}
                  className='text-xs text-base-content/50 hover:text-accent border border-base-300 hover:border-accent px-3 py-1.5 rounded-full transition-colors'
                >
                  {tag}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-base-content/30 animate-bounce'>
          <span className='text-xs'>Scroll</span>
          <i className='fa fa-chevron-down text-xs' />
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────── */}
      <section className='bg-accent py-10'>
        <div className='max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6'>
          {stats.map((s) => (
            <div key={s.label} className='text-center'>
              <p className='text-3xl font-black text-accent-content'>
                {s.value}
              </p>
              <p className='text-sm text-accent-content/70 mt-1'>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────────── */}
      <section className='max-w-6xl mx-auto px-6 py-16'>
        <div className='text-center mb-10'>
          <h2 className='text-3xl font-black text-base-content mb-2'>
            Browse by Category
          </h2>
          <p className='text-base-content/50 text-sm'>
            Find the perfect experience for your travel style
          </p>
        </div>
        <div className='grid grid-cols-3 md:grid-cols-6 gap-4'>
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={`/tours?category=${cat.label.toLowerCase()}`}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl border
                hover:-translate-y-1 hover:shadow-md transition-all duration-200 bg-base-100 ${cat.color}`}
            >
              <i className={`fa ${cat.icon} text-2xl`} />
              <span className='text-xs font-semibold'>{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED TOURS ─────────────────────────────────── */}
      <section className='max-w-6xl mx-auto px-6 py-8 pb-16'>
        <div className='flex items-end justify-between mb-8'>
          <div>
            <h2 className='text-3xl font-black text-base-content'>
              Featured Tours
            </h2>
            <p className='text-base-content/50 text-sm mt-1'>
              Handpicked experiences you'll love
            </p>
          </div>
          <Link
            to='/tours?is_featured=true'
            className='btn btn-ghost btn-sm gap-1 text-accent'
          >
            View all <i className='fa fa-arrow-right text-xs' />
          </Link>
        </div>

        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className='bg-base-100 rounded-2xl overflow-hidden animate-pulse'
              >
                <div className='h-52 bg-base-300' />
                <div className='p-4 space-y-3'>
                  <div className='h-4 bg-base-300 rounded w-3/4' />
                  <div className='h-3 bg-base-300 rounded w-1/2' />
                  <div className='h-3 bg-base-300 rounded w-full' />
                </div>
              </div>
            ))}
          </div>
        ) : featuredTours.length === 0 ? (
          <div className='text-center py-16 text-base-content/30'>
            <i className='fa fa-map text-4xl mb-3 block' />
            <p>No featured tours available</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {featuredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </section>

      {/* ── HOT DEALS ──────────────────────────────────────── */}
      {hotDeals.length > 0 && (
        <section className='bg-base-100 py-16'>
          <div className='max-w-6xl mx-auto px-6'>
            <div className='flex items-end justify-between mb-8'>
              <div>
                <div className='flex items-center gap-2 mb-1'>
                  <i className='fa fa-fire text-error' />
                  <span className='text-xs font-semibold text-error uppercase tracking-widest'>
                    Limited time
                  </span>
                </div>
                <h2 className='text-3xl font-black text-base-content'>
                  Hot Deals
                </h2>
              </div>
              <Link
                to='/tours?is_hot_deal=true'
                className='btn btn-ghost btn-sm gap-1 text-accent'
              >
                View all <i className='fa fa-arrow-right text-xs' />
              </Link>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {hotDeals.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className='max-w-6xl mx-auto px-6 py-16'>
        <div className='relative bg-linear-to-br from-primary to-accent rounded-3xl p-12 text-center overflow-hidden'>
          <div
            className='absolute inset-0 opacity-10'
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className='relative z-10'>
            <h2 className='text-4xl font-black text-white mb-4'>
              Ready to Explore?
            </h2>
            <p className='text-white/80 text-lg mb-8 max-w-xl mx-auto'>
              Join thousands of happy travelers and start planning your dream
              trip today.
            </p>
            <div className='flex items-center justify-center gap-4 flex-wrap'>
              <Link
                to='/tours'
                className='btn btn-white rounded-xl px-8 gap-2 font-bold'
              >
                Browse Tours <i className='fa fa-arrow-right' />
              </Link>
              <Link
                to='/contact'
                className='btn btn-outline btn-white rounded-xl px-8'
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
