// ── BookingEditForm.jsx ──────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Joi from "joi-browser";
import { toast } from "react-toastify";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faUsers,
  faCommentDots,
  faPencilAlt,
  faCalendarCheck,
  faTruck,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

// Utils
import {
  renderInput,
  renderTextarea,
  renderDateInput,
  renderTimeInput,
} from "../../utils/formRenders";

// Services
import bookingService from "../../services/bookingService";
import tourService from "../../services/tourService";
import useForm from "../../hooks/useForm";

// ─── Shared Components ────────────────────────────────────────────────
const FormSection = ({ title, description, children, icon }) => (
  <div className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'>
    <div className='px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-3'>
      {icon && (
        <span className='w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-sm'>
          <FontAwesomeIcon icon={icon} className='text-amber-600' />
        </span>
      )}
      <div>
        <h2 className='text-[11px] font-bold text-gray-600 tracking-widest uppercase'>
          {title}
        </h2>
        {description && (
          <p className='text-[11px] text-gray-400 mt-0.5'>{description}</p>
        )}
      </div>
    </div>
    <div className='p-6 space-y-5'>{children}</div>
  </div>
);

const TwoCol = ({ children }) => (
  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>{children}</div>
);

// ─── Live Preview Component ──────────────────────────────────────────
const BookingPreview = ({ data, tour, isSubmitting, isValid }) => {
  const { t } = useTranslation();

  const formattedDate = data.booking_date
    ? new Date(data.booking_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className='flex flex-col gap-4'>
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
        {/* Header with Tour info */}
        <div className='relative p-4 bg-gradient-to-r from-amber-50 to-white border-b border-gray-100'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <FontAwesomeIcon
                icon={faClipboardList}
                className='text-amber-600 text-base'
              />
              <div>
                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                  {t("booking_preview.booking_ref")}
                </p>
                <p className='text-xs font-semibold text-gray-700'>
                  {tour?.title ? tour.title : t("booking_preview.tour_info")}
                </p>
              </div>
            </div>
            {tour?.id && (
              <span className='bg-gray-100 text-gray-500 text-[10px] font-mono px-2 py-1 rounded-full'>
                {t("booking_preview.id_label")} {tour.id}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className='p-5 space-y-4'>
          {/* Booking Date */}
          <div className='flex items-start gap-3'>
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className='text-gray-500 text-base mt-0.5'
            />
            <div className='flex-1'>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                {t("booking_date")}
              </p>
              <p className='text-sm font-medium text-gray-800'>
                {formattedDate || data.booking_date || "—"}
              </p>
            </div>
          </div>

          {/* Booking Time */}
          {data.booking_time && (
            <div className='flex items-start gap-3'>
              <FontAwesomeIcon
                icon={faClock}
                className='text-gray-500 text-base mt-0.5'
              />
              <div className='flex-1'>
                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                  {t("booking_time")}
                </p>
                <p className='text-sm font-medium text-gray-800'>
                  {data.booking_time}
                </p>
              </div>
            </div>
          )}

          {/* Pickup Location */}
          <div className='flex items-start gap-3'>
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className='text-gray-500 text-base mt-0.5'
            />
            <div className='flex-1'>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                {t("pickup_location")}
              </p>
              <p className='text-sm text-gray-700'>
                {data.pickup_location || (
                  <span className='text-gray-300 italic'>
                    {t("booking_preview.not_specified")}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Number of people */}
          <div className='flex items-start gap-3'>
            <FontAwesomeIcon
              icon={faUsers}
              className='text-gray-500 text-base mt-0.5'
            />
            <div className='flex-1'>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                {t("num_people")}
              </p>
              <p className='text-sm font-semibold text-gray-800'>
                {data.num_people || "—"}{" "}
                <span className='text-gray-400 font-normal text-xs'>
                  {t("booking_preview.travelers")}
                </span>
              </p>
            </div>
          </div>

          {/* Special Requests */}
          {data.special_requests && (
            <div className='flex items-start gap-3 pt-2 border-t border-gray-50'>
              <FontAwesomeIcon
                icon={faCommentDots}
                className='text-gray-500 text-base mt-0.5'
              />
              <div className='flex-1'>
                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                  {t("special_requests")}
                </p>
                <p className='text-xs text-gray-600 whitespace-pre-wrap'>
                  {data.special_requests}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type='submit'
        disabled={isValid || isSubmitting || !data.booking_date}
        className='
          w-full py-3.5 rounded-xl font-bold text-sm tracking-wide uppercase
          bg-amber-500 hover:bg-amber-400 active:scale-[0.98]
          disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none
          text-white shadow-[0_4px_16px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_24px_rgba(245,158,11,0.4)]
          transition-all duration-200 flex items-center justify-center gap-2
        '
      >
        {isSubmitting ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin className='w-4 h-4' />
            {t("booking_preview.updating")}
          </>
        ) : (
          t("update")
        )}
      </button>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────
const BookingEditForm = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [tourId, setTourId] = useState(null);
  const [tourDetails, setTourDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const schema = {
    booking_date: Joi.date().required().label(t("booking_date")),
    booking_time: Joi.string()
      .optional()
      .allow("", null)
      .label(t("booking_time")),
    pickup_location: Joi.string()
      .max(255)
      .optional()
      .allow("", null)
      .label(t("pickup_location")),
    num_people: Joi.number().integer().min(1).optional().label(t("num_people")),
    special_requests: Joi.string()
      .optional()
      .allow("", null)
      .label(t("special_requests")),
  };

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const booking = await bookingService.getById(id);
        setTourId(booking.tour_id);
        setFormData({
          booking_date: booking.booking_date
            ? booking.booking_date.split("T")[0]
            : "",
          booking_time: booking.booking_time || "",
          pickup_location: booking.pickup_location || "",
          num_people: booking.num_people || 1,
          special_requests: booking.special_requests || "",
        });
      } catch (err) {
        console.error("Failed to load booking:", err);
        toast.error(t("booking_errors.load_failed"));
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, t]);

  useEffect(() => {
    if (!tourId) return;
    const fetchTour = async () => {
      try {
        const tour = await tourService.getById(tourId);
        setTourDetails(tour);
      } catch (err) {
        console.error("Failed to load tour details:", err);
        setTourDetails({
          id: tourId,
          title: t("booking_preview.tour_unknown"),
        });
      }
    };
    fetchTour();
  }, [tourId, t]);

  const doSubmit = async () => {
    try {
      setIsSubmitting(true);
      await bookingService.update(id, tourId, data);
      toast.success(t("booking_messages.update_success"));
      setTimeout(() => {
        navigate("/admin/bookings");
      }, 1500);
    } catch (err) {
      console.error("Update error:", err);
      toast.error(t("booking_errors.update_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data, errors, handleChange, handleSubmit, validate } = useForm(
    formData,
    schema,
    doSubmit
  );

  const hasValidationErrors = !!validate();

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className='w-8 h-8 text-amber-500'
          />
          <p className='text-sm text-gray-400 font-medium'>
            {t("booking_preview.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50/80'>
      <form onSubmit={handleSubmit} noValidate>
        {/* Sticky header */}
        <div className='bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-20 shadow-sm'>
          <div className='max-w-7xl mx-auto flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm'>
                <FontAwesomeIcon
                  icon={faPencilAlt}
                  className='text-white text-sm'
                />
              </div>
              <div>
                <h1 className='text-sm font-bold text-gray-900'>
                  {t("edit_booking")}
                </h1>
                <p className='text-[11px] text-gray-400'>
                  {t("update_booking_details")}
                </p>
              </div>
            </div>
            <button
              type='button'
              onClick={() => navigate("/admin/bookings")}
              className='text-sm text-gray-400 hover:text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium'
            >
              {t("cancel")}
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className='max-w-7xl mx-auto px-4 md:px-6 py-8'>
          <div className='grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start'>
            {/* LEFT — form sections */}
            <div className='space-y-6 min-w-0'>
              {/* Booking Date & Time Section */}
              <FormSection
                title={t("booking_section.when.title")}
                description={t("booking_section.when.desc")}
                icon={faCalendarCheck}
              >
                <TwoCol>
                  {renderDateInput(
                    t("booking_date"),
                    "booking_date",
                    data,
                    errors,
                    handleChange,
                    true
                  )}
                  {renderTimeInput(
                    t("booking_time"),
                    "booking_time",
                    data,
                    errors,
                    handleChange,
                    false
                  )}
                </TwoCol>
              </FormSection>

              {/* Pickup & Travelers */}
              <FormSection
                title={t("booking_section.logistics.title")}
                description={t("booking_section.logistics.desc")}
                icon={faTruck}
              >
                <TwoCol>
                  {renderInput(
                    t("pickup_location"),
                    "pickup_location",
                    data,
                    errors,
                    handleChange,
                    "text"
                  )}
                  {renderInput(
                    t("num_people"),
                    "num_people",
                    data,
                    errors,
                    handleChange,
                    "number"
                  )}
                </TwoCol>
              </FormSection>

              {/* Special Requests */}
              <FormSection
                title={t("booking_section.requests.title")}
                description={t("booking_section.requests.desc")}
                icon={faCommentDots}
              >
                {renderTextarea(
                  t("special_requests"),
                  "special_requests",
                  data,
                  errors,
                  handleChange,
                  "text",
                  4
                )}
              </FormSection>

              <div className='xl:hidden pt-4'>
                <p className='text-center text-xs text-gray-400'>
                  {t("booking_preview.scroll_hint")}
                </p>
              </div>
            </div>

            {/* RIGHT — sticky preview */}
            <div className='hidden xl:block'>
              <div className='sticky top-24'>
                <div className='flex items-center justify-between mb-3'>
                  <p className='text-[11px] font-bold text-gray-400 uppercase tracking-widest'>
                    {t("booking_preview.live_preview")}
                  </p>
                  <span className='inline-flex items-center gap-1.5 text-[10px] text-green-600 font-semibold bg-green-50 border border-green-100 px-2.5 py-1 rounded-full'>
                    <span className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse' />
                    {t("booking_preview.live")}
                  </span>
                </div>
                <BookingPreview
                  data={data}
                  tour={tourDetails}
                  isSubmitting={isSubmitting}
                  isValid={hasValidationErrors}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookingEditForm;
