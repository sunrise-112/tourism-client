import { useEffect, useState } from "react";
import Joi from "joi-browser";
import { useParams } from "react-router-dom";

// Hooks
import useForm from "../../hooks/useForm";

// Services
import tourService from "../../services/tourService";
import inclusionsService from "../../services/inclusionsService";
import exclusionsService from "../../services/exclusionsService";

// Commons
import ToggleSwitcher from "../../common/ToggleSwitcher";
import TwoCol from "../../common/TwoCol";

// Components
import ItinerarySection from "./ItinerarySection";

// Utils
import {
  renderInput,
  renderDraggableImages,
  renderTextarea,
  renderSelect,
  renderImageUpload,
  renderMultiSelect,
} from "../../utils/formRenders";
import renderImage from "../../utils/renderImage";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getImageSrc = (value) => {
  if (!value) return null;
  if (value instanceof File) return URL.createObjectURL(value);
  if (typeof value === "string") return renderImage(value);
  return null;
};

const completenessFields = (data, itineraryData) => [
  { label: "Title", done: !!data?.title },
  { label: "Description", done: !!data?.description },
  { label: "Destination", done: !!data?.destination },
  { label: "Price", done: !!data?.price },
  { label: "Duration", done: !!data?.duration_days },
  { label: "Cover", done: !!data?.cover_image },
  { label: "Gallery", done: (data?.gallery?.length ?? 0) > 0 },
  { label: "Itinerary", done: (itineraryData?.length ?? 0) > 0 },
];

// ─── Section Wrapper ──────────────────────────────────────────────────────────
const FormSection = ({ title, description, children, icon }) => (
  <div className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'>
    <div className='px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-3'>
      {icon && (
        <span className='w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-sm'>
          {icon}
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

// ─── Live Preview ─────────────────────────────────────────────────────────────
const LivePreview = ({ data, itineraryData, isSubmitting, validate, id }) => {
  const coverSrc = getImageSrc(data?.cover_image);
  const galleryPreviews = (data?.gallery || [])
    .slice(0, 4)
    .map(getImageSrc)
    .filter(Boolean);
  const fields = completenessFields(data, itineraryData);
  const pct = Math.round(
    (fields.filter((f) => f.done).length / fields.length) * 100
  );

  return (
    <div className='flex flex-col gap-4'>
      {/* Tour card preview */}
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
        {/* Cover */}
        <div className='relative h-52 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden'>
          {coverSrc ? (
            <img
              src={coverSrc}
              alt='cover'
              className='w-full h-full object-cover transition-all duration-500'
            />
          ) : (
            <div className='w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300'>
              <svg
                className='w-10 h-10'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1}
                  d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              <span className='text-xs font-medium'>No cover image</span>
            </div>
          )}

          {/* Badges */}
          <div className='absolute top-3 left-3 flex gap-1.5 flex-wrap'>
            {data?.is_featured && (
              <span className='bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm'>
                ⭐ Featured
              </span>
            )}
            {data?.is_hot_deal && (
              <span className='bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm'>
                🔥 Hot Deal
              </span>
            )}
          </div>

          {data?.category && (
            <div className='absolute top-3 right-3'>
              <span className='bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/50 shadow-sm'>
                {data.category}
              </span>
            </div>
          )}

          {data?.price && (
            <div className='absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow'>
              <span className='text-[10px] text-gray-400 font-medium block'>
                From
              </span>
              <p className='text-base font-bold text-gray-900 leading-none'>
                ${Number(data.price).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className='p-5 space-y-4'>
          <div>
            <h3 className='font-bold text-gray-900 text-lg leading-snug'>
              {data?.title || (
                <span className='text-gray-300 font-normal italic text-base'>
                  Tour title…
                </span>
              )}
            </h3>
            {data?.destination && (
              <p className='text-xs text-gray-400 mt-1 flex items-center gap-1'>
                <svg
                  className='w-3 h-3 flex-shrink-0'
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
                {data.destination}
              </p>
            )}
          </div>

          {data?.description && (
            <p className='text-xs text-gray-500 leading-relaxed line-clamp-3'>
              {data.description}
            </p>
          )}

          {/* Stats */}
          <div className='grid grid-cols-3 gap-2'>
            {[
              { label: "Days", value: data?.duration_days, icon: "📅" },
              { label: "Max Group", value: data?.max_group_size, icon: "👥" },
              {
                label: "Per day",
                value:
                  data?.price && data?.duration_days
                    ? `$${Math.round(data.price / data.duration_days)}`
                    : null,
                icon: "💰",
              },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className='bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100'
              >
                <p className='text-base'>{icon}</p>
                <p className='text-xs font-bold text-gray-800 mt-0.5'>
                  {value ?? <span className='text-gray-300'>—</span>}
                </p>
                <p className='text-[10px] text-gray-400'>{label}</p>
              </div>
            ))}
          </div>

          {/* Gallery strip */}
          {galleryPreviews.length > 0 && (
            <div>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>
                Gallery · {data.gallery.length} photo
                {data.gallery.length !== 1 ? "s" : ""}
              </p>
              <div className='grid grid-cols-4 gap-1 rounded-xl overflow-hidden'>
                {galleryPreviews.map((src, i) => (
                  <div key={i} className='relative aspect-square'>
                    <img
                      src={src}
                      alt=''
                      className='w-full h-full object-cover'
                    />
                    {i === 3 && data.gallery.length > 4 && (
                      <div className='absolute inset-0 bg-black/55 flex items-center justify-center'>
                        <span className='text-white text-xs font-bold'>
                          +{data.gallery.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itinerary */}
          {itineraryData?.length > 0 && (
            <div>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>
                Itinerary · {itineraryData.length} day
                {itineraryData.length !== 1 ? "s" : ""}
              </p>
              <div className='space-y-1.5'>
                {itineraryData.slice(0, 3).map((day, i) => (
                  <div key={i} className='flex items-center gap-2.5 text-xs'>
                    <span className='w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0'>
                      {day.day}
                    </span>
                    <span className='text-gray-600 truncate'>
                      {day.title || "Untitled day"}
                    </span>
                    {day.location && (
                      <span className='text-gray-300 text-[10px] ml-auto flex-shrink-0 truncate max-w-[80px]'>
                        {day.location}
                      </span>
                    )}
                  </div>
                ))}
                {itineraryData.length > 3 && (
                  <p className='text-[10px] text-gray-400 pl-7'>
                    +{itineraryData.length - 3} more days
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Completeness */}
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3'>
        <div className='flex items-center justify-between'>
          <p className='text-[11px] font-bold text-gray-400 uppercase tracking-widest'>
            Completeness
          </p>
          <span
            className={`text-xs font-bold ${
              pct === 100 ? "text-green-600" : "text-amber-600"
            }`}
          >
            {pct}%
          </span>
        </div>
        <div className='w-full bg-gray-100 rounded-full h-1.5 overflow-hidden'>
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct === 100
                ? "bg-gradient-to-r from-green-400 to-green-500"
                : "bg-gradient-to-r from-amber-400 to-amber-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className='flex flex-wrap gap-1.5'>
          {fields.map(({ label, done }) => (
            <span
              key={label}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                done
                  ? "bg-green-50 text-green-600 border-green-100"
                  : "bg-gray-50 text-gray-400 border-gray-100"
              }`}
            >
              {done ? "✓" : "○"} {label}
            </span>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type='submit'
        disabled={!!validate() || isSubmitting}
        className='
          w-full py-3.5 rounded-xl font-bold text-sm tracking-wide uppercase
          bg-amber-500 hover:bg-amber-400 active:scale-[0.98]
          disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none
          text-white
          shadow-[0_4px_16px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_24px_rgba(245,158,11,0.4)]
          transition-all duration-200 flex items-center justify-center gap-2
        '
      >
        {isSubmitting ? (
          <>
            <svg
              className='animate-spin w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8v8H4z'
              />
            </svg>
            Processing…
          </>
        ) : id ? (
          "Update Tour"
        ) : (
          "Publish Tour"
        )}
      </button>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const TourForm = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    destination: "",
    price: "",
    duration_days: "",
    max_group_size: "",
    cover_image: "",
    is_featured: false,
    is_hot_deal: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itineraryInitialData, setItineraryInitialData] = useState([]);
  const [itineraryData, setItineraryData] = useState([]);
  const [inclusions, setInclusions] = useState([]);
  const [exclusions, setExclusions] = useState([]);

  const CATEGORIES = [
    { id: 1, name: "Adventure" },
    { id: 2, name: "Cultural" },
    { id: 3, name: "Coastal" },
    { id: 4, name: "Historical" },
  ];

  const schema = {
    id: Joi.optional(),
    title: Joi.string().max(200).required().label("Title"),
    description: Joi.string().optional().label("Description"),
    destination: Joi.string().max(150).optional().label("Destination"),
    cover_image: Joi.optional(),
    gallery: Joi.optional(),
    price: Joi.number().precision(2).positive().optional().label("Price"),
    duration_days: Joi.number()
      .integer()
      .positive()
      .optional()
      .label("Duration Days"),
    max_group_size: Joi.number()
      .integer()
      .positive()
      .optional()
      .label("Max Group Size"),
    is_featured: Joi.boolean().default(false).label("Is Featured"),
    is_hot_deal: Joi.boolean().default(false).label("Is Hot Deal"),
    category: Joi.string().max(80).optional().label("Category"),
    inclusions: Joi.array().items(Joi.number()).optional().label("Inclusions"),
    exclusions: Joi.array().items(Joi.number()).optional().label("Exclusions"),
    created_at: Joi.any(),
    updated_at: Joi.any(),
  };

  useEffect(() => {
    const fetchOptions = async () => {
      const [inclusions, exclusions] = await Promise.all([
        inclusionsService.getAll({ is_active: true, limit: 100 }),
        exclusionsService.getAll({ is_active: true, limit: 100 }),
      ]);

      setFormData({
        inclusions: inclusions?.data?.map((inc) => parseInt(inc.id)),
        exclusions: exclusions?.data?.map((exc) => parseInt(exc.id)),
      });

      setInclusions(
        inclusions?.data?.map((inc) => ({ id: inc.id, name: inc.text }))
      );

      setExclusions(
        exclusions?.data?.map((exc) => ({ id: exc.id, name: exc.text }))
      );
    };

    fetchOptions();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchTour = async () => {
      try {
        setIsLoading(true);
        const tour = await tourService.getById(id);
        setFormData({
          id: tour.id,
          title: tour.title,
          description: tour.description,
          destination: tour.destination,
          price: tour.price,
          duration_days: tour.duration_days,
          max_group_size: tour.max_group_size,
          cover_image: tour.cover_image,
          is_featured: tour.is_featured,
          is_hot_deal: tour.is_hot_deal,
          category: tour.category,
          inclusions: tour.inclusions.map((inc) => parseInt(inc.id)),
          exclusions: tour.exclusions.map((exc) => parseInt(exc.id)),
          gallery: tour.images?.map((img) =>
            typeof img === "object" && img?.url ? img.url : img
          ),
        });
        setItineraryInitialData(
          (tour.itineraries || []).map((i) => ({
            day: i?.day,
            title: i?.title,
            description: i?.description,
            location: i?.location,
            image: i?.image,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  const doSubmit = async () => {
    try {
      if (isSubmitting) return;
      setIsSubmitting(true);
      const fd = getFormData();
      itineraryData.forEach((day, index) => {
        Object.entries(day).forEach(([key, value]) => {
          if (value instanceof File)
            fd.append(`itinerary[${index}][${key}]`, value);
          else if (value != null)
            fd.append(`itinerary[${index}][${key}]`, String(value));
        });
      });
      id ? await tourService.update(id, fd) : await tourService.create(fd);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data, errors, handleChange, handleSubmit, validate, getFormData } =
    useForm(formData, schema, doSubmit);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <svg
            className='animate-spin w-8 h-8 text-amber-500'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8v8H4z'
            />
          </svg>
          <p className='text-sm text-gray-400 font-medium'>Loading tour…</p>
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
                <svg
                  className='w-4 h-4 text-white'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064'
                  />
                </svg>
              </div>
              <div>
                <h1 className='text-sm font-bold text-gray-900'>
                  {id ? "Edit Tour" : "New Tour"}
                </h1>
                <p className='text-[11px] text-gray-400'>
                  {id ? "Update tour details" : "Fill in details to publish"}
                </p>
              </div>
            </div>
            <button
              type='button'
              className='text-sm text-gray-400 hover:text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium'
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className='max-w-7xl mx-auto px-4 md:px-6 py-8'>
          <div className='grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start'>
            {/* LEFT — form */}
            <div className='space-y-6 min-w-0'>
              <FormSection
                title='Basic Information'
                description='Core tour details'
                icon='📋'
              >
                {renderInput(
                  "Title",
                  "title",
                  data,
                  errors,
                  handleChange,
                  "text",
                  true
                )}
                {renderTextarea(
                  "Description",
                  "description",
                  data,
                  errors,
                  handleChange
                )}
                {renderInput(
                  "Destination",
                  "destination",
                  data,
                  errors,
                  handleChange,
                  "text",
                  true
                )}
              </FormSection>

              <FormSection
                title='Pricing & Logistics'
                description='Capacity, duration and cost'
                icon='💼'
              >
                <TwoCol>
                  <div>
                    {renderInput(
                      "Price ($)",
                      "price",
                      data,
                      errors,
                      handleChange,
                      "number",
                      true
                    )}
                  </div>
                  <div>
                    {renderInput(
                      "Duration (days)",
                      "duration_days",
                      data,
                      errors,
                      handleChange,
                      "number",
                      true
                    )}
                  </div>
                </TwoCol>
                <TwoCol>
                  <div>
                    {renderInput(
                      "Max Group Size",
                      "max_group_size",
                      data,
                      errors,
                      handleChange,
                      "number",
                      true
                    )}
                  </div>
                  <div>
                    {renderSelect(
                      "Category",
                      "category",
                      data,
                      errors,
                      handleChange,
                      CATEGORIES,
                      "name",
                      "name"
                    )}
                  </div>
                </TwoCol>
              </FormSection>

              <FormSection title='Visibility' icon='🏷️'>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <div className='flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100'>
                    {ToggleSwitcher({
                      label: "Featured",
                      name: "is_featured",
                      data,
                      errors,
                      onChange: handleChange,
                      bg_color: "bg-amber-400",
                    })}
                  </div>
                  <div className='flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100'>
                    {ToggleSwitcher({
                      label: "Hot Deal",
                      name: "is_hot_deal",
                      data,
                      errors,
                      onChange: handleChange,
                      bg_color: "bg-red-400",
                    })}
                  </div>
                </div>
              </FormSection>

              <FormSection
                title='Media'
                description='Cover image and gallery'
                icon='🖼️'
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>
                      Cover Image
                    </p>
                    {renderImageUpload(
                      "Cover Image",
                      "cover_image",
                      data,
                      errors,
                      handleChange,
                      true,
                      "Select tour thumbnail"
                    )}
                  </div>
                  <div>
                    <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>
                      Gallery
                    </p>
                    {renderDraggableImages(
                      "Gallery",
                      "gallery",
                      data,
                      errors,
                      handleChange,
                      true,
                      20,
                      "Upload gallery images · Max 20"
                    )}
                  </div>
                </div>
              </FormSection>

              <ItinerarySection
                initialData={itineraryInitialData}
                onUpdate={(structured) => setItineraryData(structured)}
              />

              <FormSection
                title='Inclusions & Exclusions'
                description="What's covered and what's not"
                icon='✅'
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    {renderMultiSelect(
                      "Inclusions",
                      "inclusions",
                      data,
                      errors,
                      handleChange,
                      inclusions,
                      "name",
                      "id",
                      undefined,
                      undefined,
                      true,
                      false,
                      10
                    )}
                  </div>
                  <div>
                    {renderMultiSelect(
                      "Exclusions",
                      "exclusions",
                      data,
                      errors,
                      handleChange,
                      exclusions,
                      "name",
                      "id",
                      undefined,
                      undefined,
                      true,
                      false,
                      10
                    )}
                  </div>
                </div>
              </FormSection>

              {/* Mobile submit */}
              <div className='xl:hidden pb-6'>
                <button
                  type='submit'
                  disabled={!!validate() || isSubmitting}
                  className='w-full py-3.5 rounded-xl font-bold text-sm uppercase bg-amber-500 hover:bg-amber-400 disabled:bg-gray-200 disabled:text-gray-400 text-white transition-all duration-200 flex items-center justify-center gap-2'
                >
                  {isSubmitting
                    ? "Processing…"
                    : id
                    ? "Update Tour"
                    : "Publish Tour"}
                </button>
              </div>
            </div>

            {/* RIGHT — sticky preview */}
            <div className='hidden xl:block'>
              <div className='sticky top-24'>
                <div className='flex items-center justify-between mb-3'>
                  <p className='text-[11px] font-bold text-gray-400 uppercase tracking-widest'>
                    Live Preview
                  </p>
                  <span className='inline-flex items-center gap-1.5 text-[10px] text-green-600 font-semibold bg-green-50 border border-green-100 px-2.5 py-1 rounded-full'>
                    <span className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse' />
                    Live
                  </span>
                </div>
                <LivePreview
                  data={data}
                  itineraryData={itineraryData}
                  isSubmitting={isSubmitting}
                  validate={validate}
                  id={id}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TourForm;
