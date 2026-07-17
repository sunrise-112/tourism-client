import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import authService from "../../services/authService";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [status, setStatus] = useState("loading");

  const verify = async () => {
    setTimeout(async () => {
      if (!token) {
        setStatus("error");
        toast.error("No verification token provided.");
        return;
      }

      try {
        const result = await authService.verifyEmail(token);
        toast.success(result?.data.message);
        setStatus("success");
      } catch (error) {
        console.error("Verification error:", error.response);
        toast.error(error.response?.data.message || "Verification failed");
        setStatus("error");
      }
    }, 1000);
  };

  useEffect(() => {
    verify();
  }, [token]);

  // Auto‑redirect after successful verification
  useEffect(() => {
    if (status === "success") {
      const timeout = setTimeout(() => {
        navigate("/login");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [status, navigate]);

  const states = {
    loading: {
      icon: (
        <svg
          className='w-6 h-6 text-white animate-spin'
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
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
          />
        </svg>
      ),
      iconBg: "from-orange-400 to-orange-600",
      title: "Verifying your email...",
      subtitle: "Please wait a moment",
    },
    success: {
      icon: (
        <svg
          className='w-6 h-6 text-white'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M5 13l4 4L19 7'
          />
        </svg>
      ),
      iconBg: "from-green-400 to-emerald-500",
      title: "Email verified!",
      subtitle: "Redirecting you to login...",
    },
    error: {
      icon: (
        <svg
          className='w-6 h-6 text-white'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M6 18L18 6M6 6l12 12'
          />
        </svg>
      ),
      iconBg: "from-rose-400 to-red-500",
      title: "Verification failed",
      subtitle: "This link may be invalid or expired",
    },
  };

  const current = states[status];

  return (
    <div className='min-h-screen bg-stone-50 flex items-center justify-center px-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-xl shadow-stone-200/60 overflow-hidden'>
        {/* Top accent bar - warm desert gradient */}
        <div className='h-1.5 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500' />

        <div className='px-8 py-12 text-center'>
          <div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${current.iconBg} shadow-lg mb-5`}
          >
            {current.icon}
          </div>
          <h1 className='text-2xl font-bold text-stone-800'>{current.title}</h1>
          <p className='text-stone-400 text-sm mt-2'>{current.subtitle}</p>

          {status === "error" && (
            <button
              type='button'
              onClick={() => navigate("/login")}
              className='mt-8 px-6 py-2.5 rounded-xl text-sm font-medium text-orange-500 border border-orange-200 hover:bg-orange-50 transition-colors'
            >
              Back to login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
