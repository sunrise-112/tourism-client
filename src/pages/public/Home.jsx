import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Services
import tourService from "../../services/tourService";
import categoryService from "../../services/categoryService";

// Utils
import { categoryKeyMap } from "../../utils/CategoriesMap";
import renderImage from "../../utils/renderImage";

// ─── Hero background images carousel configuration ─────────────
// Easily edit this array to add, remove, or change background images
const HERO_BACKGROUND_IMAGES = [
  "https://static.nationalgeographic.fr/files/styles/image_3200/public/gettyimages-2152143162-sergioformoso.webp?w=1600&h=900",
  "https://cdn.kimkim.com/files/a/images/894bcea8f7b3280f46fc3e578957b3e0d539c3d1/big-17b6d7f2b8f83830737bf1e34760346a.jpg",
  "https://desert-maroc.com/wordpress2012/wp-content/uploads/Merzouga-quad-dunes.jpg",
  "https://www.tracedirecte.com/media/original_images/merzouga-maroc.jpg.1920x0_q85_format-jpg.jpg",
  "https://cdn.getyourguide.com/img/location/5ce40df7ba69b.jpeg/99.jpg",
  "https://www.visitmorocco.com/sites/default/files/styles/thumbnail_events_slider/public/thumbnails/image/taroudant-region.jpg?itok=Bg7aCk73",
  "https://images.contentstack.io/v3/assets/blt06f605a34f1194ff/blta948221ad65d5977/6897a1fdf5108cc1f790d3b3/iStock-2188765875-MOBILE-HEADER.jpg?fit=crop&disable=upscale&auto=webp&quality=60&crop=smart",
];
const CAROUSEL_INTERVAL_MS = 3000; // 5 seconds per image

// ─── Stats ────────────────────────────────────────────────────
const stats = [
  { value: "120+", labelKey: "home.stats.destinations" },
  { value: "4.9★", labelKey: "home.stats.avgRating" },
  { value: "8K+", labelKey: "home.stats.happyTravelers" },
  { value: "12yr", labelKey: "home.stats.experience" },
];

// ─── Categories ───────────────────────────────────────────────
const categories = [
  {
    labelKey: "home.categories.adventure",
    icon: "fa-mountain",
    bg: "#FFF4ED",
    color: "#C2500A",
  },
  {
    labelKey: "home.categories.beach",
    icon: "fa-umbrella-beach",
    bg: "#EDF7FF",
    color: "#0A6EC2",
  },
  {
    labelKey: "home.categories.cultural",
    icon: "fa-landmark",
    bg: "#F5F0FF",
    color: "#6B21A8",
  },
  {
    labelKey: "home.categories.wildlife",
    icon: "fa-paw",
    bg: "#EDFFF4",
    color: "#15803D",
  },
  {
    labelKey: "home.categories.city",
    icon: "fa-city",
    bg: "#EFF6FF",
    color: "#1D4ED8",
  },
  {
    labelKey: "home.categories.wellness",
    icon: "fa-spa",
    bg: "#FFF0F6",
    color: "#BE185D",
  },
];

// ─── Tour Card ───────────────────────────────────────────────
const TourCard = ({ tour, t }) => {
  const typeLabelKey = tour.type
    ? `home.tourCard.type.${tour.type.toLowerCase()}`
    : null;
  const typeLabel =
    typeLabelKey && t(typeLabelKey) !== typeLabelKey
      ? t(typeLabelKey)
      : tour.type || "";

  return (
    <Link
      to={`/tours/${tour.id}`}
      className='group relative bg-white rounded-2xl overflow-hidden border border-stone-100
        hover:shadow-2xl hover:shadow-amber-900/10 hover:-translate-y-1.5 transition-all duration-400'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className='relative h-56 overflow-hidden bg-stone-100'>
        {tour.cover_image ? (
          <img
            src={renderImage(tour.cover_image)}
            alt={tour.title}
            className='w-full h-full object-cover group-hover:scale-108 transition-transform duration-700'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-stone-300'>
            <i className='fa fa-image text-4xl' />
          </div>
        )}

        <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent' />

        <div className='absolute top-3 left-3 flex gap-1.5'>
          {tour.is_hot_deal && (
            <span className='flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white shadow-sm'>
              <i className='fa fa-fire text-[10px]' /> {t("home.badge.hotDeal")}
            </span>
          )}
          {tour.is_featured && (
            <span className='flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-amber-900 shadow-sm'>
              <i className='fa fa-star text-[10px]' />{" "}
              {t("home.badge.featured")}
            </span>
          )}
          {typeLabel && (
            <span className='flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-white/90 text-stone-700 shadow-sm backdrop-blur-sm'>
              <i className='fa fa-tag text-[10px]' /> {typeLabel}
            </span>
          )}
        </div>

        <div className='absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1'>
          <i className='fa fa-clock text-[10px]' />
          {t("home.tourCard.durationDays", { count: tour.duration_days })}
        </div>
      </div>

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
            <span className='text-xs text-stone-400 block'>
              {t("home.tourCard.from")}
            </span>
            <p className='text-xl font-black text-amber-600'>${tour.price}</p>
          </div>
          <span className='flex items-center gap-1.5 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-xl transition-colors'>
            {t("home.tourCard.explore")}{" "}
            <i className='fa fa-arrow-right text-xs' />
          </span>
        </div>
      </div>
    </Link>
  );
};

// ─── Section Header ─────────────────────────────────────────
const SectionHeader = ({ eyebrowKey, titleKey, subtitleKey, right, t }) => (
  <div className='flex items-end justify-between mb-10'>
    <div>
      {eyebrowKey && (
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-600 mb-2'>
          {t(eyebrowKey)}
        </p>
      )}
      <h2 className='text-3xl md:text-4xl font-black text-stone-800 leading-tight'>
        {typeof titleKey === "string" ? t(titleKey) : titleKey}
      </h2>
      {subtitleKey && (
        <p className='text-stone-400 text-sm mt-2'>{t(subtitleKey)}</p>
      )}
    </div>
    {right}
  </div>
);

// ─── Skeleton Card ──────────────────────────────────────────
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

// ─── Home Page ───────────────────────────────────────────────
const Home = () => {
  const { t } = useTranslation();
  const [featuredTours, setFeaturedTours] = useState([]);
  const [hotDeals, setHotDeals] = useState([]);
  const [tours, setTours] = useState([]);
  const [excursions, setExcursions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showMore, setShowMore] = useState(false);

  // Hero carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselIntervalRef = useRef(null);

  const fetchCategories = async (limit = 12) => {
    try {
      const categories = await categoryService.getAll({
        is_active: true,
        limit,
      });
      const transformed = categories?.data?.map((cat) => ({
        ...cat,
        labelKey: `home.categories.${cat?.name}`,
      }));
      setCategories(transformed);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ─── Hero image carousel auto-advance ─────────────────────
  useEffect(() => {
    // Start auto-advancing carousel
    carouselIntervalRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === HERO_BACKGROUND_IMAGES.length - 1 ? 0 : prevIndex + 1
      );
    }, CAROUSEL_INTERVAL_MS);

    // Cleanup interval on unmount
    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
    };
  }, []);

  // Optional: Pause carousel on hover (uncomment if desired)
  // const pauseCarousel = () => {
  //   if (carouselIntervalRef.current) clearInterval(carouselIntervalRef.current);
  // };
  // const resumeCarousel = () => {
  //   carouselIntervalRef.current = setInterval(() => {
  //     setCurrentImageIndex((prevIndex) =>
  //       prevIndex === HERO_BACKGROUND_IMAGES.length - 1 ? 0 : prevIndex + 1
  //     );
  //   }, CAROUSEL_INTERVAL_MS);
  // };

  // ─── Fetch tours data ─────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, dealsRes, toursRes, excursionsRes, activitiesRes] =
          await Promise.all([
            tourService.getAll({ is_featured: true, limit: 6 }),
            tourService.getAll({ is_hot_deal: true, limit: 3 }),
            tourService.getAll({ type: "tour", limit: 3 }),
            tourService.getAll({ type: "excursion", limit: 3 }),
            tourService.getAll({ type: "activity", limit: 3 }),
          ]);

        setFeaturedTours(featuredRes?.data || []);
        setHotDeals(dealsRes?.data || []);
        setTours(toursRes?.data || []);
        setExcursions(excursionsRes?.data || []);
        setActivities(activitiesRes?.data || []);
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) window.location.href = `/tours?q=${search}`;
  };

  const translatedStats = stats?.map((s) => ({
    value: s.value,
    label: t(s.labelKey),
  }));

  const translatedCategories = categories?.map((cat) => ({
    ...cat,
    label: t(`home.categories.${categoryKeyMap[cat?.name] ?? cat?.name}`),
  }));

  const quickTags = [
    { key: "home.quickTags.sahara", query: "Sahara" },
    { key: "home.quickTags.marrakech", query: "Marrakech" },
    { key: "home.quickTags.atlasMountains", query: "Atlas Mountains" },
    { key: "home.quickTags.coastalTours", query: "Coastal Tours" },
  ];

  const renderSection = (titleKey, data, viewAllLink, eyebrowKey = null) => {
    if (!data.length) return null;
    return (
      <section className='bg-white py-20'>
        <div className='max-w-6xl mx-auto px-6'>
          <SectionHeader
            eyebrowKey={eyebrowKey}
            titleKey={titleKey}
            right={
              viewAllLink && (
                <Link
                  to={viewAllLink}
                  className='flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors'
                >
                  {t("home.section.viewAll")}{" "}
                  <i className='fa fa-arrow-right text-xs' />
                </Link>
              )
            }
            t={t}
          />
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {data?.map((item) => (
              <TourCard key={item.id} tour={item} t={t} />
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div
      className='min-h-screen bg-stone-50'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── HERO with Background Image Carousel ─────────────────── */}
      <section
        className='relative h-screen flex items-center justify-center overflow-hidden'
        // Optional: pause on hover - uncomment the following line and add handlers
        // onMouseEnter={pauseCarousel} onMouseLeave={resumeCarousel}
      >
        {/* Carousel Images Container */}
        <div className='absolute inset-0 w-full h-full z-0'>
          {HERO_BACKGROUND_IMAGES?.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className='w-full h-full bg-cover bg-center bg-no-repeat'
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          ))}
        </div>

        {/* Dark overlay for readability */}
        <div className='absolute inset-0 bg-black/50 z-5' />

        {/* Hero content */}
        <div className='relative z-10 max-w-5xl mx-auto px-6 text-center'>
          <div className='inline-flex items-center gap-2 bg-amber-400/10 text-amber-300 text-xs font-semibold px-5 py-2.5 rounded-full border border-amber-400/20 mb-8 backdrop-blur-sm'>
            <i className='fa fa-globe-africa' />
            {t("home.hero.eyebrow")}
          </div>

          <h1
            className='text-6xl md:text-8xl font-black text-white leading-[0.95] tracking-tight mb-6'
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("home.hero.titleLine1")}
            <span
              className='block text-transparent bg-clip-text'
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #F59E0B, #FB923C, #FBBF24)",
              }}
            >
              {t("home.hero.titleLine2")}
            </span>
            {t("home.hero.titleLine3")}
          </h1>

          <p className='text-stone-300 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed'>
            {t("home.hero.subtitle")}
          </p>

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
                placeholder={t("home.hero.searchPlaceholder")}
                className='flex-1 bg-transparent text-sm outline-none text-white placeholder-stone-500'
              />
            </div>
            <button
              type='submit'
              className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-6 py-3 rounded-xl'
            >
              {t("home.hero.searchButton")}{" "}
              <i className='fa fa-arrow-right text-xs' />
            </button>
          </form>

          <div className='flex flex-wrap justify-center gap-2'>
            {quickTags?.map((tag) => (
              <Link
                key={tag.key}
                to={`/tours?q=${tag.query}`}
                className='text-xs text-stone-300 hover:text-amber-300 border border-white/10 hover:border-amber-400/40 px-4 py-1.5 rounded-full transition-all backdrop-blur-sm'
              >
                {t(tag.key)}
              </Link>
            ))}
          </div>
        </div>

        {/* Optional: Carousel navigation dots */}
        <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10'>
          {HERO_BACKGROUND_IMAGES?.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentImageIndex(index);
                // Reset interval timer when manually changing
                if (carouselIntervalRef.current) {
                  clearInterval(carouselIntervalRef.current);
                  carouselIntervalRef.current = setInterval(() => {
                    setCurrentImageIndex((prevIndex) =>
                      prevIndex === HERO_BACKGROUND_IMAGES.length - 1
                        ? 0
                        : prevIndex + 1
                    );
                  }, CAROUSEL_INTERVAL_MS);
                }
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? "w-6 bg-amber-400"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <div
          className='absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-stone-300 animate-bounce pointer-events-none z-10'
          style={{ marginBottom: "1.5rem" }} // Offset to avoid overlap with dots
        >
          <span className='text-xs tracking-widest uppercase'>
            {t("home.hero.scroll")}
          </span>
          <i className='fa fa-chevron-down text-xs' />
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className='bg-amber-500'>
        <div className='max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-amber-400/40'>
          {translatedStats.map((s) => (
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
      <section className='max-w-6xl mx-auto px-6 py-24'>
        <SectionHeader
          eyebrowKey='home.categories.eyebrow'
          titleKey='home.categories.title'
          subtitleKey='home.categories.subtitle'
          t={t}
        />

        <div className='grid grid-cols-3 md:grid-cols-6 gap-3 mt-12'>
          {translatedCategories?.map((cat) => (
            <Link
              key={cat.labelKey}
              to={`/tours?category=${cat?.id}`}
              className='
          flex flex-col items-center gap-3 p-5
          rounded-2xl bg-white border border-stone-100
          shadow-sm hover:shadow-xl hover:shadow-stone-200/60
          hover:-translate-y-2 hover:border-stone-200
          transition-all duration-300 ease-out group cursor-pointer
        '
            >
              <div
                className='w-12 h-12 rounded-xl flex items-center justify-center
            transition-all duration-300 group-hover:scale-110 group-hover:rounded-2xl shadow-sm'
                style={{ background: cat.bg }}
              >
                <i className={`${cat?.icon} text-white text-base`} />
              </div>
              <span
                className='
          text-[11px] font-semibold tracking-wide 
          text-stone-400 group-hover:text-stone-700
          text-center leading-tight transition-colors duration-200
        '
              >
                {cat.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Show More / Show Less buttons below the grid */}
        <div className='flex items-center justify-center gap-3 mt-8'>
          {!showMore ? (
            <button
              onClick={() => {
                fetchCategories(30);
                setShowMore(true);
              }}
              className='
          flex items-center gap-2 px-6 py-2.5
          rounded-full border border-stone-200 bg-white
          text-xs font-semibold tracking-wide uppercase text-stone-500
          hover:bg-stone-50 hover:border-stone-300 hover:text-stone-700
          shadow-sm hover:shadow-md transition-all duration-300 ease-out
          cursor-pointer
        '
            >
              <i className='fa-solid fa-ellipsis text-stone-400' />
              {t("home.categories.showMore")}
            </button>
          ) : (
            <button
              onClick={() => {
                fetchCategories();
                setShowMore(false);
              }}
              className='
                flex items-center gap-2 px-6 py-2.5
                rounded-full border border-stone-200 bg-white
                text-xs font-semibold tracking-wide uppercase text-stone-500
                hover:bg-stone-50 hover:border-stone-300 hover:text-stone-700
                shadow-sm hover:shadow-md transition-all duration-300 ease-out
                cursor-pointer
              '
            >
              <i className='fa-solid fa-chevron-up text-stone-400' />
              {t("home.categories.showLess")}
            </button>
          )}
        </div>
      </section>

      {/* ── FEATURED TOURS ───────────────────────────────── */}
      <section className='bg-white py-20'>
        <div className='max-w-6xl mx-auto px-6'>
          <SectionHeader
            eyebrowKey='home.featured.eyebrow'
            titleKey='home.featured.title'
            subtitleKey='home.featured.subtitle'
            right={
              <Link
                to='/tours?is_featured=true'
                className='flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors'
              >
                {t("home.featured.viewAll")}{" "}
                <i className='fa fa-arrow-right text-xs' />
              </Link>
            }
            t={t}
          />

          {loading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {[...Array(6)]?.map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : featuredTours.length === 0 ? (
            <div className='text-center py-20 text-stone-300'>
              <i className='fa fa-map text-5xl mb-4 block' />
              <p className='text-stone-400'>{t("home.featured.empty")}</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {featuredTours?.map((tour) => (
                <TourCard key={tour.id} tour={tour} t={t} />
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
              eyebrowKey='home.hotDeals.eyebrow'
              titleKey='home.hotDeals.title'
              subtitleKey='home.hotDeals.subtitle'
              right={
                <Link
                  to='/tours?is_hot_deal=true'
                  className='flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors'
                >
                  {t("home.hotDeals.viewAll")}{" "}
                  <i className='fa fa-arrow-right text-xs' />
                </Link>
              }
              t={t}
            />
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {hotDeals?.map((tour) => (
                <TourCard key={tour.id} tour={tour} t={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── NEW SECTIONS: Tours, Excursions, Activities ─────── */}
      {!loading && (
        <>
          {renderSection(
            "home.toursSection.title",
            tours,
            "/tours?type=tour",
            "home.toursSection.eyebrow"
          )}
          {renderSection(
            "home.excursionsSection.title",
            excursions,
            "/tours?type=excursion",
            "home.excursionsSection.eyebrow"
          )}
          {renderSection(
            "home.activitiesSection.title",
            activities,
            "/tours?type=activity",
            "home.activitiesSection.eyebrow"
          )}
        </>
      )}

      {/* ── CTA ──────────────────────────────────────────── */}

      <section className='max-w-6xl mx-auto px-6 py-20'>
        <div className='relative rounded-3xl overflow-hidden bg-lame-50 p-16 text-center shadow-xl'>
          {/* Subtle sand pattern overlay */}
          <div
            className='absolute inset-0 opacity-[0.03]'
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, #d6a354 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Warm glow (like desert sun) */}
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-orange-500/10 rounded-full blur-[80px] pointer-events-none' />

          <div className='relative z-10'>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-orange-500 mb-4'>
              {t("home.cta.eyebrow")}
            </p>
            <h2
              className='text-5xl font-black text-stone-800 mb-4'
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t("home.cta.title")}
            </h2>
            <p className='text-stone-500 text-lg mb-10 max-w-xl mx-auto leading-relaxed'>
              {t("home.cta.subtitle")}
            </p>
            <div className='flex items-center justify-center gap-4 flex-wrap'>
              <Link
                to='/tours'
                className='flex items-center gap-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors px-8 py-3.5 rounded-xl shadow-md'
              >
                {t("home.cta.browseButton")} <i className='fa fa-arrow-right' />
              </Link>
              <Link
                to='/contact'
                className='flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 border border-orange-300 hover:border-orange-400 px-8 py-3.5 rounded-xl transition-all'
              >
                {t("home.cta.contactButton")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
