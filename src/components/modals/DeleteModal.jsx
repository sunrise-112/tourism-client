export default ({ title, message, onConfirm, onClose, loading }) => (
  <div className='fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm'>
    <div className='bg-white rounded-2xl border border-stone-100 shadow-2xl w-full max-w-sm overflow-hidden'>
      <div className='h-1 bg-gradient-to-r from-red-400 to-rose-500' />
      <div className='p-6'>
        <div className='w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4'>
          <i className='fa fa-exclamation-triangle text-red-500' />
        </div>
        <h3
          className='font-black text-stone-800 text-lg mb-1'
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </h3>
        <p className='text-sm text-stone-500 mb-6'>{message}</p>
        <div className='flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className='flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition-colors'
          >
            {loading ? (
              <>
                <i className='fa fa-spinner fa-spin mr-1.5' />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);
