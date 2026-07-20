import { useEffect, useState } from "react";
import Joi from "joi-browser";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  renderCheckBox,
  renderTimeInput,
} from "../../utils/formRenders";
import renderImage from "../../utils/renderImage";
import { toast } from "react-toastify";
import LocationPicker from "../LocationPicker";
import categoryService from "../../services/categoryService";
import { categoryKeyMap } from "../../utils/CategoriesMap";
import { inclusionKeyMap } from "../../utils/inclusionsKeyMap";
import { exclusionKeyMap } from "../../utils/exclusionKeyMap";

// ─── Constants ────────────────────────────────────────────────────────────────
const DIFFICULTY_OPTIONS = [
  { id: "easy", name: "easy" },
  { id: "moderate", name: "moderate" },
  { id: "hard", name: "hard" },
  { id: "expert", name: "expert" },
];

const DIFFICULTY_COLORS = {
  easy: "bg-green-100 text-green-700 border-green-200",
  moderate: "bg-amber-100 text-amber-700 border-amber-200",
  hard: "bg-orange-100 text-orange-700 border-orange-200",
  expert: "bg-red-100 text-red-700 border-red-200",
};

const TYPE_META = {
  tour: {
    labelKey: "tourForm.types.tour",
    icon: "🌍",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  excursion: {
    labelKey: "tourForm.types.excursion",
    icon: "🧭",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  activity: {
    labelKey: "tourForm.types.activity",
    icon: "⚡",
    color: "bg-green-100 text-green-700 border-green-200",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getImageSrc = (value) => {
  if (!value) return null;
  if (value instanceof File) return URL.createObjectURL(value);
  if (typeof value === "string") return renderImage(value);
  return null;
};

const getCompletenessFields = (data, itineraryData, activeType, t) => {
  const common = [
    { label: t("tourForm.completeness.title"), done: !!data?.title },
    {
      label: t("tourForm.completeness.description"),
      done: !!data?.description,
    },
    {
      label: t("tourForm.completeness.destination"),
      done: !!data?.destination,
    },
    { label: t("tourForm.completeness.price"), done: !!data?.price },
    { label: t("tourForm.completeness.cover"), done: !!data?.cover_image },
    {
      label: t("tourForm.completeness.gallery"),
      done: (data?.gallery?.length ?? 0) > 0,
    },
  ];
  const byType = {
    tour: [
      {
        label: t("tourForm.completeness.duration"),
        done: !!data?.duration_days,
      },
      {
        label: t("tourForm.completeness.itinerary"),
        done: (itineraryData?.length ?? 0) > 0,
      },
    ],
    excursion: [
      {
        label: t("tourForm.completeness.departure"),
        done: !!data?.departure_time,
      },
      { label: t("tourForm.completeness.return"), done: !!data?.return_time },
      {
        label: t("tourForm.completeness.meetPoint"),
        done: !!data?.meeting_point,
      },
    ],
    activity: [
      {
        label: t("tourForm.completeness.duration"),
        done: !!data?.duration_hours,
      },
      {
        label: t("tourForm.completeness.difficulty"),
        done: !!data?.difficulty_level,
      },
    ],
  };
  return [...common, ...(byType[activeType] ?? [])];
};

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

// ─── Type-specific form sections ──────────────────────────────────────────────
const ExcursionFields = ({ data, errors, handleChange }) => {
  const { t } = useTranslation();
  return (
    <FormSection
      title={t("tourForm.excursionDetails.title")}
      description={t("tourForm.excursionDetails.description")}
      icon='🧭'
    >
      <TwoCol>
        <div>
          {renderTimeInput(
            t("tourForm.excursionDetails.departureTime"),
            "departure_time",
            data,
            errors,
            handleChange,
          )}
        </div>
        <div>
          {renderTimeInput(
            t("tourForm.excursionDetails.returnTime"),
            "return_time",
            data,
            errors,
            handleChange,
          )}
        </div>
      </TwoCol>
      <TwoCol>
        <div>
          {renderInput(
            t("tourForm.excursionDetails.durationHours"),
            "duration_hours",
            data,
            errors,
            handleChange,
            "number",
            false,
          )}
        </div>
        <div>
          {renderInput(
            t("tourForm.excursionDetails.meetingPoint"),
            "meeting_point",
            data,
            errors,
            handleChange,
            "text",
            false,
          )}
        </div>
      </TwoCol>
      <div className='bg-gray-50 rounded-xl px-4 py-3 border border-gray-100'>
        {ToggleSwitcher({
          label: t("tourForm.excursionDetails.guideIncluded"),
          name: "guide_included",
          data,
          errors,
          onChange: handleChange,
          bg_color: "bg-blue-400",
        })}
      </div>
    </FormSection>
  );
};

const ActivityFields = ({ data, errors, handleChange }) => {
  const { t } = useTranslation();
  return (
    <FormSection
      title={t("tourForm.activityDetails.title")}
      description={t("tourForm.activityDetails.description")}
      icon='⚡'
    >
      <TwoCol>
        <div>
          {renderInput(
            t("tourForm.activityDetails.durationHours"),
            "duration_hours",
            data,
            errors,
            handleChange,
            "number",
            false,
          )}
        </div>
        <div>
          {renderSelect(
            t("tourForm.activityDetails.difficultyLevel"),
            "difficulty_level",
            data,
            errors,
            handleChange,
            DIFFICULTY_OPTIONS,
            "name",
            "id",
          )}
        </div>
      </TwoCol>
      <div className='bg-gray-50 rounded-xl px-4 py-3 border border-gray-100'>
        {renderCheckBox(
          t("tourForm.activityDetails.equipmentIncluded"),
          "equipment_included",
          data,
          errors,
          handleChange,
          null,
          null,
          t("tourForm.activityDetails.equipmentIncludedHint"),
        )}
      </div>
    </FormSection>
  );
};

// ─── Type-specific preview blocks ─────────────────────────────────────────────
const ExcursionPreview = ({ data }) => {
  const { t } = useTranslation();
  if (
    !data?.departure_time &&
    !data?.return_time &&
    !data?.meeting_point &&
    !data?.duration_hours
  )
    return null;
  const rows = [
    {
      icon: "🕗",
      label: t("tourForm.preview.departs"),
      value: data?.departure_time,
    },
    {
      icon: "🕕",
      label: t("tourForm.preview.returns"),
      value: data?.return_time,
    },
    {
      icon: "⏱️",
      label: t("tourForm.preview.duration"),
      value: data?.duration_hours ? `${data.duration_hours}h` : null,
    },
    {
      icon: "📍",
      label: t("tourForm.preview.meetAt"),
      value: data?.meeting_point,
    },
    {
      icon: "👤",
      label: t("tourForm.preview.guide"),
      value: data?.guide_included ? t("tourForm.preview.included") : null,
      green: true,
    },
  ].filter((r) => r.value);
  if (!rows.length) return null;
  return (
    <div>
      <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>
        {t("tourForm.preview.excursionInfo")}
      </p>
      <div className='space-y-1.5'>
        {rows.map(({ icon, label, value, green }) => (
          <div key={label} className='flex items-center gap-2 text-xs'>
            <span className='text-base'>{icon}</span>
            <span className='text-gray-500'>{label}</span>
            <span
              className={`font-semibold ml-auto truncate max-w-[120px] ${
                green ? "text-green-600" : "text-gray-700"
              }`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActivityPreview = ({ data }) => {
  const { t } = useTranslation();
  if (!data?.difficulty_level && !data?.duration_hours) return null;
  return (
    <div>
      <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>
        {t("tourForm.preview.activityInfo")}
      </p>
      <div className='space-y-1.5'>
        {data?.duration_hours && (
          <div className='flex items-center gap-2 text-xs'>
            <span className='text-base'>⏱️</span>
            <span className='text-gray-500'>
              {t("tourForm.preview.duration")}
            </span>
            <span className='font-semibold text-gray-700 ml-auto'>
              {data.duration_hours}h
            </span>
          </div>
        )}
        {data?.difficulty_level && (
          <div className='flex items-center gap-2 text-xs'>
            <span className='text-base'>📊</span>
            <span className='text-gray-500'>
              {t("tourForm.preview.difficulty")}
            </span>
            <span
              className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${
                DIFFICULTY_COLORS[data.difficulty_level]
              }`}
            >
              {t(`tourForm.difficulty.${data.difficulty_level}`)}
            </span>
          </div>
        )}
        {data?.equipment_included && (
          <div className='flex items-center gap-2 text-xs'>
            <span className='text-base'>🎒</span>
            <span className='text-gray-500'>
              {t("tourForm.preview.equipment")}
            </span>
            <span className='font-semibold text-green-600 ml-auto'>
              {t("tourForm.preview.included")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Stats row per type ───────────────────────────────────────────────────────
const PreviewStats = ({ data, activeType }) => {
  const { t } = useTranslation();
  const statsByType = {
    tour: [
      {
        label: t("tourForm.stats.days"),
        value: data?.duration_days,
        icon: "📅",
      },
      {
        label: t("tourForm.stats.maxGroup"),
        value: data?.max_group_size,
        icon: "👥",
      },
      {
        label: t("tourForm.stats.perDay"),
        value:
          data?.price && data?.duration_days
            ? `$${Math.round(data.price / data.duration_days)}`
            : null,
        icon: "💰",
      },
    ],
    excursion: [
      {
        label: t("tourForm.stats.hours"),
        value: data?.duration_hours ? `${data.duration_hours}h` : null,
        icon: "⏱️",
      },
      {
        label: t("tourForm.stats.maxGroup"),
        value: data?.max_group_size,
        icon: "👥",
      },
      {
        label: t("tourForm.stats.price"),
        value: data?.price ? `$${Number(data.price).toLocaleString()}` : null,
        icon: "💰",
      },
    ],
    activity: [
      {
        label: t("tourForm.stats.hours"),
        value: data?.duration_hours ? `${data.duration_hours}h` : null,
        icon: "⏱️",
      },
      {
        label: t("tourForm.stats.maxGroup"),
        value: data?.max_group_size,
        icon: "👥",
      },
      {
        label: t("tourForm.stats.difficulty"),
        value: data?.difficulty_level
          ? t(`tourForm.difficulty.${data.difficulty_level}`)
          : null,
        icon: "📊",
      },
    ],
  };

  const stats = statsByType[activeType] ?? statsByType.tour;

  return (
    <div className='grid grid-cols-3 gap-2'>
      {stats.map(({ label, value, icon }) => (
        <div
          key={label}
          className='bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100'
        >
          <p className='text-base'>{icon}</p>
          <p
            className={`text-xs font-bold mt-0.5 capitalize ${
              label === t("tourForm.stats.difficulty") && value
                ? DIFFICULTY_COLORS[data?.difficulty_level]?.split(" ")[1]
                : "text-gray-800"
            }`}
          >
            {value ?? <span className='text-gray-300'>—</span>}
          </p>
          <p className='text-[10px] text-gray-400'>{label}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Live Preview ─────────────────────────────────────────────────────────────
const LivePreview = ({
  data,
  itineraryData,
  isSubmitting,
  validate,
  id,
  Type,
}) => {
  const { t } = useTranslation();
  const activeType = data?.type || Type?.toLowerCase();
  const meta = TYPE_META[activeType] ?? TYPE_META.tour;
  const coverSrc = getImageSrc(data?.cover_image);
  const galleryPreviews = (data?.gallery || [])
    .slice(0, 4)
    .map(getImageSrc)
    .filter(Boolean);
  const fields = getCompletenessFields(data, itineraryData, activeType, t);
  const pct = Math.round(
    (fields.filter((f) => f.done).length / fields.length) * 100,
  );

  return (
    <div className='flex flex-col gap-4'>
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
        {/* Cover */}
        <div className='relative h-52 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden'>
          {coverSrc ? (
            <img
              src={coverSrc}
              alt={t("tourForm.preview.coverAlt")}
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
              <span className='text-xs font-medium'>
                {t("tourForm.preview.noCoverImage")}
              </span>
            </div>
          )}

          <div className='absolute top-3 left-3 flex gap-1.5 flex-wrap'>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}
            >
              {meta.icon} {t(meta.labelKey)}
            </span>
            {data?.is_featured && (
              <span className='bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm'>
                ⭐ {t("tourForm.badges.featured")}
              </span>
            )}
            {data?.is_hot_deal && (
              <span className='bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm'>
                🔥 {t("tourForm.badges.hotDeal")}
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
                {t("tourForm.preview.perPerson")}
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
                  {t("tourForm.preview.titlePlaceholder", {
                    type: t(meta.labelKey),
                  })}
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

          <PreviewStats data={data} activeType={activeType} />

          {activeType === "excursion" && <ExcursionPreview data={data} />}
          {activeType === "activity" && <ActivityPreview data={data} />}

          {galleryPreviews.length > 0 && (
            <div>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>
                {t("tourForm.preview.gallery")} · {data.gallery.length}{" "}
                {data.gallery.length !== 1
                  ? t("tourForm.preview.photos")
                  : t("tourForm.preview.photo")}
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

          {/* Itinerary — tour only */}
          {activeType === "tour" && itineraryData?.length > 0 && (
            <div>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>
                {t("tourForm.preview.itinerary")} · {itineraryData.length}{" "}
                {itineraryData.length !== 1
                  ? t("tourForm.preview.days")
                  : t("tourForm.preview.day")}
              </p>
              <div className='space-y-1.5'>
                {itineraryData.slice(0, 3).map((day, i) => (
                  <div key={i} className='flex items-center gap-2.5 text-xs'>
                    <span className='w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0'>
                      {day.day}
                    </span>
                    <span className='text-gray-600 truncate'>
                      {day.title || t("tourForm.preview.untitledDay")}
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
                    +{itineraryData.length - 3} {t("tourForm.preview.moreDays")}
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
            {t("tourForm.completeness.label")}
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
          text-white shadow-[0_4px_16px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_24px_rgba(245,158,11,0.4)]
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
            {t("tourForm.actions.processing")}
          </>
        ) : id ? (
          t("tourForm.actions.update", { type: Type })
        ) : (
          t("tourForm.actions.publish", { type: Type })
        )}
      </button>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const TourForm = ({ Type }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [cordinates, setCordinates] = useState({
    lat: "",
    lng: "",
  });
  const activeType = Type;

  const [formData, setFormData] = useState({
    title: "",
    destination: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itineraryInitialData, setItineraryInitialData] = useState([]);
  const [itineraryData, setItineraryData] = useState([]);
  const [inclusions, setInclusions] = useState([]);
  const [exclusions, setExclusions] = useState([]);

  /*   const CATEGORIES = [
    { id: 1, name: t("tourForm.categories.adventure") },
    { id: 2, name: t("tourForm.categories.cultural") },
    { id: 3, name: t("tourForm.categories.coastal") },
    { id: 4, name: t("tourForm.categories.historical") },
  ]; */

  const translatedCategories = categories?.map((cat) => ({
    ...cat,
    label: t(`home.categories.${categoryKeyMap[cat?.name] ?? cat?.name}`),
  }));

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await categoryService.getAll({
          is_active: true,
          limit: 100,
        });
        setCategories(categories?.data);
        console.log("Categories: ", categories);
      } catch (error) {
        console.log("Error: ", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    console.log("Cordinates: ", cordinates);
  }, [cordinates]);

  const getSchema = (activeType) => {
    const common = {
      id: Joi.optional(),
      title: Joi.string().max(200).required().label("Title"),
      description: Joi.string().optional().allow("", null).label("Description"),
      destination: Joi.string()
        .max(150)
        .optional()
        .allow("", null)
        .label("Destination"),
      cover_image: Joi.optional(),
      gallery: Joi.optional(),
      price: Joi.number().precision(2).positive().optional().label("Price"),
      max_group_size: Joi.number()
        .integer()
        .positive()
        .optional()
        .label("Max Group Size"),
      is_featured: Joi.boolean().default(false).label("Is Featured"),
      is_hot_deal: Joi.boolean().default(false).label("Is Hot Deal"),
      category_id: Joi.number().required().label("Category"),
      inclusions: Joi.optional().label("Inclusions"),
      exclusions: Joi.optional().label("Exclusions"),
      type: Joi.string().optional().allow("", null).label("Type"),
      created_at: Joi.any(),
      updated_at: Joi.any(),

      // ✅ All type-specific fields allowed in base — overridden per type
      duration_days: Joi.any(),
      departure_time: Joi.any(),
      return_time: Joi.any(),
      meeting_point: Joi.any(),
      guide_included: Joi.any(),
      duration_hours: Joi.any(),
      difficulty_level: Joi.any(),
      equipment_included: Joi.any(),
    };

    const byType = {
      tour: {
        duration_days: Joi.number()
          .positive()
          .optional()
          .label("Duration Days"),
      },
      excursion: {
        departure_time: Joi.string()
          .optional()
          .allow("", null)
          .label("Departure Time"),
        return_time: Joi.string()
          .optional()
          .allow("", null)
          .label("Return Time"),
        meeting_point: Joi.string()
          .max(255)
          .optional()
          .allow("", null)
          .label("Meeting Point"),
        guide_included: Joi.boolean().optional().label("Guide Included"),
        duration_hours: Joi.number()
          .integer()
          .positive()
          .optional()
          .label("Duration Hours"),
      },
      activity: {
        duration_hours: Joi.number()
          .integer()
          .positive()
          .optional()
          .label("Duration Hours"),
        difficulty_level: Joi.string()
          .valid("easy", "moderate", "hard", "expert")
          .optional()
          .allow("", null)
          .label("Difficulty Level"),
        equipment_included: Joi.boolean()
          .optional()
          .label("Equipment Included"),
      },
    };

    return { ...common, ...(byType[activeType] ?? {}) };
  };

  useEffect(() => {
    const fetchOptions = async () => {
      const [inc, exc] = await Promise.all([
        inclusionsService.getAll({ is_active: true, limit: 100 }),
        exclusionsService.getAll({ is_active: true, limit: 100 }),
      ]);
      setInclusions(inc?.data?.map((i) => ({ id: i.id, name: i.text })));
      setExclusions(exc?.data?.map((e) => ({ id: e.id, name: e.text })));
    };
    fetchOptions();
  }, [id]);

  const translatedInclusions = inclusions?.map((inc) => ({
    ...inc,
    label: t(`manageInclusions.inclusions.${inclusionKeyMap[inc?.name]}`),
  }));

  const translatedExclusions = exclusions?.map((exc) => ({
    ...exc,
    label:
      t(`manageExclusions.exclusions.${exclusionKeyMap[exc?.name]}`) ??
      exc.text,
  }));

  useEffect(() => {
    if (!id) return;
    const fetchTour = async () => {
      try {
        setIsLoading(true);
        const tour = await tourService.getById(id);
        setCordinates({
          lat: tour?.lat,
          lng: tour?.lng,
        });
        setFormData({
          id: tour.id,
          type: tour.type,
          title: tour.title,
          description: tour.description,
          destination: tour.destination,
          price: tour.price,
          max_group_size: tour.max_group_size,
          cover_image: tour.cover_image,
          is_featured: tour.is_featured,
          is_hot_deal: tour.is_hot_deal,
          category_id: tour.category_id,
          inclusions: tour.inclusions
            ?.map((i) => parseInt(i.id))
            .filter(Boolean),
          exclusions: tour.exclusions
            ?.map((e) => parseInt(e.id))
            .filter(Boolean),
          gallery: tour.images?.map((img) =>
            typeof img === "object" && img?.url ? img.url : img,
          ),
          ...(tour.type === "tour"
            ? {
                duration_days: tour.duration_days,
              }
            : {}),
          ...(tour.type === "excursion"
            ? {
                duration_hours: tour.duration_hours,
                departure_time: tour.departure_time,
                return_time: tour.return_time,
                meeting_point: tour.meeting_point,
                guide_included: tour.guide_included,
              }
            : {}),
          ...(tour.type === "activity"
            ? {
                duration_hours: tour.duration_hours,
                difficulty_level: tour.difficulty_level,
                equipment_included: tour.equipment_included,
              }
            : {}),
        });

        setItineraryInitialData(
          (tour.itineraries || []).map((i) => ({
            day: i?.day,
            title: i?.title,
            description: i?.description,
            location: i?.location,
            image: i?.image,
          })),
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
      fd.append("type", activeType);
      if (cordinates?.lat && cordinates.lng) {
        fd.append("lng", cordinates?.lng);
        fd.append("lat", cordinates?.lat);
      }

      itineraryData.forEach((day, index) => {
        Object.entries(day).forEach(([key, value]) => {
          if (value instanceof File)
            fd.append(`itinerary[${index}][${key}]`, value);
          else if (value != null)
            fd.append(`itinerary[${index}][${key}]`, String(value));
        });
      });

      id ? await tourService.update(id, fd) : await tourService.create(fd);

      const label =
        activeType[0].toUpperCase() + activeType.slice(1).toLowerCase();

      toast.success(
        id
          ? t("tourForm.toast.updated", { type: label })
          : t("tourForm.toast.created", { type: label }),
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data, errors, handleChange, handleSubmit, validate, getFormData } =
    useForm(formData, getSchema(activeType), doSubmit);

  console.log("Validate: ", validate());

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
          <p className='text-sm text-gray-400 font-medium'>
            {t("tourForm.loading", { type: Type })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50/80'>
      <form onSubmit={handleSubmit} noValidate>
        {/* Sticky header */}
        <div className='bg-white border-b border-gray-100 px-6 py-4 top-0 z-20 shadow-sm'>
          <div className='max-w-7xl mx-auto flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm'>
                <span className='text-base'>
                  {TYPE_META[activeType]?.icon ?? "🌍"}
                </span>
              </div>
              <div>
                <h1 className='text-sm font-bold text-gray-900'>
                  {id
                    ? t("tourForm.header.edit", { type: Type })
                    : t("tourForm.header.new", { type: Type })}
                </h1>
                <p className='text-[11px] text-gray-400'>
                  {id
                    ? t("tourForm.header.editSubtitle", { type: Type })
                    : t("tourForm.header.newSubtitle")}
                </p>
              </div>
            </div>
            {/*
            <button
              type='button'
              className='text-sm text-gray-400 hover:text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium'
            >
              {t("tourForm.actions.cancel")}
            </button>
            */}
          </div>
        </div>

        {/* Two-column layout */}
        <div className='max-w-7xl mx-auto px-4 md:px-6 py-8'>
          <div className='grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start'>
            {/* LEFT — form */}
            <div className='space-y-6 min-w-0'>
              {/* ── Common ── */}
              <FormSection
                title={t("tourForm.sections.basicInfo")}
                description={t("tourForm.sections.basicInfoDesc", {
                  type: Type,
                })}
                icon='📋'
              >
                {renderInput(
                  t("tourForm.fields.title"),
                  "title",
                  data,
                  errors,
                  handleChange,
                  "text",
                  true,
                )}
                {renderTextarea(
                  t("tourForm.fields.description"),
                  "description",
                  data,
                  errors,
                  handleChange,
                )}
                {renderInput(
                  t("tourForm.fields.destination"),
                  "destination",
                  data,
                  errors,
                  handleChange,
                  "text",
                  true,
                )}
              </FormSection>

              <FormSection
                title={t("tourForm.sections.pricingLogistics")}
                description={t("tourForm.sections.pricingLogisticsDesc")}
                icon='💼'
              >
                <TwoCol>
                  <div>
                    {renderInput(
                      t("tourForm.fields.price"),
                      "price",
                      data,
                      errors,
                      handleChange,
                      "number",
                      true,
                    )}
                  </div>
                  {activeType === "tour" ? (
                    <div>
                      {renderInput(
                        t("tourForm.fields.durationDays"),
                        "duration_days",
                        data,
                        errors,
                        handleChange,
                        "number",
                        true,
                      )}
                    </div>
                  ) : (
                    <div>
                      {renderInput(
                        t("tourForm.fields.maxGroupSize"),
                        "max_group_size",
                        data,
                        errors,
                        handleChange,
                        "number",
                        true,
                      )}
                    </div>
                  )}
                </TwoCol>
                {activeType === "tour" ? (
                  <TwoCol>
                    <div>
                      {renderInput(
                        t("tourForm.fields.maxGroupSize"),
                        "max_group_size",
                        data,
                        errors,
                        handleChange,
                        "number",
                        true,
                      )}
                    </div>
                    <div>
                      {renderSelect(
                        t("tourForm.fields.category"),
                        "category_id",
                        data,
                        errors,
                        handleChange,
                        translatedCategories,
                        "label",
                        "id",
                      )}
                    </div>
                  </TwoCol>
                ) : (
                  <div>
                    {renderSelect(
                      t("tourForm.fields.category"),
                      "category_id",
                      data,
                      errors,
                      handleChange,
                      categories,
                      "name",
                      "id",
                    )}
                  </div>
                )}
              </FormSection>

              <FormSection title={t("tourForm.sections.visibility")} icon='🏷️'>
                <div className='flex flex-col sm:flex-row gap-4'>
                  <div className='flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100'>
                    {ToggleSwitcher({
                      label: t("tourForm.fields.featured"),
                      name: "is_featured",
                      data,
                      errors,
                      onChange: handleChange,
                      bg_color: "bg-amber-400",
                    })}
                  </div>
                  <div className='flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100'>
                    {ToggleSwitcher({
                      label: t("tourForm.fields.hotDeal"),
                      name: "is_hot_deal",
                      data,
                      errors,
                      onChange: handleChange,
                      bg_color: "bg-red-400",
                    })}
                  </div>
                </div>
              </FormSection>

              {/* ── Type-specific ── */}
              {activeType === "excursion" && (
                <ExcursionFields
                  data={data}
                  errors={errors}
                  handleChange={handleChange}
                />
              )}
              {activeType === "activity" && (
                <ActivityFields
                  data={data}
                  errors={errors}
                  handleChange={handleChange}
                />
              )}

              {/* ── Common ── */}
              <FormSection
                title={t("tourForm.sections.media")}
                description={t("tourForm.sections.mediaDesc")}
                icon='🖼️'
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>
                      {t("tourForm.fields.coverImage")}
                    </p>
                    {renderImageUpload(
                      t("tourForm.fields.coverImage"),
                      "cover_image",
                      data,
                      errors,
                      handleChange,
                      true,
                      t("tourForm.fields.selectThumbnail"),
                    )}
                  </div>
                  <div>
                    <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2'>
                      {t("tourForm.fields.gallery")}
                    </p>
                    {renderDraggableImages(
                      t("tourForm.fields.gallery"),
                      "gallery",
                      data,
                      errors,
                      handleChange,
                      true,
                      20,
                      t("tourForm.fields.galleryHint"),
                    )}
                  </div>
                </div>
              </FormSection>

              {/* Itinerary — tour only */}
              {activeType === "tour" && (
                <ItinerarySection
                  initialData={itineraryInitialData}
                  onUpdate={(structured) => setItineraryData(structured)}
                />
              )}

              <FormSection
                title={t("tourForm.sections.inclusionsExclusions")}
                description={t("tourForm.sections.inclusionsExclusionsDesc")}
                icon='✅'
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    {renderMultiSelect(
                      t("tourForm.fields.inclusions"),
                      "inclusions",
                      data,
                      errors,
                      handleChange,
                      translatedInclusions,
                      "label",
                      "id",
                      undefined,
                      undefined,
                      true,
                      false,
                      10,
                    )}
                  </div>
                  <div>
                    {renderMultiSelect(
                      t("tourForm.fields.exclusions"),
                      "exclusions",
                      data,
                      errors,
                      handleChange,
                      translatedExclusions,
                      "label",
                      "id",
                      undefined,
                      undefined,
                      true,
                      false,
                      10,
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
                    ? t("tourForm.actions.processing")
                    : id
                      ? t("tourForm.actions.update", { type: Type })
                      : t("tourForm.actions.publish", { type: Type })}
                </button>
              </div>
              <LocationPicker
                onChange={(cords) => setCordinates(cords)}
                initialPosition={cordinates}
              />
            </div>

            {/* RIGHT — sticky preview */}
            <div className='hidden xl:block'>
              <div className='sticky top-24'>
                <div className='flex items-center justify-between mb-3'>
                  <p className='text-[11px] font-bold text-gray-400 uppercase tracking-widest'>
                    {t("tourForm.preview.livePreview")}
                  </p>
                  <span className='inline-flex items-center gap-1.5 text-[10px] text-green-600 font-semibold bg-green-50 border border-green-100 px-2.5 py-1 rounded-full'>
                    <span className='w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse' />
                    {t("tourForm.preview.live")}
                  </span>
                </div>
                <LivePreview
                  data={data}
                  itineraryData={itineraryData}
                  isSubmitting={isSubmitting}
                  validate={validate}
                  id={id}
                  Type={Type}
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
