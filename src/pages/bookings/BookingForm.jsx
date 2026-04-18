// ── BookingForm.jsx (Enhanced + Responsive Step Badge Fix) ──────────────────
import { useState } from "react";

// Utils
import {
  renderInput,
  renderDateInput,
  renderTimeInput,
  renderButton,
  renderTextarea,
  renderSelect,
  renderCheckBox,
} from "../../utils/formRenders";

import ToggleSwitcher from "../../common/ToggleSwitcher";

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
    <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-xl shadow-stone-200/50 transition-all duration-300 hover:shadow-2xl'>
      {/* Top accent - more vibrant gradient */}
      <div className='h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600' />

      <div className='p-5 md:p-6'>
        {/* Price section with improved hierarchy */}
        <div className='mb-5'>
          <p className='text-xs text-stone-400 uppercase tracking-wider mb-1 font-semibold'>
            Price per person
          </p>
          <div className='flex items-baseline gap-1'>
            <span className='text-3xl font-black text-amber-600'>$</span>
            <span className='text-5xl font-black text-amber-600 tracking-tight'>
              {Number(tour.price).toLocaleString()}
            </span>
          </div>
          {priceBreakdown && (
            <p className='text-xs text-stone-400 mt-1'>{priceBreakdown}</p>
          )}
        </div>

        {/* Sidebar stats - enhanced with subtle hover */}
        <div className='space-y-3 mb-6 pb-5 border-b border-stone-100'>
          {typeConfig.sidebarStats.map((s) => (
            <div
              key={s.label}
              className='flex items-center justify-between text-sm group transition-all duration-150 hover:bg-stone-50/50 -mx-2 px-2 py-1 rounded-lg'
            >
              <span className='text-stone-500 flex items-center gap-2.5'>
                <i
                  className={`fa ${s.icon} text-amber-500 w-4 text-center transition-transform group-hover:scale-110`}
                />
                <span className='text-stone-600'>{s.label}</span>
              </span>
              <span className='font-semibold text-stone-800 text-right max-w-[130px] truncate'>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Step indicator (responsive fix - badge never hidden) ── */}
        <div className='flex flex-wrap items-center gap-2 mb-6'>
          <div className='flex flex-1 min-w-[180px] gap-2'>
            {STEPS.map((s, i) => {
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <div key={s.id} className='flex items-center gap-2 flex-1'>
                  {/* Circle */}
                  <div
                    className={`
                      w-9 h-9 rounded-full flex items-center justify-center shrink-0
                      text-sm font-black transition-all duration-300
                      ${
                        isDone
                          ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                          : isActive
                          ? "bg-amber-500 text-white ring-4 ring-amber-200/60 shadow-md"
                          : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                      }
                    `}
                  >
                    {isDone ? (
                      <i className='fa fa-check text-xs' />
                    ) : (
                      <i className={`fa ${s.icon} text-sm`} />
                    )}
                  </div>

                  {/* Label */}
                  <div className='flex-1 min-w-0'>
                    <p
                      className={`text-xs font-bold transition-colors duration-200 truncate ${
                        isActive ? "text-stone-800" : "text-stone-400"
                      }`}
                    >
                      {s.label}
                    </p>
                    <p className='text-[10px] text-stone-400 leading-tight'>
                      {isDone
                        ? "Completed"
                        : isActive
                        ? "In progress"
                        : "Upcoming"}
                    </p>
                  </div>

                  {/* Connector (only between steps) */}
                  {i < STEPS.length - 1 && (
                    <div className='w-6 shrink-0 h-0.5 bg-stone-100 rounded-full relative overflow-hidden'>
                      <div
                        className='absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 rounded-full'
                        style={{ width: isDone ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Steps remaining pill - always visible now */}
          <span
            className={`
              shrink-0 text-[11px] font-bold px-3 py-1 rounded-full
              transition-all duration-300 backdrop-blur-sm
              ${
                step === STEPS.length
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
                  : "bg-amber-50 text-amber-700 border border-amber-200 shadow-sm"
              }
            `}
          >
            {step === STEPS.length
              ? "✨ Last step"
              : `${STEPS.length - step} step${
                  STEPS.length - step > 1 ? "s" : ""
                } left`}
          </span>
        </div>

        {/* ── Form with enhanced transitions ─────────────────── */}
        <form onSubmit={handleSubmit}>
          <div className='relative min-h-[380px]'>
            {/* Step 1 — Contact */}
            <div
              className={`space-y-4 transition-all duration-300 ease-out ${
                step === 1
                  ? "opacity-100 translate-x-0"
                  : direction === "forward"
                  ? "opacity-0 -translate-x-6 absolute inset-0 pointer-events-none"
                  : "opacity-0 translate-x-6 absolute inset-0 pointer-events-none"
              }`}
            >
              <div className='flex items-center justify-between mb-1'>
                <p className='text-[11px] font-bold text-stone-400 uppercase tracking-wider'>
                  Contact Information
                </p>
                <span className='text-[10px] text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full'>
                  Step 1 of 2
                </span>
              </div>

              <div className='space-y-4'>
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
                {renderInput(
                  "Phone",
                  "phone",
                  data,
                  errors,
                  handleChange,
                  "tel"
                )}
                {renderInput(
                  "Nationality",
                  "nationality",
                  data,
                  errors,
                  handleChange,
                  "text"
                )}
              </div>

              <button
                type='button'
                disabled={!isStep1Valid}
                onClick={() => goTo(2)}
                className='w-full mt-6 py-3.5 rounded-xl text-sm font-bold
                  text-amber-900 bg-gradient-to-r from-amber-400 to-amber-500 
                  hover:from-amber-500 hover:to-amber-600
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-amber-400
                  transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-amber-200/50'
              >
                Continue{" "}
                <i className='fa fa-arrow-right text-xs transition-transform group-hover:translate-x-0.5' />
              </button>
            </div>

            {/* Step 2 — Booking Details */}
            <div
              className={`space-y-4 transition-all duration-300 ease-out ${
                step === 2
                  ? "opacity-100 translate-x-0"
                  : direction === "forward"
                  ? "opacity-0 translate-x-6 absolute inset-0 pointer-events-none"
                  : "opacity-0 -translate-x-6 absolute inset-0 pointer-events-none"
              }`}
            >
              <div className='flex items-center justify-between mb-1'>
                <p className='text-[11px] font-bold text-stone-400 uppercase tracking-wider'>
                  Booking Details
                </p>
                <span className='text-[10px] text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full'>
                  Step 2 of 2
                </span>
              </div>

              <div className='space-y-4'>
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
              </div>

              {/* Price summary - enhanced card */}
              {data?.num_people && data?.booking_date && data?.booking_time && (
                <div className='bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md'>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-stone-500'>Price per person</span>
                      <span className='font-semibold text-stone-800'>
                        ${tour.price}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-stone-500'>Number of people</span>
                      <span className='font-semibold text-stone-800'>
                        × {data.num_people}
                      </span>
                    </div>
                    <div className='border-t border-amber-200 pt-2 mt-1 flex justify-between items-baseline'>
                      <span className='font-bold text-stone-700'>Total</span>
                      <span className='font-black text-2xl text-amber-600'>
                        ${Number(totalPrice).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className='flex gap-3 pt-2'>
                <button
                  type='button'
                  onClick={() => goTo(1)}
                  className='py-3 px-5 rounded-xl text-sm font-semibold
                    text-stone-600 bg-white border border-stone-200 
                    hover:border-stone-300 hover:text-stone-800 hover:bg-stone-50
                    transition-all duration-200 flex items-center gap-2 shrink-0'
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

        {/* Enquire button */}
        <button className='w-full mt-5 py-3 rounded-xl text-sm font-semibold text-stone-500 hover:text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-stone-300 transition-all duration-200 flex items-center justify-center gap-2 group'>
          <i className='fa fa-envelope text-xs group-hover:scale-110 transition-transform' />
          Enquire Now
        </button>
      </div>
    </div>
  );
};

export default BookingForm;
