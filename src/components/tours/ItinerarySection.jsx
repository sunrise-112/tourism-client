import { useState } from "react";
import {
  renderInput,
  renderTextarea,
  renderImageUpload,
} from "../../utils/formRenders";
import useItinerary from "../../hooks/useItinerary";

import TwoCol from "../../common/TwoCol";


const ItineraryDay = ({ day, index, onRemove, onFieldChange }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className='relative bg-gray-50 border border-gray-200 rounded-xl overflow-hidden'>
      {/* ── Header (always visible) ── */}
      <div className='flex items-center justify-between px-5 py-3'>
        <div className='flex items-center gap-3'>
          {/* Collapse toggle */}
          <button
            type='button'
            onClick={() => setCollapsed((c) => !c)}
            className='w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors duration-150'
          >
            <svg
              className={`w-3.5 h-3.5 cursor-pointer transition-transform duration-200 ${
                collapsed ? "-rotate-90" : ""
              }`}
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2.5}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </button>

          {/* Day badge */}
          <span className='inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full border border-amber-100'>
            <span className='w-4 h-4 bg-amber-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold'>
              {index + 1}
            </span>
            Day {index + 1}
          </span>

          {/* Show title preview when collapsed */}
          {collapsed && day.title && (
            <span className='text-xs text-gray-400 truncate max-w-[160px]'>
              {day.title}
            </span>
          )}
        </div>

        <button
          type='button'
          onClick={onRemove}
          className='text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors duration-150 font-medium'
        >
          ✕ Remove
        </button>
      </div>

      {/* ── Collapsible body ── */}
      <div
        className={`transition-all duration-200 ease-in-out ${
          collapsed ? "h-0 overflow-hidden" : "border-t border-gray-200"
        }`}
      >
        <div className='p-5 space-y-4'>
          <TwoCol>
            <div>
              {renderInput(
                "Title",
                `itin_title_${index}`,
                { [`itin_title_${index}`]: day.title },
                {},
                onFieldChange(index, "title"),
                "text",
                true
              )}
            </div>
            <div>
              {renderInput(
                "Location",
                `itin_location_${index}`,
                { [`itin_location_${index}`]: day.location },
                {},
                onFieldChange(index, "location"),
                "text",
                false
              )}
            </div>
          </TwoCol>

          {renderTextarea(
            "Description",
            `itin_description_${index}`,
            { [`itin_description_${index}`]: day.description },
            {},
            onFieldChange(index, "description")
          )}

          {renderImageUpload(
            "Day Image",
            `itin_image_${index}`,
            { [`itin_image_${index}`]: day.image },
            {},
            onFieldChange(index, "image"),
            false,
            "Select day image"
          )}
        </div>
      </div>
    </div>
  );
};

const ItinerarySection = ({ onUpdate, initialData = [] }) => {
  const { itinerary, addDay, removeDay, updateField, getItinerary } =
    useItinerary(initialData);

  const handleFieldChange = (index, field) => (e) => {
    updateField(index, field)(e);
    const updated = itinerary.map((day, i) => ({
      day: i + 1,
      ...day,
      [field]: field === "image" ? e.target.files?.[0] || null : e.target.value,
    }));
    onUpdate(updated);
  };

  const handleAdd = () => {
    addDay();
    onUpdate([
      ...getItinerary(),
      {
        day: itinerary.length + 1,
        title: "",
        location: "",
        description: "",
        image: null,
      },
    ]);
  };

  const handleRemove = (index) => {
    removeDay(index);
    onUpdate(
      itinerary
        .filter((_, i) => i !== index)
        .map((day, i) => ({ day: i + 1, ...day }))
    );
  };

  return (
    <div className='bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between'>
        <div>
          <h2 className='text-sm font-semibold text-gray-800 tracking-wide uppercase'>
            Itinerary
          </h2>
          <p className='text-xs text-gray-400 mt-0.5'>
            Day-by-day tour schedule
          </p>
        </div>
        <button
          type='button'
          onClick={handleAdd}
          className='inline-flex items-center gap-1.5 cursor-pointer bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-150 shadow-sm'
        >
          <span className='text-base leading-none'>+</span> Add Day
        </button>
      </div>

      <div className='p-6 space-y-4'>
        {itinerary.length === 0 ? (
          <div className='text-center py-10 border-2 border-dashed border-gray-200 rounded-xl'>
            <p className='text-2xl mb-2'>🗺️</p>
            <p className='text-sm text-gray-400 font-medium'>
              No days added yet
            </p>
            <p className='text-xs text-gray-300 mt-1'>
              Click "+ Add Day" to build the itinerary
            </p>
          </div>
        ) : (
          itinerary.map((day, index) => (
            <ItineraryDay
              key={index}
              day={day}
              index={index}
              onRemove={() => handleRemove(index)}
              onFieldChange={handleFieldChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ItinerarySection;
