import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Joi from "joi-browser";

// Hooks
import useForm from "../../hooks/useForm";

// Components
import BookingForm from "../bookings/BookingForm";

// Services
import tourService from "../../services/tourService";
import bookingService from "../../services/bookingService";
import reviewService from "../../services/reviewService";
import userService from "../../services/userService";

// Utils
import renderImage from "../../utils/renderImage";
import { toast } from "react-toastify";
import {
  renderButton,
  renderInput,
  renderTextarea,
} from "../../utils/formRenders";
import { formatDate } from "date-fns";

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

const ReviewCard = ({ review }) => (
  <div className='bg-white rounded-2xl border border-stone-100 p-6'>
    <div className='flex items-start gap-4 mb-4'>
      <InitialAvatar name={review.user_name} />
      <div className='flex-1 min-w-0'>
        <p className='font-bold text-stone-800 text-sm'>{review.user_name}</p>
        <p className='text-xs text-stone-400'>{review.created_at}</p>
      </div>
      <StarRating rating={review.rating} />
    </div>
    <p className='text-sm text-stone-500 leading-relaxed'>{review.comment}</p>
  </div>
);

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
        {tour.type === "tour"
          ? `${tour.duration_days}d`
          : `${tour.duration_hours}h`}
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

// ─── Per-type config ───────────────────────────────────────────

const getTypeConfig = (tour) => {
  switch (tour.type) {
    case "excursion":
      return {
        label: "Excursion",
        icon: "fa-compass",
        color: "text-sky-500",
        quickStats: [
          {
            icon: "fa-clock",
            label: "Duration",
            value: tour.duration_hours ? `${tour.duration_hours} hours` : "—",
          },
          {
            icon: "fa-bus",
            label: "Departure",
            value: tour.departure_time || "—",
          },
          {
            icon: "fa-flag-checkered",
            label: "Return",
            value: tour.return_time || "—",
          },
          {
            icon: "fa-map-marker-alt",
            label: "Meeting Point",
            value: tour.meeting_point || "—",
          },
          {
            icon: "fa-users",
            label: "Group Size",
            value: tour.max_group_size ? `Max ${tour.max_group_size}` : "—",
          },
          {
            icon: "fa-user-tie",
            label: "Guide",
            value: tour.guide_included ? "Included" : "Not included",
          },
        ],
        sidebarStats: [
          tour.duration_hours && {
            icon: "fa-clock",
            label: "Duration",
            value: `${tour.duration_hours} hours`,
          },
          tour.departure_time && {
            icon: "fa-bus",
            label: "Departure",
            value: tour.departure_time,
          },
          tour.return_time && {
            icon: "fa-flag-checkered",
            label: "Return",
            value: tour.return_time,
          },
          tour.meeting_point && {
            icon: "fa-map-marker-alt",
            label: "Meeting Point",
            value: tour.meeting_point,
          },
          tour.guide_included !== undefined && {
            icon: "fa-user-tie",
            label: "Guide",
            value: tour.guide_included ? "Included" : "Not included",
          },
          tour.max_group_size && {
            icon: "fa-users",
            label: "Group Size",
            value: `Max ${tour.max_group_size}`,
          },
        ].filter(Boolean),
      };

    case "activity":
      return {
        label: "Activity",
        icon: "fa-hiking",
        color: "text-emerald-500",
        quickStats: [
          {
            icon: "fa-clock",
            label: "Duration",
            value: tour.duration_hours ? `${tour.duration_hours} hours` : "—",
          },
          {
            icon: "fa-mountain",
            label: "Difficulty",
            value: tour.difficulty_level
              ? tour.difficulty_level.charAt(0).toUpperCase() +
                tour.difficulty_level.slice(1)
              : "—",
          },
          {
            icon: "fa-tools",
            label: "Equipment",
            value: tour.equipment_included ? "Included" : "Not included",
          },
          {
            icon: "fa-users",
            label: "Group Size",
            value: tour.max_group_size ? `Max ${tour.max_group_size}` : "—",
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
        ],
        sidebarStats: [
          tour.duration_hours && {
            icon: "fa-clock",
            label: "Duration",
            value: `${tour.duration_hours} hours`,
          },
          tour.difficulty_level && {
            icon: "fa-mountain",
            label: "Difficulty",
            value:
              tour.difficulty_level.charAt(0).toUpperCase() +
              tour.difficulty_level.slice(1),
          },
          tour.equipment_included !== undefined && {
            icon: "fa-tools",
            label: "Equipment",
            value: tour.equipment_included ? "Included" : "Not included",
          },
          tour.max_group_size && {
            icon: "fa-users",
            label: "Group Size",
            value: `Max ${tour.max_group_size}`,
          },
          tour.destination && {
            icon: "fa-map-marker-alt",
            label: "Destination",
            value: tour.destination,
          },
        ].filter(Boolean),
      };

    case "tour":
    default:
      return {
        label: "Tour",
        icon: "fa-route",
        color: "text-amber-500",
        quickStats: [
          {
            icon: "fa-clock",
            label: "Duration",
            value: tour.duration_days ? `${tour.duration_days} days` : "—",
          },
          {
            icon: "fa-users",
            label: "Group Size",
            value: tour.max_group_size ? `Max ${tour.max_group_size}` : "—",
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
        ],
        sidebarStats: [
          tour.duration_days && {
            icon: "fa-clock",
            label: "Duration",
            value: `${tour.duration_days} days`,
          },
          tour.max_group_size && {
            icon: "fa-users",
            label: "Group Size",
            value: `Max ${tour.max_group_size}`,
          },
          tour.destination && {
            icon: "fa-map-marker-alt",
            label: "Destination",
            value: tour.destination,
          },
        ].filter(Boolean),
      };
  }
};

// ─── Difficulty badge ──────────────────────────────────────────

const DifficultyBadge = ({ level }) => {
  const config = {
    easy: {
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
      icon: "fa-leaf",
    },
    moderate: {
      color: "bg-amber-50 text-amber-600 border-amber-200",
      icon: "fa-hiking",
    },
    hard: {
      color: "bg-orange-50 text-orange-600 border-orange-200",
      icon: "fa-mountain",
    },
    expert: {
      color: "bg-red-50 text-red-600 border-red-200",
      icon: "fa-skull-crossbones",
    },
  };
  const c = config[level] || config.easy;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${c.color}`}
    >
      <i className={`fa ${c.icon} text-[10px]`} />
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
};

// ─── TourDetail ───────────────────────────────────────────────

const TourDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [relatedTours, setRelatedTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [lightbox, setLightbox] = useState(null);
  const [formData, setFormData] = useState();
  const [reviews, setReviews] = useState([]);
  const [reviewData, setReviewData] = useState({
    /*     name: "",
    email: "",
 */ rating: 5,
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [itinerary, setItinerary] = useState([]);
  const [exclusions, setExclusions] = useState([]);
  const [inclusions, setInclusions] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      const fetchedUser = await userService.getMe();
      setFormData({
        full_name: fetchedUser?.name || "",
        email: fetchedUser?.email || "",
        phone: fetchedUser?.phone || "",
        nationality: fetchedUser?.nationality || "",
      });
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await tourService.getById(id);
        setTour(data);
        setItinerary(data?.itineraries || []);
        setInclusions(
          data.inclusions?.map((inc) => ({ id: inc.id, name: inc.text })) || []
        );
        setExclusions(
          data.exclusions?.map((exc) => ({ id: exc.id, name: exc.text })) || []
        );
        if (data?.category) {
          const related = await tourService.getAll({
            category: data.category,
            limit: 3,
          });
          const list = related?.data?.tours || related?.data || [];
          setRelatedTours(list.filter((t) => t.id !== data.id).slice(0, 3));
        }

        const fetchedReviews = await reviewService.getAll({ tour_id: id, approve: true });
        setReviews(fetchedReviews?.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  /*   const handleCommentChange = (e) =>
    setComment((c) => ({ ...c, [e.target.name]: e.target.value }));

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    setSubmitted(true);
    setComment({ name: "", email: "", rating: 5, comment: "" });
  };
 */
  const galleryImages = tour
    ? [tour.cover_image, ...(tour.images || [])].filter(Boolean).slice(0, 6)
    : [];

  const avgRating = (
    reviews?.reduce((s, r) => s + r.rating, 0) / reviews?.length
  ).toFixed(1);

  // Only show itinerary tab for tours
  const TABS =
    tour?.type === "tour"
      ? ["overview", "itinerary", "reviews", "map"]
      : ["overview", "reviews", "map"];

  const bookingSchema = {
    tour_id: Joi.any(),
    num_people: Joi.number().min(1).required(),
    full_name: Joi.string().max(150).required().label("Full Name"),
    email: Joi.string().email().required().label("Email"),
    phone: Joi.string().max(30).optional().allow("", null).label("Phone"),
    booking_date: Joi.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .allow("", null)
      .label("Booking Date"),
    booking_time: Joi.string()
      .regex(/^\d{2}:\d{2}$/)
      .optional()
      .allow("", null)
      .label("Booking Time"),
    nationality: Joi.string()
      .max(100)
      .optional()
      .allow("", null)
      .label("Nationality"),
    pickup_location: Joi.string()
      .max(255)
      .optional()
      .allow("", null)
      .label("Pickup Location"),
    special_requests: Joi.string()
      .max(1000)
      .optional()
      .allow("", null)
      .label("Special Requests"),
  };

  const doSubmit = async () => {
    try {
      setIsSubmitting(true);
      const createData = {
        tour_id: parseInt(id),
        ...data,
      };

      await bookingService.create(createData);
      navigate("/booking/successfull");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.response?.data?.err);
      console.log("Error: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const {
    data,
    setData,
    errors,
    setErrors,
    handleChange,
    handleSubmit,
    validate,
  } = useForm(formData, bookingSchema, doSubmit);

  console.log("validate: ", validate);

  useEffect(() => {
    const errs = { ...errors };
    if (data?.num_people > tour?.max_group_size) {
      errs.num_people = `Num of people should be less than or equal to ${tour?.max_group_size}`;
      setErrors(errs);
    } else {
      setErrors({});
    }
  }, [data?.num_people]);

  // Comments
  const reviewSchema = {
    rating: Joi.number().min(1).max(5).required().label("Rating"),
    comment: Joi.string().min(1).max(255).required().label("Comment"),
  };

  const doSubmitReview = async () => {
    try {
      setIsSubmitting(true);
      await reviewService.create({ ...cData, tour_id: id, rating: 5 });
      toast.success("Review submitted successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.log("Error: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const {
    data: cData,
    errors: cErrors,
    handleChange: cHandleChange,
    handleSubmit: cHandleSubmit,
    validate: cValidate,
  } = useForm(reviewData, reviewSchema, doSubmitReview);

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

  const typeConfig = getTypeConfig(tour);

  // ── Per-day price ─────────────────────────────────────────
  const priceBreakdown =
    tour.type === "tour" && tour.duration_days
      ? `~$${Math.round(tour.price / tour.duration_days)}/day`
      : tour.type === "excursion" && tour.duration_hours
      ? `~$${Math.round(tour.price / tour.duration_hours)}/hr`
      : null;

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

        <div className='absolute top-6 left-6'>
          <Link
            to='/tours'
            className='flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 transition-all'
          >
            <i className='fa fa-arrow-left text-xs' /> All Tours
          </Link>
        </div>

        <div className='absolute top-6 right-6 flex gap-2'>
          {/* Type badge */}
          <span className='flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/20'>
            <i className={`fa ${typeConfig.icon} text-[10px]`} />
            {typeConfig.label}
          </span>
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
              {tour.destination && (
                <span className='flex items-center gap-1.5'>
                  <i className='fa fa-map-marker-alt text-amber-400' />{" "}
                  {tour.destination}
                </span>
              )}
              {/* Duration — type-aware */}
              {tour.type === "tour" && tour.duration_days && (
                <span className='flex items-center gap-1.5'>
                  <i className='fa fa-clock text-amber-400' />{" "}
                  {tour.duration_days} days
                </span>
              )}
              {(tour.type === "excursion" || tour.type === "activity") &&
                tour.duration_hours && (
                  <span className='flex items-center gap-1.5'>
                    <i className='fa fa-clock text-amber-400' />{" "}
                    {tour.duration_hours} hours
                  </span>
                )}
              {/* Difficulty badge for activities */}
              {tour.type === "activity" && tour.difficulty_level && (
                <DifficultyBadge level={tour.difficulty_level} />
              )}
              {/* Departure time for excursions */}
              {tour.type === "excursion" && tour.departure_time && (
                <span className='flex items-center gap-1.5'>
                  <i className='fa fa-bus text-amber-400' /> Departs{" "}
                  {tour.departure_time}
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
                <span>({reviews?.length} reviews)</span>
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
                {/* Quick stats — dynamic per type */}
                <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                  {typeConfig.quickStats.map((s) => (
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
                    eyebrow={`About this ${tour.type}`}
                    title={
                      tour.type === "tour"
                        ? "Tour Overview"
                        : tour.type === "excursion"
                        ? "Excursion Overview"
                        : "Activity Overview"
                    }
                  />
                  <p className='text-stone-500 leading-relaxed whitespace-pre-line text-[15px]'>
                    {tour.description || "No description available."}
                  </p>
                </div>

                {/* Excursion-specific: logistics strip */}
                {tour.type === "excursion" && (
                  <div className='bg-sky-50 border border-sky-100 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-3 gap-5'>
                    {tour.departure_time && (
                      <div>
                        <p className='text-xs font-bold uppercase tracking-widest text-sky-500 mb-1'>
                          Departure
                        </p>
                        <p className='text-sm font-bold text-stone-700'>
                          {tour.departure_time}
                        </p>
                      </div>
                    )}
                    {tour.return_time && (
                      <div>
                        <p className='text-xs font-bold uppercase tracking-widest text-sky-500 mb-1'>
                          Return
                        </p>
                        <p className='text-sm font-bold text-stone-700'>
                          {tour.return_time}
                        </p>
                      </div>
                    )}
                    {tour.meeting_point && (
                      <div>
                        <p className='text-xs font-bold uppercase tracking-widest text-sky-500 mb-1'>
                          Meeting Point
                        </p>
                        <p className='text-sm font-bold text-stone-700'>
                          {tour.meeting_point}
                        </p>
                      </div>
                    )}
                    {tour.guide_included !== undefined && (
                      <div>
                        <p className='text-xs font-bold uppercase tracking-widest text-sky-500 mb-1'>
                          Guide
                        </p>
                        <p className='text-sm font-bold text-stone-700'>
                          {tour.guide_included
                            ? "✓ Included"
                            : "✗ Not included"}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Activity-specific: difficulty + equipment strip */}
                {tour.type === "activity" && (
                  <div className='bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-wrap gap-8'>
                    {tour.difficulty_level && (
                      <div>
                        <p className='text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2'>
                          Difficulty
                        </p>
                        <DifficultyBadge level={tour.difficulty_level} />
                      </div>
                    )}
                    {tour.equipment_included !== undefined && (
                      <div>
                        <p className='text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2'>
                          Equipment
                        </p>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
                            tour.equipment_included
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-stone-100 text-stone-500 border-stone-200"
                          }`}
                        >
                          <i
                            className={`fa ${
                              tour.equipment_included ? "fa-check" : "fa-times"
                            } text-[10px]`}
                          />
                          {tour.equipment_included
                            ? "Included"
                            : "Not included"}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Inclusions / Exclusions */}
                {(inclusions.length > 0 || exclusions.length > 0) && (
                  <div>
                    <SectionHeading
                      eyebrow="What's covered"
                      title='Inclusions & Exclusions'
                    />
                    <div className='grid md:grid-cols-2 gap-6'>
                      {inclusions.length > 0 && (
                        <div className='bg-amber-50 border border-amber-100 rounded-2xl p-6 space-y-3'>
                          <p className='text-xs font-bold uppercase tracking-widest text-amber-600 mb-4'>
                            Included
                          </p>
                          {inclusions.map((item) => (
                            <div
                              key={item.id}
                              className='flex items-center gap-3 text-sm text-stone-600'
                            >
                              <span className='w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0'>
                                <i className='fa fa-check text-amber-600 text-[10px]' />
                              </span>
                              {item.name}
                            </div>
                          ))}
                        </div>
                      )}
                      {exclusions.length > 0 && (
                        <div className='bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-3'>
                          <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-4'>
                            Not Included
                          </p>
                          {exclusions.map((item) => (
                            <div
                              key={item.id}
                              className='flex items-center gap-3 text-sm text-stone-400'
                            >
                              <span className='w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center shrink-0'>
                                <i className='fa fa-times text-stone-400 text-[10px]' />
                              </span>
                              {item.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

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

            {/* ITINERARY TAB — tours only */}
            {activeTab === "itinerary" && tour.type === "tour" && (
              <div>
                <SectionHeading eyebrow='Day by day' title='Tour Itinerary' />
                <div className='relative'>
                  <div className='absolute left-5 top-0 bottom-0 w-px bg-amber-100' />
                  <div className='space-y-6'>
                    {itinerary.map((day) => (
                      <div key={day.day} className='flex gap-6 relative'>
                        <div className='w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-amber-900 font-black text-sm shrink-0 z-10 shadow-md shadow-amber-200'>
                          {day.day}
                        </div>
                        <div className='flex-1 bg-white rounded-2xl border border-stone-100 overflow-hidden'>
                          {day.image && (
                            <div className='relative h-44 overflow-hidden'>
                              <img
                                src={renderImage(day.image)}
                                alt={day.title}
                                className='w-full h-full object-cover'
                              />
                              <div className='absolute inset-0 bg-gradient-to-t from-white/60 to-transparent' />
                            </div>
                          )}
                          <div className='p-5'>
                            <p className='text-xs font-bold uppercase tracking-widest text-amber-500 mb-1'>
                              Day {day.day}
                            </p>
                            <h3 className='font-black text-stone-800 text-base mb-1'>
                              {day.title}
                            </h3>
                            {day.location && (
                              <p className='flex items-center gap-1.5 text-xs text-stone-400 font-medium mb-3'>
                                <svg
                                  className='w-3.5 h-3.5 text-amber-400 flex-shrink-0'
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
                            {(day.description || day.desc) && (
                              <p className='text-sm text-stone-500 leading-relaxed'>
                                {day.description || day.desc}
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

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <div>
                <div className='bg-white rounded-2xl border border-stone-100 p-8 mb-8 flex flex-col md:flex-row items-center gap-8'>
                  <div className='text-center shrink-0'>
                    <p className='text-6xl font-black text-amber-500'>
                      {avgRating}
                    </p>
                    <StarRating rating={Math.round(avgRating)} size='text-lg' />
                    <p className='text-xs text-stone-400 mt-2'>
                      {reviews?.length} reviews
                    </p>
                  </div>
                  <div className='flex-1 w-full space-y-2'>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews?.filter(
                        (r) => r.rating === star
                      ).length;
                      const pct = Math.round((count / reviews?.length) * 100);
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

                <SectionHeading
                  eyebrow='Traveler stories'
                  title='Guest Reviews'
                />
                <div className='space-y-4 mb-12'>
                  {reviews?.map((r) => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                </div>

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
                      <form onSubmit={cHandleSubmit} className='space-y-4'>
                        {/*  <div className='grid md:grid-cols-2 gap-4'>
                          <div>
                            <label className='block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5'>
                              Name *
                            </label>
                            {renderInput(
                              "",
                              "name",
                              cData,
                              cErrors,
                              cHandleChange,
                              "text"
                            )}
                            <input
                              name='name'
                              value={cData?.name}
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
                            {renderInput(
                              "",
                              "email",
                              cData,
                              cErrors,
                              cHandleChange,
                              "email"
                            )}
                            <input
                              name='email'
                              value={cData?.email}
                              onChange={handleCommentChange}
                              required
                              type='email'
                              placeholder='your@email.com'
                              className='w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 transition-all placeholder-stone-300 text-stone-700'
                            />
                          </div>
                        </div> */}
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
                                  setReviewData((c) => ({ ...c, rating: s }))
                                }
                                className='text-2xl transition-transform hover:scale-110'
                              >
                                <i
                                  className={`fa fa-star ${
                                    s <= cData?.rating
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
                                ][cData?.rating]
                              }
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className='block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5'>
                            Review *
                          </label>
                          {renderTextarea(
                            "",
                            "comment",
                            cData,
                            cErrors,
                            cHandleChange,
                            "text"
                          )}
                        </div>
                        {renderButton(
                          "Submit Review",
                          "submit",
                          cValidate,
                          isSubmitting,
                          <i className='fa fa-paper-plane text-xs' />,
                          "submit"
                        )}
                        {/*                         <button
                          type='submit'
                          disabled={isSubmitting}
                          className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 transition-colors px-7 py-3 rounded-xl shadow-lg shadow-amber-200'
                        >
                          {isSubmitting ? (
                            <>
                              <i className='fa fa-spinner fa-spin text-xs' />{" "}
                              Submitting...
                            </>
                          ) : (
                            <>Submit Review</>
                          )}
                        </button>
 */}{" "}
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
                      (tour.destination || tour.meeting_point || "") +
                        ", Morocco"
                    )}&output=embed`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT — STICKY BOOKING ───────────────── */}
          <div className='w-full lg:w-80 shrink-0'>
            <div className='sticky top-[65px] space-y-4'>
              {
                <BookingForm
                  tour={tour}
                  data={data}
                  errors={errors}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  validate={validate}
                  priceBreakdown={priceBreakdown}
                  typeConfig={typeConfig}
                  isSubmitting={isSubmitting}
                />
              }
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
                  Share this {tour.type}
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
