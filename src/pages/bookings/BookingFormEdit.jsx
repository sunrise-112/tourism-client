// ── BookingEditForm.jsx ──────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Joi from "joi-browser";
import { toast } from "react-toastify";

// Utils
import {
  renderInput,
  renderTextarea,
  renderDateInput,
  renderTimeInput,
  renderButton,
} from "../../utils/formRenders";

// Services
import bookingService from "../../services/bookingService";
import useForm from "../../hooks/useForm";

const BookingEditForm = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [tourId, setTourId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Validation schema
  const schema = {
    booking_date: Joi.date().optional().label("Booking Date"),
    booking_time: Joi.string().optional().allow("", null).label("Booking Time"),
    pickup_location: Joi.string()
      .max(255)
      .optional()
      .allow("", null)
      .label("Pickup Location"),
    num_people: Joi.number()
      .integer()
      .min(1)
      .optional()
      .label("Number of People"),
    special_requests: Joi.string()
      .optional()
      .allow("", null)
      .label("Special Requests"),
  };

  // Fetch booking data
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
        toast.error("Failed to load booking data");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const doSubmit = async () => {
    try {
      setIsSubmitting(true);
      await bookingService.update(id, tourId, data);
      toast.success("Booking updated successfully");
      /* navigate("/bookings"); // Uncomment when route is ready */
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data, errors, handleChange, handleSubmit, validate } = useForm(
    formData,
    schema,
    doSubmit
  );

  if (loading) return <div className='p-8 text-center'>Loading...</div>;

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900'>
            {t("edit_booking")}
          </h1>
          <p className='mt-1 text-sm text-gray-600'>
            {t("update_booking_details")}
          </p>
        </div>

        {/* Two‑column layout: form left, preview right */}
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Form Section */}
          <div className='flex-1 bg-white rounded-xl shadow-md p-6'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {renderDateInput(
                  t("booking_date"),
                  "booking_date",
                  data,
                  errors,
                  handleChange,
                  false
                )}

                {renderTimeInput(
                  t("booking_time"),
                  "booking_time",
                  data,
                  errors,
                  handleChange,
                  false
                )}

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
              </div>

              <div>
                {renderTextarea(
                  t("special_requests"),
                  "special_requests",
                  data,
                  errors,
                  handleChange,
                  "text",
                  4
                )}
              </div>

              <div className='flex justify-end gap-3 pt-4 border-t'>
                {renderButton(
                  t("cancel"),
                  "cancel",
                  false,
                  false,
                  null,
                  "button",
                  "px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                )}
                {renderButton(
                  t("update"),
                  "submit",
                  isSubmitting,
                  isSubmitting,
                  null,
                  "submit",
                  "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                )}
              </div>
            </form>
          </div>

          {/* Preview Section (right side) */}
          <div className='lg:w-96 bg-white rounded-xl shadow-md p-6'>
            <h2 className='text-lg font-semibold text-gray-900 border-b pb-3 mb-4'>
              {t("preview")}
            </h2>
            <div className='space-y-4'>
              {/* Booking Date */}
              <div>
                <dt className='text-sm font-medium text-gray-500'>
                  {t("booking_date")}
                </dt>
                <dd className='mt-1 text-base text-gray-900'>
                  {data.booking_date || "—"}
                </dd>
              </div>

              {/* Booking Time */}
              <div>
                <dt className='text-sm font-medium text-gray-500'>
                  {t("booking_time")}
                </dt>
                <dd className='mt-1 text-base text-gray-900'>
                  {data.booking_time || "—"}
                </dd>
              </div>

              {/* Pickup Location */}
              <div>
                <dt className='text-sm font-medium text-gray-500'>
                  {t("pickup_location")}
                </dt>
                <dd className='mt-1 text-base text-gray-900'>
                  {data.pickup_location || "—"}
                </dd>
              </div>

              {/* Number of People */}
              <div>
                <dt className='text-sm font-medium text-gray-500'>
                  {t("num_people")}
                </dt>
                <dd className='mt-1 text-base text-gray-900'>
                  {data.num_people || "—"}
                </dd>
              </div>

              {/* Special Requests */}
              <div>
                <dt className='text-sm font-medium text-gray-500'>
                  {t("special_requests")}
                </dt>
                <dd className='mt-1 text-base text-gray-900 whitespace-pre-wrap'>
                  {data.special_requests || "—"}
                </dd>
              </div>

              {/* Optional extra info: Tour ID if available */}
              {tourId && (
                <div className='pt-2 mt-2 border-t border-gray-100'>
                  <dt className='text-sm font-medium text-gray-500'>
                    {t("tour_id")}
                  </dt>
                  <dd className='mt-1 text-sm text-gray-700'>{tourId}</dd>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingEditForm;
