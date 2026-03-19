export const SkeletonGrid = () => (
  <div className='bg-white rounded-2xl overflow-hidden border border-stone-100 animate-pulse'>
    <div className='h-52 bg-stone-100' />
    <div className='p-5 space-y-3'>
      <div className='h-3 bg-stone-100 rounded w-1/3' />
      <div className='h-4 bg-stone-100 rounded w-3/4' />
      <div className='h-3 bg-stone-100 rounded w-full' />
      <div className='h-3 bg-stone-100 rounded w-2/3' />
    </div>
  </div>
);

export const SkeletonList = () => (
  <div className='bg-white rounded-2xl overflow-hidden border border-stone-100 animate-pulse flex h-44'>
    <div className='w-56 shrink-0 bg-stone-100' />
    <div className='flex-1 p-5 space-y-3'>
      <div className='h-3 bg-stone-100 rounded w-1/4' />
      <div className='h-5 bg-stone-100 rounded w-2/3' />
      <div className='h-3 bg-stone-100 rounded w-full' />
      <div className='h-3 bg-stone-100 rounded w-3/4' />
    </div>
  </div>
);
