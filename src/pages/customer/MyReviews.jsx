import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import reviewService from "../../services/reviewService";

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

const Sk = ({ className }) => (
  <div className={`animate-pulse bg-stone-100 rounded-xl ${className}`} />
);

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    reviewService
      .getMyReviews()
      .then((res) => setReviews(res?.data || res || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...reviews]
    .filter(
      (r) =>
        !search.trim() ||
        r.tour?.title?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "oldest")
        return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return 0;
    });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div
      className='min-h-screen bg-stone-50 p-6 md:p-8'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Page header */}
      <div className='mb-8'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-1'>
          Feedback
        </p>
        <h1
          className='text-3xl font-black text-stone-800'
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          My Reviews
        </h1>
        <p className='text-stone-400 text-sm mt-1'>
          {reviews.length} review{reviews.length !== 1 ? "s" : ""} written
        </p>
      </div>

      {/* Summary strip */}
      {!loading && reviews.length > 0 && (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
          {[
            {
              icon: "fa-pen",
              label: "Total Reviews",
              value: reviews.length,
              color: "from-amber-400 to-orange-500",
            },
            {
              icon: "fa-star",
              label: "Average Rating",
              value: avgRating,
              color: "from-yellow-400 to-amber-500",
            },
            {
              icon: "fa-smile",
              label: "5-Star Reviews",
              value: reviews.filter((r) => r.rating === 5).length,
              color: "from-emerald-400 to-teal-500",
            },
            {
              icon: "fa-globe",
              label: "Tours Reviewed",
              value: new Set(reviews.map((r) => r.tour?.id)).size,
              color: "from-blue-400 to-indigo-500",
            },
          ].map((s) => (
            <div
              key={s.label}
              className='bg-white rounded-2xl border border-stone-100 p-4 hover:shadow-md transition-all'
            >
              <div
                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-sm`}
              >
                <i className={`fa ${s.icon} text-white text-xs`} />
              </div>
              <p className='text-xl font-black text-stone-800'>{s.value}</p>
              <p className='text-xs text-stone-400 mt-0.5'>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className='flex flex-col sm:flex-row gap-3 mb-6'>
        <div className='relative flex-1 max-w-xs'>
          <i className='fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 text-xs' />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search reviews...'
            className='w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-stone-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 transition-all placeholder-stone-300 text-stone-700'
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className='text-sm bg-white border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 transition-all text-stone-600'
        >
          <option value='newest'>Newest first</option>
          <option value='oldest'>Oldest first</option>
          <option value='highest'>Highest rated</option>
          <option value='lowest'>Lowest rated</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className='space-y-4'>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className='bg-white rounded-2xl border border-stone-100 p-6 space-y-3'
            >
              <div className='flex gap-4'>
                <Sk className='w-16 h-16 rounded-xl shrink-0' />
                <div className='flex-1 space-y-2'>
                  <Sk className='h-4 w-1/2' />
                  <Sk className='h-3 w-1/4' />
                </div>
              </div>
              <Sk className='h-3 w-full' />
              <Sk className='h-3 w-3/4' />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className='bg-white rounded-2xl border border-stone-100 py-20 text-center'>
          <i className='fa fa-star text-5xl text-stone-200 mb-4 block' />
          <p className='font-bold text-stone-500 mb-1'>No reviews yet</p>
          <p className='text-sm text-stone-400 mb-6'>
            {search
              ? "No reviews match your search"
              : "Share your experience after completing a tour"}
          </p>
          <Link
            to='/bookings/my'
            className='inline-flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 px-5 py-2.5 rounded-xl transition-colors'
          >
            <i className='fa fa-suitcase text-xs' /> My Bookings
          </Link>
        </div>
      ) : (
        <div className='space-y-4'>
          {sorted.map((review) => (
            <div
              key={review.id}
              className='bg-white rounded-2xl border border-stone-100 p-6 hover:shadow-lg hover:shadow-stone-200/50 transition-all'
            >
              <div className='flex items-start gap-4'>
                {/* Tour thumbnail */}
                <div className='w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0'>
                  {review.tour?.cover_image ? (
                    <img
                      src={review.tour.cover_image}
                      alt={review.tour?.title}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-stone-300'>
                      <i className='fa fa-image text-xl' />
                    </div>
                  )}
                </div>

                {/* Header */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between gap-2 flex-wrap'>
                    <div>
                      <Link
                        to={`/tours/${review.tour?.id}`}
                        className='font-black text-stone-800 hover:text-amber-700 transition-colors text-sm'
                      >
                        {review.tour?.title || "Tour"}
                      </Link>
                      <p className='text-xs text-amber-600 flex items-center gap-1 mt-0.5'>
                        <i className='fa fa-map-marker-alt text-[10px]' />
                        {review.tour?.destination || "—"}
                      </p>
                    </div>
                    <div className='flex flex-col items-end gap-1 shrink-0'>
                      <StarRating rating={review.rating} />
                      <span className='text-xs font-bold text-amber-600'>
                        {RATING_LABELS[review.rating]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review body */}
              <div className='mt-4 pt-4 border-t border-stone-100'>
                <p className='text-sm text-stone-500 leading-relaxed'>
                  {review.comment || review.message}
                </p>
                <div className='flex items-center justify-between mt-3'>
                  <p className='text-xs text-stone-400 flex items-center gap-1.5'>
                    <i className='fa fa-calendar text-[10px] text-amber-400' />
                    {review.created_at
                      ? new Date(review.created_at).toLocaleDateString(
                          "en-US",
                          { month: "long", day: "numeric", year: "numeric" }
                        )
                      : "—"}
                  </p>
                  <div className='flex items-center gap-2'>
                    <button className='text-xs font-semibold text-stone-400 hover:text-amber-600 flex items-center gap-1 transition-colors'>
                      <i className='fa fa-pen text-[10px]' /> Edit
                    </button>
                    <span className='text-stone-200'>·</span>
                    <button className='text-xs font-semibold text-stone-400 hover:text-red-500 flex items-center gap-1 transition-colors'>
                      <i className='fa fa-trash text-[10px]' /> Delete
                    </button>
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

export default MyReviews;
