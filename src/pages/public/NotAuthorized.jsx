// NotAuthorized.jsx
import { useNavigate } from "react-router-dom";

const NotAuthorized = () => {
  const navigate = useNavigate();

  return (
    <div
      className='min-h-screen bg-[#1C1107] flex items-center justify-center px-6 relative overflow-hidden'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Ambient glows */}
      <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/15 rounded-full blur-[120px] pointer-events-none' />
      <div className='absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-800/15 rounded-full blur-[100px] pointer-events-none' />

      {/* Dot texture */}
      <div
        className='absolute inset-0 opacity-[0.04]'
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className='relative z-10 text-center max-w-lg'>
        {/* Icon */}
        <div className='inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/20 mb-8 mx-auto'>
          <i className='fa fa-lock text-4xl text-amber-400' />
        </div>

        {/* Code */}
        <p className='text-xs font-bold uppercase tracking-[0.3em] text-amber-500 mb-3'>
          Error 403
        </p>

        {/* Heading */}
        <h1
          className='text-5xl md:text-6xl font-black text-white mb-4 leading-tight'
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Access Denied
        </h1>

        <p className='text-stone-400 text-base leading-relaxed mb-10 max-w-sm mx-auto'>
          You don't have permission to view this page. Please contact your
          administrator or sign in with the correct account.
        </p>

        {/* Actions */}
        <div className='flex items-center justify-center gap-3 flex-wrap'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center gap-2 text-sm font-semibold text-stone-300 hover:text-white border border-white/10 hover:border-white/25 px-6 py-3 rounded-xl transition-all'
          >
            <i className='fa fa-arrow-left text-xs' /> Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-6 py-3 rounded-xl shadow-lg shadow-amber-900/30'
          >
            <i className='fa fa-home text-xs' /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotAuthorized;
