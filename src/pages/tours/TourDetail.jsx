import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Joi from "joi-browser";

// Hooks
import useForm from "../../hooks/useForm";

// Components
import BookingForm from "../bookings/BookingForm";
import LocationViewer from "../../components/LocationViewer";
import TourLocationViewer from "../../components/TourLocationViewer";

// Services
import tourService from "../../services/tourService";
import inclusionsService from "../../services/inclusionsService";
import exclusionsService from "../../services/exclusionsService";
import bookingService from "../../services/bookingService";
import reviewService from "../../services/reviewService";
import userService from "../../services/userService";

// Utils
import renderImage from "../../utils/renderImage";
import {
  renderButton,
  renderInput,
  renderTextarea,
} from "../../utils/formRenders";
import { inclusionKeyMap } from "../../utils/inclusionsKeyMap";
import { exclusionKeyMap } from "../../utils/exclusionKeyMap";

// Common
import { LightboxGallery } from "../../common/LightBoxGallery";

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
  <div className='mb-6 sm:mb-8'>
    {eyebrow && (
      <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-2'>
        {eyebrow}
      </p>
    )}
    <h2
      className='text-xl sm:text-2xl md:text-3xl font-black text-stone-800'
      style={{ fontFamily: "'Playfair Display', serif" }}
    >
      {title}
    </h2>
  </div>
);

const ReviewCard = ({ review }) => (
  <div className='bg-white rounded-2xl border border-stone-100 p-4 sm:p-6'>
    <div className='flex items-start gap-3 sm:gap-4 mb-4'>
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

const RelatedCard = ({ tour, t }) => (
  <Link
    to={`/tours/${tour?.id}`}
    className='group bg-white rounded-2xl overflow-hidden border border-stone-100
      hover:shadow-xl hover:shadow-amber-900/10 hover:-translate-y-1 transition-all duration-300'
  >
    <div className='relative h-44 overflow-hidden bg-stone-100'>
      {tour?.cover_image ? (
        <img
          src={renderImage(tour?.cover_image)}
          alt={tour?.title}
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
        {tour?.type === "tour"
          ? t("tourDetail.unit.days_other", { count: tour?.duration_days })
          : t("tourDetail.unit.hours_other", { count: tour?.duration_hours })}
      </div>
    </div>
    <div className='p-4'>
      <p className='text-xs text-amber-600 font-semibold flex items-center gap-1 mb-1 uppercase tracking-wide'>
        <i className='fa fa-map-marker-alt text-[10px]' />
        {tour?.destination}
      </p>
      <h3 className='font-bold text-sm text-stone-800 group-hover:text-amber-700 transition-colors line-clamp-1 mb-3'>
        {tour?.title}
      </h3>
      <div className='flex items-center justify-between pt-3 border-t border-stone-100'>
        <p className='text-lg font-black text-amber-600'>${tour?.price}</p>
        <span className='text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl'>
          {t("tourDetail.relatedCard.view")}{" "}
          <i className='fa fa-arrow-right ml-1 text-[10px]' />
        </span>
      </div>
    </div>
  </Link>
);

const DifficultyBadge = ({ level, t }) => {
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
      {t(`tourDetail.difficulty.${level}`)}
    </span>
  );
};

// ─── TourDetail ───────────────────────────────────────────────

const TourDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [relatedTours, setRelatedTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [formData, setFormData] = useState();
  const [reviews, setReviews] = useState([]);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [itinerary, setItinerary] = useState([]);
  const [inclusions, setInclusions] = useState([]);
  const [exclusions, setExclusions] = useState([]);

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
        const [t, i, e] = await Promise.all([
          tourService.getById(id),
          inclusionsService.getAll(),
          exclusionsService.getAll(),
        ]);

        setTour(t);
        setItinerary(t?.itineraries || []);
        setInclusions(
          t?.inclusions?.flatMap((ti) =>
            i?.data?.filter((i) => i.id === parseInt(ti))
          )
        );
        setExclusions(
          t?.exclusions?.flatMap((te) =>
            e?.data?.filter((e) => e.id === parseInt(te))
          )
        );

        if (t?.category_id) {
          const related = await tourService.getAll({
            category_id: t.category_id,
            limit: 3,
          });
          const list = related?.data?.tours || related?.data || [];
          setRelatedTours(
            list.filter((tourItem) => tourItem.id !== t.id).slice(0, 3)
          );
        }

        const fetchedReviews = await reviewService.getAll({
          tour_id: id,
          approve: true,
        });
        setReviews(fetchedReviews?.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const translatedInclusions = inclusions?.map((inc) => ({
    ...inc,
    label: t(`manageInclusions.inclusions.${inclusionKeyMap[inc?.text]}`),
  }));

  const translatedExclusions = exclusions?.map((exc) => ({
    ...exc,
    label:
      t(`manageExclusions.exclusions.${exclusionKeyMap[exc?.text]}`) ??
      exc.text,
  }));

  const galleryImages = tour
    ? [tour?.cover_image, ...(tour?.images || [])].filter(Boolean).slice(0, 6)
    : [];

  const avgRating = (
    reviews?.reduce((s, r) => s + r.rating, 0) / reviews?.length
  ).toFixed(1);

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
      await bookingService.create({ tour_id: parseInt(id), ...data });
      navigate("/booking/successfull");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.response?.data?.err);
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

  useEffect(() => {
    const errs = { ...errors };
    if (data?.num_people > tour?.max_group_size) {
      errs.num_people = t("tourDetail.errors.maxGroup", {
        max: tour?.max_group_size,
      });
      setErrors(errs);
    } else {
      setErrors({});
    }
  }, [data?.num_people, tour?.max_group_size, t]);

  const reviewSchema = {
    rating: Joi.number().min(1).max(5).required().label("Rating"),
    comment: Joi.string().min(1).max(255).required().label("Comment"),
  };

  const doSubmitReview = async () => {
    try {
      setIsSubmitting(true);
      await reviewService.create({
        ...cData,
        tour_id: id,
        rating: cData.rating,
      });
      toast.success(t("tourDetail.review.success"));
      setSubmitted(true);
      setReviewData({ rating: 5, comment: "" });
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const {
    data: cData,
    errors: cErrors,
    handleChange: cHandleChange,
    handleSubmit: cHandleSubmit,
  } = useForm(reviewData, reviewSchema, doSubmitReview);

  const getTypeConfig = (tour) => {
    switch (tour?.type) {
      case "excursion":
        return {
          label: t("tourDetail.types.excursion"),
          icon: "fa-compass",
          color: "text-sky-500",
          quickStats: [
            {
              icon: "fa-clock",
              label: t("tourDetail.stats.duration"),
              value: tour?.duration_hours
                ? t("tourDetail.unit.hours_other", {
                    count: tour?.duration_hours,
                  })
                : "—",
            },
            {
              icon: "fa-bus",
              label: t("tourDetail.stats.departure"),
              value: tour?.departure_time || "—",
            },
            {
              icon: "fa-flag-checkered",
              label: t("tourDetail.stats.return"),
              value: tour?.return_time || "—",
            },
            {
              icon: "fa-map-marker-alt",
              label: t("tourDetail.stats.meetingPoint"),
              value: tour?.meeting_point || "—",
            },
            {
              icon: "fa-users",
              label: t("tourDetail.stats.groupSize"),
              value: tour?.max_group_size
                ? t("tourDetail.stats.maxPeople", {
                    count: tour?.max_group_size,
                  })
                : "—",
            },
            {
              icon: "fa-user-tie",
              label: t("tourDetail.stats.guide"),
              value: tour?.guide_included
                ? t("tourDetail.included")
                : t("tourDetail.notIncluded"),
            },
          ],
          sidebarStats: [
            tour?.duration_hours && {
              icon: "fa-clock",
              label: t("tourDetail.stats.duration"),
              value: t("tourDetail.unit.hours_other", {
                count: tour?.duration_hours,
              }),
            },
            tour?.departure_time && {
              icon: "fa-bus",
              label: t("tourDetail.stats.departure"),
              value: tour?.departure_time,
            },
            tour?.return_time && {
              icon: "fa-flag-checkered",
              label: t("tourDetail.stats.return"),
              value: tour?.return_time,
            },
            tour?.meeting_point && {
              icon: "fa-map-marker-alt",
              label: t("tourDetail.stats.meetingPoint"),
              value: tour?.meeting_point,
            },
            tour?.guide_included !== undefined && {
              icon: "fa-user-tie",
              label: t("tourDetail.stats.guide"),
              value: tour?.guide_included
                ? t("tourDetail.included")
                : t("tourDetail.notIncluded"),
            },
            tour?.max_group_size && {
              icon: "fa-users",
              label: t("tourDetail.stats.groupSize"),
              value: t("tourDetail.stats.maxPeople", {
                count: tour?.max_group_size,
              }),
            },
          ].filter(Boolean),
        };

      case "activity":
        return {
          label: t("tourDetail.types.activity"),
          icon: "fa-hiking",
          color: "text-emerald-500",
          quickStats: [
            {
              icon: "fa-clock",
              label: t("tourDetail.stats.duration"),
              value: tour?.duration_hours
                ? t("tourDetail.unit.hours_other", {
                    count: tour?.duration_hours,
                  })
                : "—",
            },
            {
              icon: "fa-mountain",
              label: t("tourDetail.stats.difficulty"),
              value: tour?.difficulty_level
                ? t(`tourDetail.difficulty.${tour?.difficulty_level}`)
                : "—",
            },
            {
              icon: "fa-tools",
              label: t("tourDetail.stats.equipment"),
              value: tour?.equipment_included
                ? t("tourDetail.included")
                : t("tourDetail.notIncluded"),
            },
            {
              icon: "fa-users",
              label: t("tourDetail.stats.groupSize"),
              value: tour?.max_group_size
                ? t("tourDetail.stats.maxPeople", {
                    count: tour?.max_group_size,
                  })
                : "—",
            },
            {
              icon: "fa-tag",
              label: t("tourDetail.stats.category"),
              value: tour?.category_name || "—",
            },
            {
              icon: "fa-map-marker-alt",
              label: t("tourDetail.stats.destination"),
              value: tour?.destination || "—",
            },
          ],
          sidebarStats: [
            tour?.duration_hours && {
              icon: "fa-clock",
              label: t("tourDetail.stats.duration"),
              value: t("tourDetail.unit.hours_other", {
                count: tour?.duration_hours,
              }),
            },
            tour?.difficulty_level && {
              icon: "fa-mountain",
              label: t("tourDetail.stats.difficulty"),
              value: t(`tourDetail.difficulty.${tour?.difficulty_level}`),
            },
            tour?.equipment_included !== undefined && {
              icon: "fa-tools",
              label: t("tourDetail.stats.equipment"),
              value: tour?.equipment_included
                ? t("tourDetail.included")
                : t("tourDetail.notIncluded"),
            },
            tour?.max_group_size && {
              icon: "fa-users",
              label: t("tourDetail.stats.groupSize"),
              value: t("tourDetail.stats.maxPeople", {
                count: tour?.max_group_size,
              }),
            },
            tour?.destination && {
              icon: "fa-map-marker-alt",
              label: t("tourDetail.stats.destination"),
              value: tour?.destination,
            },
          ].filter(Boolean),
        };

      case "tour":
      default:
        return {
          label: t("tourDetail.types.tour"),
          icon: "fa-route",
          color: "text-amber-500",
          quickStats: [
            {
              icon: "fa-clock",
              label: t("tourDetail.stats.duration"),
              value: tour?.duration_days
                ? t("tourDetail.unit.days", { count: tour?.duration_days })
                : "—",
            },
            {
              icon: "fa-users",
              label: t("tourDetail.stats.groupSize"),
              value: tour?.max_group_size
                ? t("tourDetail.stats.maxPeople", {
                    count: tour?.max_group_size,
                  })
                : "—",
            },
            {
              icon: "fa-tag",
              label: t("tourDetail.stats.category"),
              value: tour?.category_name || "—",
            },
            {
              icon: "fa-map-marker-alt",
              label: t("tourDetail.stats.destination"),
              value: tour?.destination || "—",
            },
          ],
          sidebarStats: [
            tour?.duration_days && {
              icon: "fa-clock",
              label: t("tourDetail.stats.duration"),
              value: t("tourDetail.unit.days", { count: tour?.duration_days }),
            },
            tour?.max_group_size && {
              icon: "fa-users",
              label: t("tourDetail.stats.groupSize"),
              value: t("tourDetail.stats.maxPeople", {
                count: tour?.max_group_size,
              }),
            },
            tour?.destination && {
              icon: "fa-map-marker-alt",
              label: t("tourDetail.stats.destination"),
              value: tour?.destination,
            },
          ].filter(Boolean),
        };
    }
  };

  const typeConfig = tour ? getTypeConfig(tour) : null;
  const priceBreakdown =
    tour?.type === "tour" && tour?.duration_days
      ? t("tourDetail.pricePerDay", {
          price: Math.round(tour?.price / tour?.duration_days),
        })
      : tour?.type === "excursion" && tour?.duration_hours
      ? t("tourDetail.pricePerHour", {
          price: Math.round(tour?.price / tour?.duration_hours),
        })
      : null;

  // ── Loading ──────────────────────────────────────────────
  if (loading)
    return (
      <div
        className='min-h-screen bg-stone-50 animate-pulse'
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className='h-[50vh] sm:h-[60vh] bg-stone-200' />
        <div className='max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-4'>
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
          {t("tourDetail.notFound.title")}
        </h2>
        <p className='text-stone-400 text-sm mb-6'>
          {t("tourDetail.notFound.message")}
        </p>
        <Link
          to='/tours'
          className='flex items-center gap-2 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 px-5 py-2.5 rounded-xl hover:bg-amber-100 transition-colors'
        >
          <i className='fa fa-arrow-left text-xs' />{" "}
          {t("tourDetail.backToTours")}
        </Link>
      </div>
    );

  // ── Render ────────────────────────────────────────────────
  return (
    <div
      className='min-h-screen bg-stone-50'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── HERO ────────────────────────────────────────── */}
      <div className='relative h-[55vh] sm:h-[65vh] overflow-hidden bg-stone-900'>
        {tour?.cover_image && (
          <img
            src={renderImage(tour?.cover_image)}
            alt={tour?.title}
            className='w-full h-full object-cover opacity-75'
          />
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent' />

        {/* ✅ Back button */}
        <div className='absolute top-4 left-4'>
          <Link
            to='/tours'
            className='flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/90 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl border border-white/10 transition-all'
          >
            <i className='fa fa-arrow-left text-xs' />{" "}
            {t("tourDetail.allTours")}
          </Link>
        </div>

        {/* ✅ Badges — wrap on mobile */}
        <div className='absolute top-4 right-4 flex flex-wrap gap-1.5 max-w-[55%] sm:max-w-none justify-end'>
          <span className='flex items-center gap-1.5 text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/20'>
            <i className={`fa ${typeConfig.icon} text-[10px]`} />
            <span className='hidden sm:inline'>{typeConfig.label}</span>
          </span>
          {tour?.is_hot_deal && (
            <span className='flex items-center gap-1.5 text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-full bg-red-500 text-white shadow'>
              <i className='fa fa-fire text-[10px]' />
              <span className='hidden sm:inline'>
                {t("tourDetail.badge.hotDeal")}
              </span>
            </span>
          )}
          {tour?.is_featured && (
            <span className='flex items-center gap-1.5 text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-400 text-amber-900 shadow'>
              <i className='fa fa-star text-[10px]' />
              <span className='hidden sm:inline'>
                {t("tourDetail.badge.featured")}
              </span>
            </span>
          )}
        </div>

        {/* ✅ Hero content */}
        <div className='absolute bottom-0 left-0 right-0 px-4 pb-6 sm:px-6 sm:pb-10 md:px-12'>
          <div className='max-w-6xl mx-auto'>
            {tour?.category && (
              <span className='inline-block text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-2 sm:mb-3'>
                {tour?.category}
              </span>
            )}
            <h1
              className='text-2xl sm:text-4xl md:text-6xl font-black text-white leading-tight mb-2 sm:mb-3'
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {tour?.title}
            </h1>
            <div className='flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/70'>
              {tour?.destination && (
                <span className='flex items-center gap-1.5'>
                  <i className='fa fa-map-marker-alt text-amber-400' />{" "}
                  {tour?.destination}
                </span>
              )}
              {tour?.type === "tour" && tour?.duration_days && (
                <span className='flex items-center gap-1.5'>
                  <i className='fa fa-clock text-amber-400' />{" "}
                  {t("tourDetail.unit.days", { count: tour?.duration_days })}
                </span>
              )}
              {(tour?.type === "excursion" || tour?.type === "activity") &&
                tour?.duration_hours && (
                  <span className='flex items-center gap-1.5'>
                    <i className='fa fa-clock text-amber-400' />{" "}
                    {t("tourDetail.unit.hours_other", {
                      count: tour?.duration_hours,
                    })}
                  </span>
                )}
              {tour?.type === "activity" && tour?.difficulty_level && (
                <DifficultyBadge level={tour?.difficulty_level} t={t} />
              )}
              {tour?.type === "excursion" && tour?.departure_time && (
                <span className='flex items-center gap-1.5'>
                  <i className='fa fa-bus text-amber-400' />{" "}
                  {t("tourDetail.departsAt", { time: tour?.departure_time })}
                </span>
              )}
              {tour?.max_group_size && (
                <span className='flex items-center gap-1.5'>
                  <i className='fa fa-users text-amber-400' />{" "}
                  {t("tourDetail.stats.maxPeople", {
                    count: tour?.max_group_size,
                  })}
                </span>
              )}
              <span className='flex items-center gap-1.5'>
                <StarRating rating={Math.round(avgRating)} size='text-xs' />
                {avgRating > 0 && (
                  <>
                    <span className='text-amber-400 font-bold'>
                      {avgRating}
                    </span>
                    <span>
                      {t("tourDetail.review.count", { count: reviews?.length })}
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── STICKY TABS ─────────────────────────────────── */}
      <div className='sticky top-0 z-20 bg-white border-b border-stone-100 shadow-sm'>
        <div className='max-w-6xl mx-auto px-2 sm:px-6 md:px-12 flex items-center gap-1 overflow-x-auto scrollbar-hide'>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-5 py-4 text-xs sm:text-sm font-semibold capitalize whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-amber-400 text-amber-600"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              {t(`tourDetail.tabs.${tab}`)}
            </button>
          ))}
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────── */}
      <div className='max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12'>
        {/* ✅ flex-col-reverse so booking shows BELOW content on mobile */}
        <div className='flex flex-col-reverse lg:flex-row gap-8 lg:gap-12'>
          {/* ── LEFT CONTENT ────────────────────────── */}
          <div className='flex-1 min-w-0 space-y-12 sm:space-y-16'>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <>
                {/* Quick stats */}
                <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4'>
                  {typeConfig.quickStats.map((s) => (
                    <div
                      key={s.label}
                      className='bg-white rounded-2xl border border-stone-100 p-4 sm:p-5'
                    >
                      <div className='w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-2 sm:mb-3'>
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
                    eyebrow={t("tourDetail.overview.eyebrow", {
                      type: typeConfig.label,
                    })}
                    title={
                      tour?.type === "tour"
                        ? t("tourDetail.overview.tourTitle")
                        : tour?.type === "excursion"
                        ? t("tourDetail.overview.excursionTitle")
                        : t("tourDetail.overview.activityTitle")
                    }
                  />
                  <p className='text-stone-500 leading-relaxed whitespace-pre-line text-sm sm:text-[15px]'>
                    {tour?.description || t("tourDetail.noDescription")}
                  </p>
                </div>

                {/* Excursion logistics strip */}
                {tour?.type === "excursion" && (
                  <div className='bg-sky-50 border border-sky-100 rounded-2xl p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5'>
                    {tour?.departure_time && (
                      <div>
                        <p className='text-xs font-bold uppercase tracking-widest text-sky-500 mb-1'>
                          {t("tourDetail.stats.departure")}
                        </p>
                        <p className='text-sm font-bold text-stone-700'>
                          {tour?.departure_time}
                        </p>
                      </div>
                    )}
                    {tour?.return_time && (
                      <div>
                        <p className='text-xs font-bold uppercase tracking-widest text-sky-500 mb-1'>
                          {t("tourDetail.stats.return")}
                        </p>
                        <p className='text-sm font-bold text-stone-700'>
                          {tour?.return_time}
                        </p>
                      </div>
                    )}
                    {tour?.meeting_point && (
                      <div>
                        <p className='text-xs font-bold uppercase tracking-widest text-sky-500 mb-1'>
                          {t("tourDetail.stats.meetingPoint")}
                        </p>
                        <p className='text-sm font-bold text-stone-700'>
                          {tour?.meeting_point}
                        </p>
                      </div>
                    )}
                    {tour?.guide_included !== undefined && (
                      <div>
                        <p className='text-xs font-bold uppercase tracking-widest text-sky-500 mb-1'>
                          {t("tourDetail.stats.guide")}
                        </p>
                        <p className='text-sm font-bold text-stone-700'>
                          {tour?.guide_included
                            ? t("tourDetail.included")
                            : t("tourDetail.notIncluded")}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Activity strip */}
                {tour?.type === "activity" && (
                  <div className='bg-emerald-50 border border-emerald-100 rounded-2xl p-4 sm:p-6 flex flex-wrap gap-6 sm:gap-8'>
                    {tour?.difficulty_level && (
                      <div>
                        <p className='text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2'>
                          {t("tourDetail.stats.difficulty")}
                        </p>
                        <DifficultyBadge level={tour?.difficulty_level} t={t} />
                      </div>
                    )}
                    {tour?.equipment_included !== undefined && (
                      <div>
                        <p className='text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2'>
                          {t("tourDetail.stats.equipment")}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
                            tour?.equipment_included
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-stone-100 text-stone-500 border-stone-200"
                          }`}
                        >
                          <i
                            className={`fa ${
                              tour?.equipment_included ? "fa-check" : "fa-times"
                            } text-[10px]`}
                          />
                          {tour?.equipment_included
                            ? t("tourDetail.included")
                            : t("tourDetail.notIncluded")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Inclusions / Exclusions */}
                {(inclusions.length > 0 || exclusions.length > 0) && (
                  <div>
                    <SectionHeading
                      eyebrow={t("tourDetail.inclusions.eyebrow")}
                      title={t("tourDetail.inclusions.title")}
                    />
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
                      {inclusions.length > 0 && (
                        <div className='bg-amber-50 border border-amber-100 rounded-2xl p-4 sm:p-6 space-y-3'>
                          <p className='text-xs font-bold uppercase tracking-widest text-amber-600 mb-4'>
                            {t("tourDetail.included")}
                          </p>
                          {translatedInclusions.map((item) => (
                            <div
                              key={item.id}
                              className='flex items-center gap-3 text-sm text-stone-600'
                            >
                              <span className='w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0'>
                                <i className='fa fa-check text-amber-600 text-[10px]' />
                              </span>
                              {item.label}
                            </div>
                          ))}
                        </div>
                      )}
                      {exclusions.length > 0 && (
                        <div className='bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-6 space-y-3'>
                          <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-4'>
                            {t("tourDetail.notIncluded")}
                          </p>
                          {translatedExclusions.map((item) => (
                            <div
                              key={item.id}
                              className='flex items-center gap-3 text-sm text-stone-400'
                            >
                              <span className='w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center shrink-0'>
                                <i className='fa fa-times text-stone-400 text-[10px]' />
                              </span>
                              {item.label}
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
                      eyebrow={t("tourDetail.gallery.eyebrow")}
                      title={t("tourDetail.gallery.title")}
                    />
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3'>
                      {galleryImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setLightboxIndex(i)}
                          className={`relative overflow-hidden rounded-2xl bg-stone-100 group
                            ${
                              i === 0
                                ? "col-span-2 row-span-2 h-40 sm:h-48 md:h-64"
                                : "h-28 sm:h-32 md:h-40"
                            }`}
                        >
                          <img
                            src={renderImage(img)}
                            alt={t("tourDetail.gallery.alt", { number: i + 1 })}
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
            {activeTab === "itinerary" && tour?.type === "tour" && (
              <div>
                <SectionHeading
                  eyebrow={t("tourDetail.itinerary.eyebrow")}
                  title={t("tourDetail.itinerary.title")}
                />
                <div className='relative'>
                  {/* ✅ Hide timeline line on very small screens */}
                  <div className='hidden sm:block absolute left-5 top-0 bottom-0 w-px bg-amber-100' />
                  <div className='space-y-4 sm:space-y-6'>
                    {itinerary.map((day) => (
                      <div
                        key={day.day}
                        className='flex gap-3 sm:gap-6 relative'
                      >
                        <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-400 flex items-center justify-center text-amber-900 font-black text-sm shrink-0 z-10 shadow-md shadow-amber-200'>
                          {day.day}
                        </div>
                        <div className='flex-1 bg-white rounded-2xl border border-stone-100 overflow-hidden'>
                          {day.image && (
                            <div className='relative h-36 sm:h-44 overflow-hidden'>
                              <img
                                src={renderImage(day.image)}
                                alt={day.title}
                                className='w-full h-full object-cover'
                              />
                              <div className='absolute inset-0 bg-gradient-to-t from-white/60 to-transparent' />
                            </div>
                          )}
                          <div className='p-4 sm:p-5'>
                            <p className='text-xs font-bold uppercase tracking-widest text-amber-500 mb-1'>
                              {t("tourDetail.itinerary.day", { day: day.day })}
                            </p>
                            <h3 className='font-black text-stone-800 text-sm sm:text-base mb-1'>
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
                <div className='bg-white rounded-2xl border border-stone-100 p-5 sm:p-8 mb-8 flex flex-col md:flex-row items-center gap-6 md:gap-8'>
                  <div className='text-center shrink-0'>
                    <p className='text-5xl sm:text-6xl font-black text-amber-500'>
                      {avgRating > 0 && avgRating}
                    </p>
                    <StarRating rating={Math.round(avgRating)} size='text-lg' />
                    <p className='text-xs text-stone-400 mt-2'>
                      {t("tourDetail.review.count", { count: reviews?.length })}
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
                  eyebrow={t("tourDetail.review.eyebrow")}
                  title={t("tourDetail.review.title")}
                />
                <div className='space-y-4 mb-10 sm:mb-12'>
                  {reviews?.map((r) => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                </div>

                <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
                  <div className='h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400' />
                  <div className='p-5 sm:p-7'>
                    <h3
                      className='text-lg sm:text-xl font-black text-stone-800 mb-1'
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {t("tourDetail.reviewForm.title")}
                    </h3>
                    <p className='text-sm text-stone-400 mb-6'>
                      {t("tourDetail.reviewForm.subtitle")}
                    </p>
                    {submitted ? (
                      <div className='text-center py-10'>
                        <div className='w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4'>
                          <i className='fa fa-check text-amber-500 text-xl' />
                        </div>
                        <p className='font-bold text-stone-700 mb-1'>
                          {t("tourDetail.reviewForm.success")}
                        </p>
                        <p className='text-sm text-stone-400'>
                          {t("tourDetail.reviewForm.thanks")}
                        </p>
                        <button
                          onClick={() => setSubmitted(false)}
                          className='mt-4 text-sm text-amber-600 hover:text-amber-700 font-semibold'
                        >
                          {t("tourDetail.reviewForm.writeAnother")}
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={cHandleSubmit} className='space-y-4'>
                        <div>
                          <label className='block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2'>
                            {t("tourDetail.reviewForm.ratingLabel")} *
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
                              {cData?.rating &&
                                t(
                                  `tourDetail.reviewForm.ratingLabels.${cData.rating}`
                                )}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className='block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5'>
                            {t("tourDetail.reviewForm.commentLabel")} *
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
                          t("tourDetail.reviewForm.submit"),
                          "submit",
                          () => true,
                          isSubmitting,
                          <i className='fa fa-paper-plane text-xs' />,
                          "submit"
                        )}
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
                  eyebrow={t("tourDetail.map.eyebrow")}
                  title={t("tourDetail.map.title")}
                />
                <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
                  {tour?.lat && tour?.lng && (
                    <TourLocationViewer
                      coordinates={{ lng: tour?.lng, lat: tour?.lat }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT — BOOKING SIDEBAR ──────────────── */}
          {/* ✅ sticky only on desktop, shows ABOVE content on mobile (flex-col-reverse) */}
          <div className='w-full lg:w-80 shrink-0'>
            <div className='lg:sticky lg:top-[65px] space-y-4'>
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

              {/* Trust badges */}
              <div className='bg-white rounded-2xl border border-stone-100 p-4 sm:p-5 space-y-3'>
                {[
                  {
                    icon: "fa-shield-alt",
                    text: t("tourDetail.trust.freeCancellation"),
                  },
                  { icon: "fa-headset", text: t("tourDetail.trust.support") },
                  {
                    icon: "fa-certificate",
                    text: t("tourDetail.trust.guides"),
                  },
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
              <div className='bg-white rounded-2xl border border-stone-100 p-4 sm:p-5'>
                <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-3'>
                  {t("tourDetail.share.title", { type: typeConfig.label })}
                </p>
                <div className='flex gap-2'>
                  {[
                    {
                      icon: "fa-facebook-f",
                      name: "facebook",
                      color:
                        "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200",
                      shareUrl: (url) =>
                        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                          url
                        )}`,
                    },
                    {
                      icon: "fa-twitter",
                      name: "twitter",
                      color:
                        "hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200",
                      shareUrl: (url, title) =>
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                          title
                        )}&url=${encodeURIComponent(url)}`,
                    },
                    {
                      icon: "fa-whatsapp",
                      name: "whatsapp",
                      color:
                        "hover:bg-green-50 hover:text-green-600 hover:border-green-200",
                      shareUrl: (url, title) =>
                        `https://wa.me/?text=${encodeURIComponent(
                          title + " " + url
                        )}`,
                    },
                    {
                      icon: "fa-link",
                      name: "copy",
                      color:
                        "hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200",
                    },
                  ].map((s) => {
                    const handleShare = () => {
                      if (s.name === "copy") {
                        navigator.clipboard.writeText(window.location.href);
                        alert(
                          t("tourDetail.share.linkCopied") || "Link copied!"
                        );
                      } else {
                        const w = window.open(
                          s.shareUrl(window.location.href, document.title),
                          "_blank",
                          "width=600,height=400"
                        );
                        if (w) w.focus();
                      }
                    };
                    return (
                      <button
                        key={s.icon}
                        onClick={handleShare}
                        className={`flex-1 py-2 rounded-xl border border-stone-200 text-stone-400 text-sm transition-all ${s.color}`}
                      >
                        <i className={`fab ${s.icon}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RELATED TOURS ────────────────────────────── */}
        {relatedTours.length > 0 && (
          <div className='mt-16 sm:mt-20'>
            {/* ✅ Stack on mobile */}
            <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 sm:mb-8'>
              <SectionHeading
                eyebrow={t("tourDetail.related.eyebrow")}
                title={t("tourDetail.related.title")}
              />
              <Link
                to={`/tours?category=${tour?.category}`}
                className='flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors mb-1 shrink-0'
              >
                {t("tourDetail.related.viewAll")}{" "}
                <i className='fa fa-arrow-right text-xs' />
              </Link>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6'>
              {relatedTours.map((relatedTour) => (
                <RelatedCard key={relatedTour.id} tour={relatedTour} t={t} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── LIGHTBOX ────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <LightboxGallery
          images={galleryImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};

export default TourDetail;
