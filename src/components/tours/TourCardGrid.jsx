import { Link } from "react-router-dom";

export default ({ tour }) => (
  <Link
    to={`/tours/${tour.id}`}
    className='group bg-white rounded-2xl overflow-hidden border border-stone-100
      hover:shadow-2xl hover:shadow-amber-900/10 hover:-translate-y-1.5 transition-all duration-300'
  >
    <div className='relative h-52 overflow-hidden bg-stone-100'>
      {tour.cover_image ? (
        <img
          src={`${import.meta.env.VITE_BACKEND_URL}${tour.cover_image}`}
          alt={tour.title}
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
        />
      ) : (
        <div className='w-full h-full flex items-center justify-center text-stone-300'>
          <i className='fa fa-image text-4xl' />
        </div>
      )}
      <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent' />
      <div className='absolute top-3 left-3 flex gap-1.5'>
        {tour.is_hot_deal && (
          <span className='flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white'>
            <i className='fa fa-fire text-[10px]' /> Hot Deal
          </span>
        )}
        {tour.is_featured && (
          <span className='flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-amber-900'>
            <i className='fa fa-star text-[10px]' /> Featured
          </span>
        )}
      </div>
      <div className='absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1'>
        <i className='fa fa-clock text-[10px]' /> {tour.duration_days}d
      </div>
    </div>
    <div className='p-5'>
      <p className='text-xs text-amber-600 font-semibold flex items-center gap-1 mb-1.5 uppercase tracking-wide'>
        <i className='fa fa-map-marker-alt' /> {tour.destination}
      </p>
      <h3 className='font-bold text-base text-stone-800 group-hover:text-amber-700 transition-colors line-clamp-1 mb-2'>
        {tour.title}
      </h3>
      <p className='text-sm text-stone-400 line-clamp-2 mb-4 leading-relaxed'>
        {tour.description}
      </p>
      <div className='flex items-center justify-between pt-3 border-t border-stone-100'>
        <div>
          <span className='text-xs text-stone-400 block'>From</span>
          <p className='text-xl font-black text-amber-600'>${tour.price}</p>
        </div>
        <span className='flex items-center gap-1.5 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-xl transition-colors'>
          Explore <i className='fa fa-arrow-right text-xs' />
        </span>
      </div>
    </div>
  </Link>
);
