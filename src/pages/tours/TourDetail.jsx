import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import tourService from "../../services/tourService";
import renderImage from "../../utils/renderImage";

// ─── Mock Data (replace with API when ready) ──────────────────
const MOCK_REVIEWS = [
  {
    id: 1,
    name: "Sarah Mitchell",
    avatar: null,
    rating: 5,
    date: "March 2025",
    comment:
      "Absolutely breathtaking experience. Our guide was incredibly knowledgeable and the desert camp under the stars was unforgettable. Would recommend to anyone!",
  },
  {
    id: 2,
    name: "James Okafor",
    avatar: null,
    rating: 5,
    date: "February 2025",
    comment:
      "The perfect mix of adventure and culture. Fez medina was mind-blowing and the food was incredible throughout. Already planning my return trip.",
  },
  {
    id: 3,
    name: "Lena Hoffmann",
    avatar: null,
    rating: 4,
    date: "January 2025",
    comment:
      "Very well organized tour with great attention to detail. The Atlas mountains section was the highlight for me. Only minor issue was one hotel change.",
  },
];

const INCLUSIONS = [
  { icon: "fa-user-tie", text: "Professional licensed guide" },
  { icon: "fa-car", text: "All ground transportation" },
  { icon: "fa-bed", text: "Accommodation as per itinerary" },
  { icon: "fa-utensils", text: "Daily breakfast and dinner" },
  { icon: "fa-ticket-alt", text: "Entrance fees to all sites" },
  { icon: "fa-first-aid", text: "Travel insurance coverage" },
];

const EXCLUSIONS = [
  "International flights",
  "Personal travel insurance",
  "Optional activities",
  "Tips & gratuities",
];

const ITINERARY = [
  {
    day: 1,
    title: "Arrival & City Orientation",
    desc: "Welcome to Morocco! Transfer to your riad, evening orientation walk through the medina and welcome dinner.",
  },
  {
    day: 2,
    title: "Ancient Medina Exploration",
    desc: "Full day exploring the old city — tanneries, madrasas, spice markets, and hidden alleyways with your expert guide.",
  },
  {
    day: 3,
    title: "Mountain Drive & Kasbahs",
    desc: "Scenic drive through the Atlas Mountains, stopping at ancient kasbahs and Berber villages along the route.",
  },
  {
    day: 4,
    title: "Desert Arrival & Camel Trek",
    desc: "Arrive at the Sahara dunes by afternoon. Sunset camel trek to your luxury desert camp. Stargazing dinner.",
  },
  {
    day: 5,
    title: "Sunrise & Return Journey",
    desc: "Watch the desert sunrise before beginning your journey back, visiting the Draa Valley palm groves en route.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────
const StarRating = ({ rating, size = "text-sm" }) => (
  <div className='flex items-center gap-0.5'>
    {[1, 2, 3, 4, 5].map((s) => (
      <i
        key={s}
        className={`fa fa-star ${size} ${
          s <= rating ? "text-amber-400" : "text-stone-200"
        }`}
      />
    ))}
  </div>
);

const InitialAvatar = ({ name, size = "w-10 h-10" }) => (
  <div
    className={`${size} rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0`}
  >
    {name?.charAt(0)?.toUpperCase() || "?"}
  </div>
);

const SectionHeading = ({ eyebrow, title }) => (
  <div className='mb-8'>
    {eyebrow && (
      <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-2'>
        {eyebrow}
      </p>
    )}
    <h2
      className='text-2xl md:text-3xl font-black text-stone-800'
      style={{ fontFamily: "'Playfair Display', serif" }}
    >
      {title}
    </h2>
  </div>
);

// ─── Review Card ──────────────────────────────────────────────
const ReviewCard = ({ review }) => (
  <div className='bg-white rounded-2xl border border-stone-100 p-6'>
    <div className='flex items-start gap-4 mb-4'>
      <InitialAvatar name={review.name} />
      <div className='flex-1 min-w-0'>
        <p className='font-bold text-stone-800 text-sm'>{review.name}</p>
        <p className='text-xs text-stone-400'>{review.date}</p>
      </div>
      <StarRating rating={review.rating} />
    </div>
    <p className='text-sm text-stone-500 leading-relaxed'>{review.comment}</p>
  </div>
);

// ─── Related Tour Card ────────────────────────────────────────
const RelatedCard = ({ tour }) => (
  <Link
    to={`/tours/${tour.id}`}
    className='group bg-white rounded-2xl overflow-hidden border border-stone-100
      hover:shadow-xl hover:shadow-amber-900/10 hover:-translate-y-1 transition-all duration-300'
  >
    <div className='relative h-44 overflow-hidden bg-stone-100'>
      {tour.cover_image ? (
        <img
          src={`${import.meta.env.VITE_BACKEND_URL}${tour.cover_image}`}
          alt={tour.title}
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
        />
      ) : (
        <div className='w-full h-full flex items-center justify-center text-stone-300'>
          <i className='fa fa-image text-3xl' />
        </div>
      )}
      <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
      <div className='absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm'>
        <i className='fa fa-clock mr-1 text-[10px]' />
        {tour.duration_days}d
      </div>
    </div>
    <div className='p-4'>
      <p className='text-xs text-amber-600 font-semibold flex items-center gap-1 mb-1 uppercase tracking-wide'>
        <i className='fa fa-map-marker-alt text-[10px]' />
        {tour.destination}
      </p>
      <h3 className='font-bold text-sm text-stone-800 group-hover:text-amber-700 transition-colors line-clamp-1 mb-3'>
        {tour.title}
      </h3>
      <div className='flex items-center justify-between pt-3 border-t border-stone-100'>
        <p className='text-lg font-black text-amber-600'>${tour.price}</p>
        <span className='text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl'>
          View <i className='fa fa-arrow-right ml-1 text-[10px]' />
        </span>
      </div>
    </div>
  </Link>
);

// ─── TourDetail ───────────────────────────────────────────────
const TourDetail = () => {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [relatedTours, setRelatedTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [lightbox, setLightbox] = useState(null);
  const [comment, setComment] = useState({
    name: "",
    email: "",
    rating: 5,
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await tourService.getById(id);
        setTour(data);
        // Fetch related tours by category
        if (data?.category) {
          const related = await tourService.getAll({
            category: data.category,
            limit: 3,
          });
          const list = related?.data?.tours || related?.data || [];
          setRelatedTours(list.filter((t) => t.id !== data.id).slice(0, 3));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCommentChange = (e) =>
    setComment((c) => ({ ...c, [e.target.name]: e.target.value }));

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Replace with real API call: await reviewService.create(id, comment)
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setSubmitted(true);
    setComment({ name: "", email: "", rating: 5, message: "" });
  };

  // ── Gallery images (cover + extras if available) ──────────
  const galleryImages = tour
    ? [tour.cover_image, ...(tour.images || [])].filter(Boolean).slice(0, 6)
    : [];

  const avgRating = (
    MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length
  ).toFixed(1);

  const TABS = ["overview", "itinerary", "reviews", "map"];

  // ── Loading ──────────────────────────────────────────────
  if (loading)
    return (
      <div
        className='min-h-screen bg-stone-50 animate-pulse'
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className='h-[60vh] bg-stone-200' />
        <div className='max-w-6xl mx-auto px-6 py-10 space-y-4'>
          <div className='h-5 bg-stone-200 rounded w-1/4' />
          <div className='h-10 bg-stone-200 rounded w-2/3' />
          <div className='h-4 bg-stone-200 rounded w-full' />
          <div className='h-4 bg-stone-200 rounded w-4/5' />
        </div>
      </div>
    );

  // ── Not Found ────────────────────────────────────────────
  if (!tour)
    return (
      <div
        className='min-h-screen bg-stone-50 flex flex-col items-center justify-center text-center px-6'
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <i className='fa fa-map-marked-alt text-5xl text-stone-200 mb-4' />
        <h2 className='text-xl font-bold text-stone-600 mb-2'>
          Tour not found
        </h2>
        <p className='text-stone-400 text-sm mb-6'>
          This tour may have been removed or doesn't exist.
        </p>
        <Link
          to='/tours'
          className='flex items-center gap-2 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 px-5 py-2.5 rounded-xl hover:bg-amber-100 transition-colors'
        >
          <i className='fa fa-arrow-left text-xs' /> Back to Tours
        </Link>
      </div>
    );

  return (
    <div
      className='min-h-screen bg-stone-50'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── HERO ────────────────────────────────────────── */}
      <div className='relative h-[65vh] overflow-hidden bg-stone-900'>
        {tour.cover_image && (
          <img
            src={`${import.meta.env.VITE_BACKEND_URL}${tour.cover_image}`}
            alt={tour.title}
            className='w-full h-full object-cover opacity-75'
          />
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent' />

        {/* Back */}
        <div className='absolute top-6 left-6'>
          <Link
            to='/tours'
            className='flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 transition-all'
          >
            <i className='fa fa-arrow-left text-xs' /> All Tours
          </Link>
        </div>

        {/* Badges */}
        <div className='absolute top-6 right-6 flex gap-2'>
          {tour.is_hot_deal && (
            <span className='flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-500 text-white shadow'>
              <i className='fa fa-fire text-[10px]' /> Hot Deal
            </span>
          )}
          {tour.is_featured && (
            <span className='flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-400 text-amber-900 shadow'>
              <i className='fa fa-star text-[10px]' /> Featured
            </span>
          )}
        </div>

        {/* Hero content */}
        <div className='absolute bottom-0 left-0 right-0 px-6 pb-10 md:px-12'>
          <div className='max-w-6xl mx-auto'>
            {tour.category && (
              <span className='inline-block text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-3'>
                {tour.category}
              </span>
            )}
            <h1
              className='text-4xl md:text-6xl font-black text-white leading-tight mb-3'
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {tour.title}
            </h1>
            <div className='flex flex-wrap items-center gap-4 text-sm text-white/70'>
              <span className='flex items-center gap-1.5'>
                <i className='fa fa-map-marker-alt text-amber-400' />{" "}
                {tour.destination}
              </span>
              {tour.duration_days && (
                <span className='flex items-center gap-1.5'>
                  <i className='fa fa-clock text-amber-400' />{" "}
                  {tour.duration_days} days
                </span>
              )}
              {tour.max_group_size && (
                <span className='flex items-center gap-1.5'>
                  <i className='fa fa-users text-amber-400' /> Max{" "}
                  {tour.max_group_size} people
                </span>
              )}
              <span className='flex items-center gap-1.5'>
                <StarRating rating={Math.round(avgRating)} size='text-xs' />
                <span className='text-amber-400 font-bold'>{avgRating}</span>
                <span>({MOCK_REVIEWS.length} reviews)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY TABS ─────────────────────────────────── */}
      <div className='sticky top-0 z-20 bg-white border-b border-stone-100 shadow-sm'>
        <div className='max-w-6xl mx-auto px-6 md:px-12 flex items-center gap-1 overflow-x-auto scrollbar-hide'>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-4 text-sm font-semibold capitalize whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-amber-400 text-amber-600"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────── */}
      <div className='max-w-6xl mx-auto px-6 md:px-12 py-12'>
        <div className='flex flex-col lg:flex-row gap-12'>
          {/* ── LEFT CONTENT ────────────────────────── */}
          <div className='flex-1 min-w-0 space-y-16'>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <>
                {/* Quick stats */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  {[
                    {
                      icon: "fa-clock",
                      label: "Duration",
                      value: tour.duration_days
                        ? `${tour.duration_days} days`
                        : "—",
                    },
                    {
                      icon: "fa-users",
                      label: "Group Size",
                      value: tour.max_group_size
                        ? `Max ${tour.max_group_size}`
                        : "—",
                    },
                    {
                      icon: "fa-tag",
                      label: "Category",
                      value: tour.category || "—",
                    },
                    {
                      icon: "fa-map-marker-alt",
                      label: "Destination",
                      value: tour.destination || "—",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className='bg-white rounded-2xl border border-stone-100 p-5'
                    >
                      <div className='w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-3'>
                        <i className={`fa ${s.icon} text-amber-500 text-sm`} />
                      </div>
                      <p className='text-xs text-stone-400 uppercase tracking-wide font-medium mb-1'>
                        {s.label}
                      </p>
                      <p className='text-sm font-bold text-stone-700 truncate'>
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <SectionHeading
                    eyebrow='About this tour'
                    title='Tour Overview'
                  />
                  <p className='text-stone-500 leading-relaxed whitespace-pre-line text-[15px]'>
                    {tour.description || "No description available."}
                  </p>
                </div>

                {/* Inclusions / Exclusions */}
                <div>
                  <SectionHeading
                    eyebrow="What's covered"
                    title='Inclusions & Exclusions'
                  />
                  <div className='grid md:grid-cols-2 gap-6'>
                    <div className='bg-amber-50 border border-amber-100 rounded-2xl p-6 space-y-3'>
                      <p className='text-xs font-bold uppercase tracking-widest text-amber-600 mb-4'>
                        Included
                      </p>
                      {INCLUSIONS.map((item) => (
                        <div
                          key={item.text}
                          className='flex items-center gap-3 text-sm text-stone-600'
                        >
                          <span className='w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0'>
                            <i className='fa fa-check text-amber-600 text-[10px]' />
                          </span>
                          {item.text}
                        </div>
                      ))}
                    </div>
                    <div className='bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-3'>
                      <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-4'>
                        Not Included
                      </p>
                      {EXCLUSIONS.map((item) => (
                        <div
                          key={item}
                          className='flex items-center gap-3 text-sm text-stone-400'
                        >
                          <span className='w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center shrink-0'>
                            <i className='fa fa-times text-stone-400 text-[10px]' />
                          </span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gallery */}
                {galleryImages.length > 0 && (
                  <div>
                    <SectionHeading
                      eyebrow='Visual journey'
                      title='Photo Gallery'
                    />
                    <div className='grid grid-cols-3 gap-3'>
                      {galleryImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setLightbox(img)}
                          className={`relative overflow-hidden rounded-2xl bg-stone-100 group
                            ${
                              i === 0
                                ? "col-span-2 row-span-2 h-64"
                                : "h-[calc(8rem-6px)]"
                            }`}
                        >
                          <img
                            src={renderImage(img)}
                            alt={`Gallery ${i + 1}`}
                            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                          />
                          <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center'>
                            <i className='fa fa-expand text-white opacity-0 group-hover:opacity-100 transition-opacity' />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ITINERARY TAB */}
            {activeTab === "itinerary" && (
              <div>
                <SectionHeading eyebrow='Day by day' title='Tour Itinerary' />
                <div className='relative'>
                  {/* Timeline line */}
                  <div className='absolute left-5 top-0 bottom-0 w-px bg-amber-100' />
                  <div className='space-y-6'>
                    {ITINERARY.map((day, i) => (
                      <div key={day.day} className='flex gap-6 relative'>
                        <div className='w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-amber-900 font-black text-sm shrink-0 z-10 shadow-md shadow-amber-200'>
                          {day.day}
                        </div>
                        <div className='flex-1 bg-white rounded-2xl border border-stone-100 p-5 pb-6'>
                          <p className='text-xs font-bold uppercase tracking-widest text-amber-500 mb-1'>
                            Day {day.day}
                          </p>
                          <h3 className='font-black text-stone-800 mb-2'>
                            {day.title}
                          </h3>
                          <p className='text-sm text-stone-500 leading-relaxed'>
                            {day.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <div>
                {/* Rating summary */}
                <div className='bg-white rounded-2xl border border-stone-100 p-8 mb-8 flex flex-col md:flex-row items-center gap-8'>
                  <div className='text-center shrink-0'>
                    <p className='text-6xl font-black text-amber-500'>
                      {avgRating}
                    </p>
                    <StarRating rating={Math.round(avgRating)} size='text-lg' />
                    <p className='text-xs text-stone-400 mt-2'>
                      {MOCK_REVIEWS.length} reviews
                    </p>
                  </div>
                  <div className='flex-1 w-full space-y-2'>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = MOCK_REVIEWS.filter(
                        (r) => r.rating === star
                      ).length;
                      const pct = Math.round(
                        (count / MOCK_REVIEWS.length) * 100
                      );
                      return (
                        <div key={star} className='flex items-center gap-3'>
                          <span className='text-xs text-stone-400 w-3'>
                            {star}
                          </span>
                          <i className='fa fa-star text-amber-400 text-xs' />
                          <div className='flex-1 h-2 bg-stone-100 rounded-full overflow-hidden'>
                            <div
                              className='h-full bg-amber-400 rounded-full'
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className='text-xs text-stone-400 w-6'>
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews list */}
                <SectionHeading
                  eyebrow='Traveler stories'
                  title='Guest Reviews'
                />
                <div className='space-y-4 mb-12'>
                  {MOCK_REVIEWS.map((r) => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                </div>

                {/* Add comment form */}
                <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
                  <div className='h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400' />
                  <div className='p-7'>
                    <h3
                      className='text-xl font-black text-stone-800 mb-1'
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Share Your Experience
                    </h3>
                    <p className='text-sm text-stone-400 mb-6'>
                      Help fellow travelers by leaving an honest review
                    </p>

                    {submitted ? (
                      <div className='text-center py-10'>
                        <div className='w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4'>
                          <i className='fa fa-check text-amber-500 text-xl' />
                        </div>
                        <p className='font-bold text-stone-700 mb-1'>
                          Review submitted!
                        </p>
                        <p className='text-sm text-stone-400'>
                          Thank you for sharing your experience.
                        </p>
                        <button
                          onClick={() => setSubmitted(false)}
                          className='mt-4 text-sm text-amber-600 hover:text-amber-700 font-semibold'
                        >
                          Write another review
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleCommentSubmit}
                        className='space-y-4'
                      >
                        <div className='grid md:grid-cols-2 gap-4'>
                          <div>
                            <label className='block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5'>
                              Name *
                            </label>
                            <input
                              name='name'
                              value={comment.name}
                              onChange={handleCommentChange}
                              required
                              placeholder='Your full name'
                              className='w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 transition-all placeholder-stone-300 text-stone-700'
                            />
                          </div>
                          <div>
                            <label className='block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5'>
                              Email *
                            </label>
                            <input
                              name='email'
                              value={comment.email}
                              onChange={handleCommentChange}
                              required
                              type='email'
                              placeholder='your@email.com'
                              className='w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 transition-all placeholder-stone-300 text-stone-700'
                            />
                          </div>
                        </div>

                        {/* Star picker */}
                        <div>
                          <label className='block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2'>
                            Your Rating *
                          </label>
                          <div className='flex items-center gap-1'>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                type='button'
                                onClick={() =>
                                  setComment((c) => ({ ...c, rating: s }))
                                }
                                className='text-2xl transition-transform hover:scale-110'
                              >
                                <i
                                  className={`fa fa-star ${
                                    s <= comment.rating
                                      ? "text-amber-400"
                                      : "text-stone-200"
                                  }`}
                                />
                              </button>
                            ))}
                            <span className='ml-2 text-sm font-semibold text-stone-500'>
                              {
                                [
                                  "",
                                  "Poor",
                                  "Fair",
                                  "Good",
                                  "Very Good",
                                  "Excellent",
                                ][comment.rating]
                              }
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className='block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5'>
                            Review *
                          </label>
                          <textarea
                            name='message'
                            value={comment.message}
                            onChange={handleCommentChange}
                            required
                            rows={4}
                            placeholder='Tell us about your experience...'
                            className='w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 transition-all placeholder-stone-300 text-stone-700 resize-none'
                          />
                        </div>

                        <button
                          type='submit'
                          disabled={submitting}
                          className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 transition-colors px-7 py-3 rounded-xl shadow-lg shadow-amber-200'
                        >
                          {submitting ? (
                            <>
                              <i className='fa fa-spinner fa-spin text-xs' />{" "}
                              Submitting...
                            </>
                          ) : (
                            <>
                              <i className='fa fa-paper-plane text-xs' /> Submit
                              Review
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MAP TAB */}
            {activeTab === "map" && (
              <div>
                <SectionHeading
                  eyebrow="Where you're going"
                  title='Tour Location'
                />
                <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
                  <iframe
                    title='Tour location'
                    width='100%'
                    height='420'
                    style={{ border: 0 }}
                    loading='lazy'
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      tour.destination + ", Morocco"
                    )}&output=embed`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT — STICKY BOOKING ───────────────── */}
          <div className='w-full lg:w-80 shrink-0'>
            <div className='sticky top-[65px] space-y-4'>
              {/* Price card */}
              <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-xl shadow-stone-200/50'>
                <div className='h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400' />
                <div className='p-6'>
                  <p className='text-xs text-stone-400 uppercase tracking-widest mb-1'>
                    Price per person
                  </p>
                  <p className='text-4xl font-black text-amber-600'>
                    ${Number(tour.price).toLocaleString()}
                  </p>
                  {tour.duration_days && (
                    <p className='text-xs text-stone-400 mb-5'>
                      ~${Math.round(tour.price / tour.duration_days)}/day
                    </p>
                  )}

                  <div className='space-y-3 mb-5 pb-5 border-b border-stone-100'>
                    {tour.duration_days && (
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-stone-400 flex items-center gap-2'>
                          <i className='fa fa-clock text-amber-400 w-4 text-center' />{" "}
                          Duration
                        </span>
                        <span className='font-semibold text-stone-700'>
                          {tour.duration_days} days
                        </span>
                      </div>
                    )}
                    {tour.max_group_size && (
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-stone-400 flex items-center gap-2'>
                          <i className='fa fa-users text-amber-400 w-4 text-center' />{" "}
                          Group size
                        </span>
                        <span className='font-semibold text-stone-700'>
                          Max {tour.max_group_size}
                        </span>
                      </div>
                    )}
                    {tour.destination && (
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-stone-400 flex items-center gap-2'>
                          <i className='fa fa-map-marker-alt text-amber-400 w-4 text-center' />{" "}
                          Destination
                        </span>
                        <span className='font-semibold text-stone-700 text-right max-w-[130px] truncate'>
                          {tour.destination}
                        </span>
                      </div>
                    )}
                  </div>

                  <button className='w-full py-3.5 rounded-xl text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-200 flex items-center justify-center gap-2 mb-3'>
                    Book This Tour <i className='fa fa-arrow-right text-xs' />
                  </button>
                  <button className='w-full py-3 rounded-xl text-sm font-semibold text-stone-500 hover:text-stone-700 border border-stone-200 hover:border-stone-300 transition-colors flex items-center justify-center gap-2'>
                    <i className='fa fa-envelope text-xs' /> Enquire Now
                  </button>
                </div>
              </div>

              {/* Trust badges */}
              <div className='bg-white rounded-2xl border border-stone-100 p-5 space-y-3'>
                {[
                  {
                    icon: "fa-shield-alt",
                    text: "Free cancellation up to 48h",
                  },
                  { icon: "fa-headset", text: "24/7 customer support" },
                  { icon: "fa-certificate", text: "Licensed & insured guides" },
                ].map((b) => (
                  <div
                    key={b.text}
                    className='flex items-center gap-3 text-xs text-stone-500'
                  >
                    <i
                      className={`fa ${b.icon} text-amber-400 w-4 text-center`}
                    />
                    {b.text}
                  </div>
                ))}
              </div>

              {/* Share */}
              <div className='bg-white rounded-2xl border border-stone-100 p-5'>
                <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-3'>
                  Share this tour
                </p>
                <div className='flex gap-2'>
                  {[
                    {
                      icon: "fa-facebook-f",
                      color:
                        "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200",
                    },
                    {
                      icon: "fa-twitter",
                      color:
                        "hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200",
                    },
                    {
                      icon: "fa-whatsapp",
                      color:
                        "hover:bg-green-50 hover:text-green-600 hover:border-green-200",
                    },
                    {
                      icon: "fa-link",
                      color:
                        "hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200",
                    },
                  ].map((s) => (
                    <button
                      key={s.icon}
                      className={`flex-1 py-2 rounded-xl border border-stone-200 text-stone-400 text-sm transition-all ${s.color}`}
                    >
                      <i className={`fab ${s.icon}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RELATED TOURS ────────────────────────────── */}
        {relatedTours.length > 0 && (
          <div className='mt-20'>
            <div className='flex items-end justify-between mb-8'>
              <SectionHeading
                eyebrow='You might also like'
                title='Related Tours'
              />
              <Link
                to={`/tours?category=${tour.category}`}
                className='flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors mb-1'
              >
                View all <i className='fa fa-arrow-right text-xs' />
              </Link>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {relatedTours.map((t) => (
                <RelatedCard key={t.id} tour={t} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── LIGHTBOX ────────────────────────────────────── */}
      {lightbox && (
        <div
          className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm'
          onClick={() => setLightbox(null)}
        >
          <button className='absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors'>
            <i className='fa fa-times' />
          </button>
          <img
            src={renderImage(lightbox)}
            alt='Gallery'
            className='max-w-full max-h-[90vh] rounded-2xl object-contain'
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default TourDetail;
