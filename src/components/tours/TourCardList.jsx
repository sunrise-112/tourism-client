import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import renderImage from "../../utils/renderImage";

export default ({ tour }) => {
  const { t } = useTranslation();

  return (
    <Link
      to={`/tours/${tour.id}`}
      className='group bg-white rounded-2xl overflow-hidden border border-stone-100
        hover:shadow-xl hover:shadow-amber-900/8 hover:-translate-y-0.5 transition-all duration-300
        flex flex-col sm:flex-row' // ✅ stack vertically on mobile
    >
      {/* ── Image ── */}
      <div className='relative w-full h-48 sm:w-48 md:w-56 sm:h-auto shrink-0 overflow-hidden bg-stone-100'>
        {tour.cover_image ? (
          <img
            src={renderImage(tour.cover_image)}
            alt={tour.title}
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-stone-300'>
            <i className='fa fa-image text-3xl' />
          </div>
        )}
        <div className='absolute top-3 left-3 flex flex-col gap-1.5'>
          {tour.is_hot_deal && (
            <span className='flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white'>
              <i className='fa fa-fire text-[10px]' />{" "}
              {t("tourCardHorizontal.hotDeal")}
            </span>
          )}
          {tour.is_featured && (
            <span className='flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-amber-900'>
              <i className='fa fa-star text-[10px]' />{" "}
              {t("tourCardHorizontal.featured")}
            </span>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className='flex flex-col justify-between p-4 sm:p-5 flex-1 min-w-0'>
        <div>
          {/* Destination + Duration */}
          <div className='flex items-center justify-between mb-1.5 gap-2'>
            <p className='text-xs text-amber-600 font-semibold flex items-center gap-1 uppercase tracking-wide truncate'>
              <i className='fa fa-map-marker-alt shrink-0' /> {tour.destination}
            </p>
            <span className='flex items-center gap-1 text-xs text-stone-400 shrink-0'>
              <i className='fa fa-clock text-[10px]' /> {tour.duration_days}{" "}
              {t("tourCardHorizontal.days")}
            </span>
          </div>

          {/* Title */}
          <h3 className='font-bold text-base sm:text-lg text-stone-800 group-hover:text-amber-700 transition-colors line-clamp-1 mb-2'>
            {tour.title}
          </h3>

          {/* Description */}
          <p className='text-sm text-stone-400 line-clamp-2 leading-relaxed'>
            {tour.description}
          </p>
        </div>

        {/* ── Footer ── */}
        <div className='flex flex-col xs:flex-row items-start xs:items-center justify-between pt-4 mt-4 border-t border-stone-100 gap-3 sm:gap-0'>
          {/* Price */}
          <div>
            <span className='text-xs text-stone-400 block'>
              {t("tourCardHorizontal.from")}
            </span>
            <p className='text-xl sm:text-2xl font-black text-amber-600'>
              ${tour.price}
            </p>
          </div>

          {/* Meta + CTA */}
          <div className='flex items-center gap-2 sm:gap-3 flex-wrap'>
            {tour.max_group_size && (
              <span className='flex items-center gap-1 text-xs text-stone-400'>
                <i className='fa fa-users' /> {t("tourCardHorizontal.max")}{" "}
                {tour.max_group_size}
              </span>
            )}
            {tour.category && (
              <span className='hidden sm:inline px-2.5 py-1 bg-stone-100 text-stone-500 rounded-full font-medium capitalize text-xs'>
                {tour.category}
              </span>
            )}
            <span className='flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 sm:px-4 py-2 rounded-xl transition-colors whitespace-nowrap'>
              {t("tourCardHorizontal.explore")}{" "}
              <i className='fa fa-arrow-right text-xs' />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
