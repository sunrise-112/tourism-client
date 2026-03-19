import { useState } from "react";
import { toast } from "react-toastify";
import Joi from "joi-browser";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import useForm from "../../hooks/useForm";
import { renderInput, renderButton } from "../../utils/formRenders";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isSubmtting, setIsSubmitting] = useState(false);
  const [formData] = useState({ email: "" });

  const schema = {
    email: Joi.string().email().required().label("Email"),
  };

  const doSubmit = async () => {
    if (isSubmtting) return;
    try {
      setIsSubmitting(true);
      const result = await authService.forgotPassword(data);
      toast.success(result?.data.message);
    } catch (error) {
      console.log("Error response: ", error.response);
      toast.error(error.response?.data.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data, errors, handleChange, handleSubmit, validate } = useForm(
    formData,
    schema,
    doSubmit
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center px-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-xl shadow-amber-200/60 overflow-hidden'>
        <div className='h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400' />

        <div className='px-8 py-10'>
          <div className='mb-8 text-center'>
            <div className='inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-300/40 mb-4'>
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
                  d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
                />
              </svg>
            </div>
            <h1 className='text-2xl font-bold text-gray-800'>
              Forgot password?
            </h1>
            <p className='text-gray-400 text-sm mt-1'>
              Enter your email and we'll send you a reset link
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {renderInput(
              "Email",
              "email",
              data,
              errors,
              handleChange,
              "email",
              true
            )}
            <div className='pt-2'>
              {renderButton(
                "Send Reset Link",
                "forgot-password",
                validate,
                isSubmtting,
                undefined,
                "submit"
              )}
            </div>
          </form>

          <p className='text-center text-sm text-gray-400 mt-6'>
            Remembered it?{" "}
            <button
              type='button'
              onClick={() => navigate("/login")}
              className='text-orange-500 hover:text-orange-600 font-medium transition-colors'
            >
              Back to login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
