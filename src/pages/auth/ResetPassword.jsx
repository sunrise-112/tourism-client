import { useState } from "react";
import { toast } from "react-toastify";
import Joi from "joi-browser";
import { useNavigate, useParams } from "react-router-dom";
import authService from "../../services/authService";
import useForm from "../../hooks/useForm";
import { renderInput, renderButton } from "../../utils/formRenders";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [isSubmtting, setIsSubmitting] = useState(false);
  const [formData] = useState({ password: "", confirmPassword: "" });

  const schema = {
    password: Joi.string().min(8).max(255).required().label("New Password"),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .label("Confirm Password")
      .options({ language: { any: { allowOnly: "must match password" } } }),
  };

  const doSubmit = async () => {
    if (isSubmtting) return;
    try {
      setIsSubmitting(true);
      const result = await authService.resetPassword(token, data);
      toast.success(result?.data.message);
      setTimeout(() => navigate("/login"), 1400);
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
                  d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                />
              </svg>
            </div>
            <h1 className='text-2xl font-bold text-gray-800'>
              Set new password
            </h1>
            <p className='text-gray-400 text-sm mt-1'>
              Must be at least 8 characters
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {renderInput(
              "New Password",
              "password",
              data,
              errors,
              handleChange,
              "password",
              true
            )}
            {renderInput(
              "Confirm Password",
              "confirmPassword",
              data,
              errors,
              handleChange,
              "password",
              true
            )}
            <div className='pt-2'>
              {renderButton(
                "Reset Password",
                "reset-password",
                validate,
                isSubmtting,
                undefined,
                "submit"
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
