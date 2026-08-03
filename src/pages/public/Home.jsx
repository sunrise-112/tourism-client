import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Services
import tourService from "../../services/tourService";
import categoryService from "../../services/categoryService";

// Utils
import { categoryKeyMap } from "../../utils/CategoriesMap";
import renderImage from "../../utils/renderImage";

// ─── Hero Configuration ──────────────────────────────────────
const HERO_BACKGROUND_VIDEO = "/vids/intro_video.mp4";
const HERO_BACKGROUND_IMAGES = [
  "https://static.nationalgeographic.fr/files/styles/image_3200/public/gettyimages-2152143162-sergioformoso.webp?w=1600&h=900",
  "https://cdn.kimkim.com/files/a/images/894bcea8f7b3280f46fc3e578957b3e0d539c3d1/big-17b6d7f2b8f83830737bf1e34760346a.jpg",
  "https://desert-maroc.com/wordpress2012/wp-content/uploads/Merzouga-quad-dunes.jpg",
  "https://www.tracedirecte.com/media/original_images/merzouga-maroc.jpg.1920x0_q85_format-jpg.jpg",
  "https://cdn.getyourguide.com/img/location/5ce40df7ba69b.jpeg/99.jpg",
  "https://www.visitmorocco.com/sites/default/files/styles/thumbnail_events_slider/public/thumbnails/image/taroudant-region.jpg?itok=Bg7aCk73",
  "https://images.contentstack.io/v3/assets/blt06f605a34f1194ff/blta948221ad65d5977/6897a1fdf5108cc1f790d3b3/iStock-2188765875-MOBILE-HEADER.jpg?fit=crop&disable=upscale&auto=webp&quality=60&crop=smart",
];

const CAROUSEL_INTERVAL_MS = 5000;

// ─── Stats ────────────────────────────────────────────────────
const stats = [
  { value: 120, suffix: "+", labelKey: "home.stats.destinations" },
  { value: 4.9, suffix: "★", labelKey: "home.stats.avgRating" },
  { value: 8, suffix: "K+", labelKey: "home.stats.happyTravelers" },
  { value: 12, suffix: "yr", labelKey: "home.stats.experience" },
];

// ─── Why Choose Us ────────────────────────────────────────────
const whyChooseUs = [
  {
    icon: "fa-shield-alt",
    titleKey: "home.why.safe",
    descKey: "home.why.safeDesc",
  },
  { icon: "fa-tag", titleKey: "home.why.price", descKey: "home.why.priceDesc" },
  {
    icon: "fa-headset",
    titleKey: "home.why.support",
    descKey: "home.why.supportDesc",
  },
  {
    icon: "fa-route",
    titleKey: "home.why.custom",
    descKey: "home.why.customDesc",
  },
];

// ─── Custom Hooks ─────────────────────────────────────────────
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isIntersecting];
};

const useCountUp = (end, duration = 2000, start = 0) => {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(start + (end - start) * easeOutQuart);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isVisible, end, duration, start]);

  return [ref, count];
};

// ─── Animated Section Wrapper ─────────────────────────────────
const AnimatedSection = ({ children, className = "", delay = 0 }) => {
  const [ref, isVisible] = useIntersectionObserver();
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// ─── Tour Card ───────────────────────────────────────────────
const TourCard = ({ tour, t, index = 0 }) => {
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
        hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-2 
        transition-all duration-500 ease-out flex flex-col h-full'
      style={{
        fontFamily: "'DM Sans', sans-serif",
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className='relative h-60 overflow-hidden bg-stone-100'>
        {tour.cover_image ? (
          <img
            src={renderImage(tour.cover_image)}
            alt={tour.title}
            className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out'
            loading='lazy'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-stone-300 bg-stone-50'>
            <i className='fa fa-image text-5xl opacity-40' />
          </div>
        )}

        <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500' />

        <div className='absolute top-4 left-4 flex flex-wrap gap-2'>
          {tour.is_hot_deal && (
            <span className='flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'>
              <i className='fa fa-fire text-[10px]' /> {t("home.badge.hotDeal")}
            </span>
          )}
          {tour.is_featured && (
            <span className='flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-400 text-amber-900 shadow-lg shadow-amber-400/30'>
              <i className='fa fa-star text-[10px]' />{" "}
              {t("home.badge.featured")}
            </span>
          )}
        </div>

        {typeLabel && (
          <span className='absolute top-4 right-4 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white/95 text-stone-700 shadow-lg backdrop-blur-md'>
            <i className='fa fa-tag text-[10px]' /> {typeLabel}
          </span>
        )}

        <div className='absolute bottom-4 right-4 bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 border border-white/10'>
          <i className='fa fa-clock text-[10px]' />
          {t("home.tourCard.durationDays", { count: tour.duration_days })}
        </div>
      </div>

      <div className='p-5 flex flex-col flex-1'>
        <p className='text-xs text-amber-600 font-semibold flex items-center gap-1.5 mb-2 uppercase tracking-wider'>
          <i className='fa fa-map-marker-alt' />
          {tour.destination}
        </p>
        <h3 className='font-bold text-base text-stone-800 group-hover:text-amber-700 transition-colors duration-300 line-clamp-1 mb-2 leading-snug'>
          {tour.title}
        </h3>
        <p className='text-sm text-stone-400 line-clamp-2 mb-4 leading-relaxed flex-1'>
          {tour.description}
        </p>
        <div className='flex items-center justify-between pt-4 border-t border-stone-100 mt-auto'>
          <div>
            <span className='text-xs text-stone-400 block mb-0.5'>
              {t("home.tourCard.from")}
            </span>
            <p className='text-2xl font-black text-amber-600 tracking-tight'>
              ${tour.price}
            </p>
          </div>
          <span className='flex items-center gap-2 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-5 py-2.5 rounded-xl transition-all duration-300 group-hover:gap-3'>
            {t("home.tourCard.explore")}{" "}
            <i className='fa fa-arrow-right text-xs transition-transform group-hover:translate-x-1' />
          </span>
        </div>
      </div>
    </Link>
  );
};

// ─── Section Header ─────────────────────────────────────────
const SectionHeader = ({ eyebrowKey, titleKey, subtitleKey, right, t }) => (
  <div className='flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4'>
    <div className='max-w-2xl'>
      {eyebrowKey && (
        <p className='text-xs font-bold uppercase tracking-[0.25em] text-amber-600 mb-3 flex items-center gap-2'>
          <span className='w-8 h-px bg-amber-600 inline-block' />
          {t(eyebrowKey)}
        </p>
      )}
      <h2 className='text-3xl md:text-4xl lg:text-5xl font-black text-stone-800 leading-[1.1] tracking-tight'>
        {typeof titleKey === "string" ? t(titleKey) : titleKey}
      </h2>
      {subtitleKey && (
        <p className='text-stone-400 text-base mt-3 leading-relaxed'>
          {t(subtitleKey)}
        </p>
      )}
    </div>
    {right && <div className='flex-shrink-0'>{right}</div>}
  </div>
);

// ─── Skeleton Card ──────────────────────────────────────────
const SkeletonCard = () => (
  <div className='bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm'>
    <div className='h-60 bg-stone-100 animate-pulse' />
    <div className='p-5 space-y-4'>
      <div className='h-3 bg-stone-100 rounded-full w-1/3' />
      <div className='h-5 bg-stone-100 rounded-full w-3/4' />
      <div className='h-3 bg-stone-100 rounded-full w-full' />
      <div className='h-3 bg-stone-100 rounded-full w-2/3' />
      <div className='pt-4 border-t border-stone-100 flex justify-between'>
        <div className='h-8 bg-stone-100 rounded-full w-1/4' />
        <div className='h-10 bg-stone-100 rounded-xl w-1/3' />
      </div>
    </div>
  </div>
);

// ─── Stat Item with Count Up ────────────────────────────────
const StatItem = ({ value, suffix, label }) => {
  const isDecimal = value % 1 !== 0;
  const [ref, count] = useCountUp(value, 2500);

  return (
    <div ref={ref} className='text-center px-4 py-2 group'>
      <p className='text-4xl md:text-5xl font-black text-amber-900 mb-2 tabular-nums tracking-tight'>
        {isDecimal ? count.toFixed(1) : Math.floor(count)}
        {suffix}
      </p>
      <p className='text-sm text-amber-800/60 font-semibold uppercase tracking-widest'>
        {label}
      </p>
    </div>
  );
};

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const carouselIntervalRef = useRef(null);
  const heroRef = useRef(null);

  // Hero carousel
  useEffect(() => {
    carouselIntervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === HERO_BACKGROUND_IMAGES.length - 1 ? 0 : prev + 1,
      );
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(carouselIntervalRef.current);
  }, []);

  const handleManualSlide = useCallback((index) => {
    setCurrentImageIndex(index);
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
      carouselIntervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) =>
          prev === HERO_BACKGROUND_IMAGES.length - 1 ? 0 : prev + 1,
        );
      }, CAROUSEL_INTERVAL_MS);
    }
  }, []);

  const fetchCategories = async (limit = 12) => {
    try {
      const res = await categoryService.getAll({ is_active: true, limit });
      const transformed = res?.data?.map((cat) => ({
        ...cat,
        labelKey: `home.categories.${cat?.name}`,
      }));
      setCategories(transformed);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
    if (search.trim())
      window.location.href = `/tours?q=${encodeURIComponent(search)}`;
  };

  const translatedStats = stats.map((s) => ({
    ...s,
    label: t(s.labelKey),
  }));

  const translatedCategories = categories.map((cat) => ({
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
      <section className='bg-white py-24'>
        <div className='max-w-7xl mx-auto px-6'>
          <AnimatedSection>
            <SectionHeader
              eyebrowKey={eyebrowKey}
              titleKey={titleKey}
              right={
                viewAllLink && (
                  <Link
                    to={viewAllLink}
                    className='group flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors bg-amber-50 hover:bg-amber-100 px-5 py-2.5 rounded-full'
                  >
                    {t("home.section.viewAll")}
                    <i className='fa fa-arrow-right text-xs transition-transform group-hover:translate-x-1' />
                  </Link>
                )
              }
              t={t}
            />
          </AnimatedSection>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {data.map((item, idx) => (
              <AnimatedSection key={item.id} delay={idx * 100}>
                <TourCard tour={item} t={t} index={idx} />
              </AnimatedSection>
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
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className='relative h-[100dvh] flex items-center justify-center overflow-hidden'
      >
        {/* Background Layer: Image Carousel + Video */}
        <div className='absolute inset-0 w-full h-full z-0'>
          {/* Ken Burns Image Carousel (behind video, visible when video loads) */}
          {HERO_BACKGROUND_IMAGES.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-all duration-[2000ms] ease-in-out ${
                index === currentImageIndex
                  ? "opacity-100 scale-105"
                  : "opacity-0 scale-100"
              }`}
            >
              <div
                className='w-full h-full bg-cover bg-center bg-no-repeat'
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          ))}

          {/* Video Overlay */}
          <div
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${isVideoLoaded ? "opacity-100" : "opacity-0"}`}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              preload='auto'
              poster={HERO_BACKGROUND_IMAGES[0]}
              onLoadedData={() => setIsVideoLoaded(true)}
              className='absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover'
            >
              <source src={HERO_BACKGROUND_VIDEO} type='video/mp4' />
            </video>
          </div>
        </div>

        {/* Gradient Overlays */}
        <div className='absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 z-[1]' />
        <div className='absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 z-[1]' />

        {/* Hero Content */}
        <div className='relative z-10 max-w-5xl mx-auto px-6 text-center pt-20'>
          <AnimatedSection>
            <div className='inline-flex items-center gap-2 bg-white/10 text-amber-200 text-xs font-semibold px-5 py-2.5 rounded-full border border-white/20 mb-8 backdrop-blur-md shadow-lg shadow-black/10 hover:bg-white/15 transition-colors cursor-default'>
              <i
                className='fa fa-globe-africa animate-spin-slow'
                style={{ animationDuration: "8s" }}
              />
              {t("home.hero.eyebrow")}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <h1
              className='text-5xl sm:text-6xl md:text-8xl font-black text-white leading-[0.95] tracking-tight mb-6 drop-shadow-2xl'
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t("home.hero.titleLine1")}
              <span
                className='block text-transparent bg-clip-text py-3'
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #FCD34D, #F59E0B, #FB923C, #FCD34D)",
                  backgroundSize: "300% 300%",
                  animation: "gradientShift 6s ease infinite",
                  paddingLeft: "0.05em",
                  paddingRight: "0.05em",
                }}
              >
                {t("home.hero.titleLine2")}
              </span>
              {t("home.hero.titleLine3")}
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={400}>
            <p className='text-stone-200 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light'>
              {t("home.hero.subtitle")}
            </p>
          </AnimatedSection>

          <AnimatedSection delay={600}>
            <form
              onSubmit={handleSearch}
              className='flex flex-col sm:flex-row items-center gap-3 bg-white/10 border border-white/20 rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto mb-10 backdrop-blur-xl hover:bg-white/15 transition-all duration-500 focus-within:bg-white/20 focus-within:border-amber-400/50 focus-within:shadow-amber-900/20'
            >
              <div className='flex items-center gap-3 flex-1 w-full px-4 py-2'>
                <i className='fa fa-search text-stone-400 text-sm' />
                <input
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("home.hero.searchPlaceholder")}
                  className='flex-1 bg-transparent text-sm outline-none text-white placeholder-stone-400 w-full'
                />
              </div>
              <button
                type='submit'
                className='w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all duration-300 px-8 py-3.5 rounded-xl shadow-lg shadow-amber-400/25'
              >
                {t("home.hero.searchButton")}{" "}
                <i className='fa fa-arrow-right text-xs' />
              </button>
            </form>
          </AnimatedSection>

          <AnimatedSection delay={800}>
            <div className='flex flex-wrap justify-center gap-3'>
              {quickTags.map((tag) => (
                <Link
                  key={tag.key}
                  to={`/tours?q=${encodeURIComponent(tag.query)}`}
                  className='text-xs text-stone-300 hover:text-amber-300 border border-white/15 hover:border-amber-400/50 px-5 py-2 rounded-full transition-all duration-300 backdrop-blur-sm hover:bg-white/5 hover:-translate-y-0.5'
                >
                  {t(tag.key)}
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </div>

        {/* Carousel Navigation Dots */}
        {/**
         * <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_BACKGROUND_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => handleManualSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentImageIndex ? "w-8 bg-amber-400 shadow-lg shadow-amber-400/50" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
         * 
        */}

        {/* Scroll Indicator */}
        <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 z-10 animate-bounce'>
          <span className='text-[10px] tracking-[0.3em] uppercase font-medium'>
            {t("home.hero.scroll")}
          </span>
          <i className='fa fa-chevron-down text-xs' />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════════ */}
      <section className='relative bg-amber-500 overflow-hidden'>
        <div
          className='absolute inset-0 opacity-10'
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.3) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className='max-w-6xl mx-auto px-6 py-14 relative'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x divide-amber-400/30'>
            {translatedStats.map((s, i) => (
              <div
                key={i}
                className={`${i % 2 === 1 ? "md:border-r md:border-l" : ""} md:border-amber-400/30`}
              >
                <StatItem value={s.value} suffix={s.suffix} label={s.label} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CATEGORIES
      ═══════════════════════════════════════════════════════ */}
      <section className='max-w-7xl mx-auto px-6 py-24'>
        <AnimatedSection>
          <SectionHeader
            eyebrowKey='home.categories.eyebrow'
            titleKey='home.categories.title'
            subtitleKey='home.categories.subtitle'
            t={t}
          />
        </AnimatedSection>

        <div className='grid grid-cols-3 md:grid-cols-6 gap-4 mt-14'>
          {translatedCategories.map((cat, idx) => (
            <AnimatedSection key={cat.id || cat.labelKey} delay={idx * 75}>
              <Link
                to={`/tours?category=${cat?.id || ""}`}
                className='flex flex-col items-center gap-4 p-6 rounded-2xl bg-white border border-stone-100 shadow-sm hover:shadow-xl hover:shadow-stone-200/50 hover:-translate-y-2 hover:border-stone-200 transition-all duration-400 ease-out group'
              >
                <div
                  className='w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-400 group-hover:scale-110 group-hover:rotate-3 shadow-sm'
                  style={{ background: cat.bg }}
                >
                  <i className={`${cat.icon} text-lg text-white`} />
                </div>
                <span className='text-xs font-bold tracking-wide text-stone-500 group-hover:text-stone-800 text-center leading-tight transition-colors duration-200'>
                  {cat.label}
                </span>
              </Link>
            </AnimatedSection>
          ))}
        </div>

        <div className='flex items-center justify-center gap-3 mt-10'>
          {!showMore ? (
            <button
              onClick={() => {
                fetchCategories(30);
                setShowMore(true);
              }}
              className='flex items-center gap-2 px-8 py-3 rounded-full border border-stone-200 bg-white text-xs font-bold tracking-wider uppercase text-stone-500 hover:bg-stone-50 hover:border-stone-300 hover:text-stone-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer'
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
              className='flex items-center gap-2 px-8 py-3 rounded-full border border-stone-200 bg-white text-xs font-bold tracking-wider uppercase text-stone-500 hover:bg-stone-50 hover:border-stone-300 hover:text-stone-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer'
            >
              <i className='fa-solid fa-chevron-up text-stone-400' />
              {t("home.categories.showLess")}
            </button>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          WHY CHOOSE US
      ═══════════════════════════════════════════════════════ */}
      <section className='bg-white py-24 border-y border-stone-100'>
        <div className='max-w-7xl mx-auto px-6'>
          <AnimatedSection>
            <SectionHeader
              eyebrowKey='home.why.eyebrow'
              titleKey='home.why.title'
              subtitleKey='home.why.subtitle'
              t={t}
            />
          </AnimatedSection>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14'>
            {whyChooseUs.map((item, idx) => (
              <AnimatedSection key={item.titleKey} delay={idx * 100}>
                <div className='group p-8 rounded-3xl bg-stone-50 border border-stone-100 hover:bg-white hover:shadow-xl hover:shadow-stone-200/40 hover:-translate-y-1 transition-all duration-500 text-center'>
                  <div className='w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 shadow-sm'>
                    <i className={`fa ${item.icon}`} />
                  </div>
                  <h3 className='font-bold text-stone-800 mb-2 group-hover:text-amber-700 transition-colors'>
                    {t(item.titleKey)}
                  </h3>
                  <p className='text-sm text-stone-400 leading-relaxed'>
                    {t(item.descKey)}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURED TOURS
      ═══════════════════════════════════════════════════════ */}
      <section className='bg-stone-50/50 py-24'>
        <div className='max-w-7xl mx-auto px-6'>
          <AnimatedSection>
            <SectionHeader
              eyebrowKey='home.featured.eyebrow'
              titleKey='home.featured.title'
              subtitleKey='home.featured.subtitle'
              right={
                <Link
                  to='/tours?is_featured=true'
                  className='group flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors bg-white hover:bg-amber-50 border border-amber-200 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md'
                >
                  {t("home.featured.viewAll")}
                  <i className='fa fa-arrow-right text-xs transition-transform group-hover:translate-x-1' />
                </Link>
              }
              t={t}
            />
          </AnimatedSection>

          {loading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : featuredTours.length === 0 ? (
            <div className='text-center py-24 text-stone-300'>
              <i className='fa fa-map text-6xl mb-6 block opacity-40' />
              <p className='text-stone-400 text-lg'>
                {t("home.featured.empty")}
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {featuredTours.map((tour, idx) => (
                <AnimatedSection key={tour.id} delay={idx * 100}>
                  <TourCard tour={tour} t={t} index={idx} />
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOT DEALS
      ═══════════════════════════════════════════════════════ */}
      {hotDeals.length > 0 && (
        <section className='bg-white py-24 relative overflow-hidden'>
          <div className='absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2' />
          <div className='absolute bottom-0 left-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-60 translate-y-1/2 -translate-x-1/2' />

          <div className='max-w-7xl mx-auto px-6 relative'>
            <AnimatedSection>
              <SectionHeader
                eyebrowKey='home.hotDeals.eyebrow'
                titleKey='home.hotDeals.title'
                subtitleKey='home.hotDeals.subtitle'
                right={
                  <Link
                    to='/tours?is_hot_deal=true'
                    className='group flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 px-5 py-2.5 rounded-full'
                  >
                    {t("home.hotDeals.viewAll")}
                    <i className='fa fa-arrow-right text-xs transition-transform group-hover:translate-x-1' />
                  </Link>
                }
                t={t}
              />
            </AnimatedSection>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {hotDeals.map((tour, idx) => (
                <AnimatedSection key={tour.id} delay={idx * 150}>
                  <TourCard tour={tour} t={t} index={idx} />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          TOURS / EXCURSIONS / ACTIVITIES
      ═══════════════════════════════════════════════════════ */}
      {!loading && (
        <>
          {renderSection(
            "home.toursSection.title",
            tours,
            "/tours?type=tour",
            "home.toursSection.eyebrow",
          )}
          {renderSection(
            "home.excursionsSection.title",
            excursions,
            "/tours?type=excursion",
            "home.excursionsSection.eyebrow",
          )}
          {renderSection(
            "home.activitiesSection.title",
            activities,
            "/tours?type=activity",
            "home.activitiesSection.eyebrow",
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className='max-w-7xl mx-auto px-6 py-24'>
        <AnimatedSection>
          <div className='relative rounded-[2.5rem] overflow-hidden bg-stone-900 p-12 md:p-20 text-center shadow-2xl'>
            {/* Animated gradient background */}
            <div
              className='absolute inset-0 opacity-30'
              style={{
                background:
                  "linear-gradient(135deg, #92400e 0%, #b45309 25%, #d97706 50%, #b45309 75%, #92400e 100%)",
                backgroundSize: "400% 400%",
                animation: "gradientShift 8s ease infinite",
              }}
            />

            {/* Pattern overlay */}
            <div
              className='absolute inset-0 opacity-[0.07]'
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Decorative elements */}
            <div className='absolute top-10 left-10 w-20 h-20 border border-white/10 rounded-full' />
            <div className='absolute bottom-10 right-10 w-32 h-32 border border-white/10 rounded-full' />
            <div className='absolute top-1/2 left-10 w-2 h-2 bg-amber-400 rounded-full animate-pulse' />
            <div className='absolute top-1/3 right-20 w-3 h-3 bg-amber-500/50 rounded-full' />

            <div className='relative z-10 max-w-3xl mx-auto'>
              <p className='text-xs font-bold uppercase tracking-[0.3em] text-amber-400 mb-6'>
                {t("home.cta.eyebrow")}
              </p>
              <h2
                className='text-4xl md:text-6xl font-black text-white mb-6 leading-[1.1]'
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {t("home.cta.title")}
              </h2>
              <p className='text-stone-300 text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed font-light'>
                {t("home.cta.subtitle")}
              </p>
              <div className='flex items-center justify-center gap-4 flex-wrap'>
                <Link
                  to='/tours'
                  className='group flex items-center gap-2 text-sm font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 transition-all duration-300 px-8 py-4 rounded-xl shadow-lg shadow-amber-400/25 hover:shadow-amber-400/40 hover:-translate-y-0.5'
                >
                  {t("home.cta.browseButton")}
                  <i className='fa fa-arrow-right transition-transform group-hover:translate-x-1' />
                </Link>
                <Link
                  to='/contact'
                  className='group flex items-center gap-2 text-sm font-semibold text-white hover:text-amber-200 border border-white/20 hover:border-amber-400/50 px-8 py-4 rounded-xl transition-all duration-300 hover:bg-white/5'
                >
                  {t("home.cta.contactButton")}
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CSS KEYFRAMES (inject via style tag)
      ═══════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Home;
