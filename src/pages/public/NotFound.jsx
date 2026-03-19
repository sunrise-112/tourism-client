// NotFound.jsx
import { useNavigate, Link } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      className='min-h-screen bg-stone-50 flex items-center justify-center px-6 relative overflow-hidden'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Soft background blobs */}
      <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-amber-100 rounded-full blur-[120px] pointer-events-none opacity-60' />
      <div className='absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100 rounded-full blur-[100px] pointer-events-none opacity-60' />

      <div className='relative z-10 text-center max-w-xl'>
        {/* Giant 404 */}
        <div className='relative mb-6 select-none'>
          <p
            className='text-[160px] md:text-[200px] font-black leading-none text-transparent bg-clip-text'
            style={{
              fontFamily: "'Playfair Display', serif",
              backgroundImage: "linear-gradient(135deg, #F59E0B22, #FB923C22)",
              WebkitTextStroke: "2px #F59E0B44",
            }}
          >
            404
          </p>
          {/* Compass icon centered over 404 */}
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-300'>
              <i className='fa fa-compass text-white text-3xl' />
            </div>
          </div>
        </div>

        {/* Code */}
        <p className='text-xs font-bold uppercase tracking-[0.3em] text-amber-500 mb-3'>
          Page Not Found
        </p>

        {/* Heading */}
        <h1
          className='text-4xl md:text-5xl font-black text-stone-800 mb-4 leading-tight'
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Lost in the Desert?
        </h1>

        <p className='text-stone-400 text-base leading-relaxed mb-10 max-w-sm mx-auto'>
          The page you're looking for has vanished like footprints in the
          Sahara. Let's get you back on track.
        </p>

        {/* Actions */}
        <div className='flex items-center justify-center gap-3 flex-wrap mb-10'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-700 border border-stone-200 hover:border-stone-300 bg-white px-6 py-3 rounded-xl transition-all'
          >
            <i className='fa fa-arrow-left text-xs' /> Go Back
          </button>
          <Link
            to='/'
            className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-6 py-3 rounded-xl shadow-lg shadow-amber-200'
          >
            <i className='fa fa-home text-xs' /> Back to Home
          </Link>
        </div>

        {/* Quick links */}
        <div className='flex items-center justify-center gap-2 flex-wrap'>
          <span className='text-xs text-stone-400'>Try visiting:</span>
          {[
            { label: "Tours", to: "/tours" },
            { label: "Login", to: "/login" },
            { label: "Contact", to: "/contact" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className='text-xs font-semibold text-amber-600 hover:text-amber-700 border border-amber-200 hover:border-amber-300 bg-amber-50 px-3 py-1.5 rounded-full transition-colors'
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
