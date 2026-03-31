// ── BookingForm.jsx ───────────────────────────────────────────
import { useState } from "react";

// Utils
import {
  renderInput,
  renderDateInput,
  renderTimeInput,
  renderButton,
  renderTextarea,
  renderSelect,
} from "../../utils/formRenders";

const STEPS = [
  { id: 1, label: "Contact", icon: "fa-user" },
  { id: 2, label: "Details", icon: "fa-calendar-alt" },
];

const BookingForm = ({
  tour,
  data,
  errors,
  handleChange,
  handleSubmit,
  validate,
  priceBreakdown,
  typeConfig,
  isSubmitting,
}) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState("forward");

  const goTo = (next) => {
    setDirection(next > step ? "forward" : "back");
    setStep(next);
  };

  const isStep1Valid =
    data?.full_name && data?.email && data?.phone && data?.nationality;

  const isStep2Valid =
    data?.booking_date && data?.booking_time && data?.num_people;

  const totalPrice =
    data?.num_people && tour?.price
      ? tour.price * Number(data.num_people)
      : null;

  return (
    <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-xl shadow-stone-200/50'>
      {/* Top accent */}
      <div className='h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400' />

      <div className='p-6'>
        {/* Price */}
        <p className='text-xs text-stone-400 uppercase tracking-widest mb-1'>
          Price per person
        </p>
        <p className='text-4xl font-black text-amber-600'>
          ${Number(tour.price).toLocaleString()}
        </p>
        {priceBreakdown && (
          <p className='text-xs text-stone-400 mt-1 mb-4'>{priceBreakdown}</p>
        )}

        {/* Sidebar stats */}
        <div className='space-y-3 mb-6 pb-5 border-b border-stone-100'>
          {typeConfig.sidebarStats.map((s) => (
            <div
              key={s.label}
              className='flex items-center justify-between text-sm'
            >
              <span className='text-stone-400 flex items-center gap-2'>
                <i className={`fa ${s.icon} text-amber-400 w-4 text-center`} />
                {s.label}
              </span>
              <span className='font-full_namesemibold text-stone-700 text-right max-w-[130px] truncate'>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Step indicator ────────────────────────── */}
        <div className='flex items-center gap-2 mb-6'>
          {STEPS.map((s, i) => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className='flex items-center gap-2 flex-1'>
                <div className='flex items-center gap-2 flex-1'>
                  {/* Circle */}
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center shrink-0
                      text-xs font-black transition-all duration-300
                      ${
                        isDone
                          ? "bg-amber-400 text-amber-900"
                          : isActive
                          ? "bg-amber-400 text-amber-900 ring-4 ring-amber-400/20"
                          : "bg-stone-100 text-stone-400"
                      }
                    `}
                  >
                    {isDone ? (
                      <i className='fa fa-check text-[10px]' />
                    ) : (
                      <i className={`fa ${s.icon} text-[10px]`} />
                    )}
                  </div>

                  {/* Label + sublabel */}
                  <div className='flfull_nameex-1'>
                    <p
                      className={`text-xs font-bold transition-colors duration-200 ${
                        isActive ? "text-stone-800" : "text-stone-400"
                      }`}
                    >
                      {s.label}
                    </p>
                    <p className='text-[10px] text-stone-400'>
                      {isDone
                        ? "Completed"
                        : isActive
                        ? "In progress"
                        : "Upcoming"}
                    </p>
                  </div>
                </div>

                {/* Connector */}
                {i < STEPS.length - 1 && (
                  <div className='w-8 shrink-0 h-px bg-stone-200 mx-1 relative overflow-hidden'>
                    <div
                      className='absolute inset-y-0 left-0 bg-amber-400 transition-all duration-500'
                      style={{ width: isDone ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Steps remaining pill */}
          <span
            className={`
              ml-auto shrink-0 text-[10px] font-bold px-2.5 py-1 rounded
              transition-all duration-300 
              ${
                step === STEPS.length
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-amber-50 text-amber-600 border border-amber-200"
              }
            `}
          >
            {step === STEPS.length
              ? "Last step"
              : `${STEPS.length - step} step${
                  STEPS.length - step > 1 ? "s" : ""
                } left`}
          </span>
        </div>

        {/* ── Form ─────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div className='relative overflow-hidden'>
            {/* Step 1 — Contact */}
            <div
              className={`space-y-3 transition-all duration-300 ${
                step === 1
                  ? "opacity-100 translate-x-0"
                  : direction === "forward"
                  ? "opacity-0 -translate-x-8 absolute inset-0 pointer-events-none"
                  : "opacity-0 translate-x-8 absolute inset-0 pointer-events-none"
              }`}
            >
              <p className='text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3'>
                Contact Information
              </p>

              {renderInput(
                "Full Name",
                "full_name",
                data,
                errors,
                handleChange,
                "text"
              )}
              {renderInput(
                "Email",
                "email",
                data,
                errors,
                handleChange,
                "email"
              )}
              {renderInput("Phone", "phone", data, errors, handleChange, "tel")}
              {renderInput(
                "Nationality",
                "nationality",
                data,
                errors,
                handleChange,
                "text"
              )}

              <button
                type='button'
                disabled={!isStep1Valid}
                onClick={() => goTo(2)}
                className='w-full mt-2 py-3 rounded-xl text-sm font-bold
                  text-amber-900 bg-amber-400 hover:bg-amber-300
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-200 flex items-center justify-center gap-2'
              >
                Continue <i className='fa fa-arrow-right text-xs' />
              </button>
            </div>

            {/* Step 2 — Booking Details */}
            <div
              className={`space-y-3 transition-all duration-300 ${
                step === 2
                  ? "opacity-100 translate-x-0"
                  : direction === "forward"
                  ? "opacity-0 translate-x-8 absolute inset-0 pointer-events-none"
                  : "opacity-0 -translate-x-8 absolute inset-0 pointer-events-none"
              }`}
            >
              <p className='text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3'>
                Booking Details
              </p>

              {renderDateInput(
                "Date",
                "booking_date",
                data,
                errors,
                handleChange,
                true
              )}
              {renderTimeInput(
                "Time",
                "booking_time",
                data,
                errors,
                handleChange,
                true
              )}
              {renderInput(
                "Number of People",
                "num_people",
                data,
                errors,
                handleChange,
                "number",
                undefined,
                undefined,
                true,
                tour?.max_group_size?.toString()
              )}
              {renderInput(
                "Pickup Location",
                "pickup_location",
                data,
                errors,
                handleChange,
                "text"
              )}
              {renderTextarea(
                "Special Requests",
                "special_requests",
                data,
                errors,
                handleChange,
                false,
                undefined,
                "Dietary requirements, accessibility needs, preferences…"
              )}

              {/* Price summary */}
              {data?.num_people && data?.booking_date && data?.booking_time && (
                <div className='bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-2'>
                  <div className='flex justify-between text-sm text-stone-500'>
                    <span>Price per person</span>
                    <span className='font-semibold text-stone-700'>
                      ${tour.price}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm text-stone-500'>
                    <span>People</span>
                    <span className='font-semibold text-stone-700'>
                      × {data.num_people}
                    </span>
                  </div>
                  <div className='border-t border-amber-200 pt-2 flex justify-between'>
                    <span className='font-bold text-stone-800'>Total</span>
                    <span className='font-black text-lg text-amber-600'>
                      ${Number(totalPrice).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className='flex gap-2 pt-1'>
                <button
                  type='button'
                  onClick={() => goTo(1)}
                  className='py-3 px-4 rounded-xl text-sm font-semibold
                    text-stone-500 border border-stone-200 hover:border-stone-300
                    hover:text-stone-700 transition-all duration-200
                    flex items-center gap-2 shrink-0'
                >
                  <i className='fa fa-arrow-left text-xs' /> Back
                </button>

                {renderButton(
                  `Book this ${
                    tour.type.charAt(0).toUpperCase() + tour.type.slice(1)
                  }`,
                  "submit",
                  validate(),
                  isSubmitting
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Enquire */}
        <button className='w-full mt-4 py-3 rounded-xl text-sm font-semibold text-stone-500 hover:text-stone-700 border border-stone-200 hover:border-stone-300 transition-colors flex items-center justify-center gap-2'>
          <i className='fa fa-envelope text-xs' /> Enquire Now
        </button>
      </div>
    </div>
  );
};

export default BookingForm;
