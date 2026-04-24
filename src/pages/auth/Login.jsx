import { useState } from "react";
import { toast } from "react-toastify";
import Joi from "joi-browser";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
// Services
import authService from "../../services/authService";
// Hooks
import useForm from "../../hooks/useForm";
// Utils
import { renderInput, renderButton } from "../../utils/formRenders";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmtting, setIsSubmitting] = useState(false);
  const [formData] = useState({ email: "", password: "" });

  const schema = {
    email: Joi.string().email().required().label(t("login.schema.email")),
    password: Joi.string()
      .min(8)
      .max(1024)
      .required()
      .label(t("login.schema.password")),
  };

  const doSubmit = async () => {
    if (isSubmtting) return;
    try {
      setIsSubmitting(true);
      const result = await authService.login(data);
      toast.success(result?.data.message);
      setTimeout(() => (window.location.href = "/"), 1400);
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
      {/* Card */}
      <div className='w-full max-w-md bg-white rounded-2xl shadow-xl shadow-amber-200/60 overflow-hidden'>
        {/* Top accent bar */}
        <div className='h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400' />

        <div className='px-8 py-10'>
          {/* Header */}
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
                  d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064'
                />
              </svg>
            </div>
            <h1 className='text-2xl font-bold text-gray-800'>
              {t("login.welcomeBack")}
            </h1>
            <p className='text-gray-400 text-sm mt-1'>
              {t("login.signInPrompt")}
            </p>
          </div>

          {/* Form — renderInput & renderButton untouched */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {renderInput(
              t("login.email"),
              "email",
              data,
              errors,
              handleChange,
              "email",
              true
            )}
            {renderInput(
              t("login.password"),
              "password",
              data,
              errors,
              handleChange,
              "password",
              true
            )}

            <div className='pt-2'>
              {renderButton(
                t("login.loginButton"),
                "login",
                validate,
                isSubmtting,
                undefined,
                "submit"
              )}
            </div>
          </form>

          {/* Footer */}
          <p className='text-center text-sm text-gray-400 mt-6'>
            <Link
              to='/forgot-password'
              className='text-orange-500 hover:text-orange-600 font-medium transition-colors hover:underline'
            >
              {t("login.forgotPassword")}
            </Link>
            <span className='mx-2'>•</span>
            <button className=''>
              {t("login.noAccount")}{" "}
              <Link to={"/register"} className='text-orange-500 underline'>
                {t("login.createOne")}
              </Link>
            </button>
            {"  "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
