import { useState } from "react";
import { toast } from "react-toastify";
import Joi from "joi-browser";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
// Services
import authService from "../../services/authService";
// Hooks
import useForm from "../../hooks/useForm";
// Utils
import { renderInput, renderButton } from "../../utils/formRenders";

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmtting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    nationality: "",
  });

  const schema = {
    name: Joi.string().max(100).required().label(t("register.schema.name")),
    email: Joi.string()
      .email()
      .max(150)
      .required()
      .label(t("register.schema.email")),
    password: Joi.string()
      .min(8)
      .max(255)
      .required()
      .label(t("register.schema.password")),
    phone: Joi.string().max(20).label(t("register.schema.phone")),
    nationality: Joi.string().max(100).label(t("register.schema.nationality")),
  };

  const doSubmit = async () => {
    if (isSubmtting) return;
    try {
      setIsSubmitting(true);
      const result = await authService.register(data);
      setSuccessMessage(result?.data?.message);
      toast.success(result?.data?.message);
      setTimeout(() => navigate("/login"), 1400);
    } catch (error) {
      console.log("Error response: ", error.response?.data.message);
      toast.error(error.response?.data.message);
    } finally {
      setIsSubmitting(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        nationality: "",
      });
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
                  d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
                />
              </svg>
            </div>
            <h1 className='text-2xl font-bold text-gray-800'>
              {t("register.createAccount")}
            </h1>
            <p className='text-gray-400 text-sm mt-1'>
              {t("register.joinPrompt")}
            </p>
          </div>
          {successMessage && (
            <div className='bg-green-500 text-white font-bold'>
              {successMessage}
            </div>
          )}
          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {renderInput(
              t("register.name"),
              "name",
              data,
              errors,
              handleChange,
              "text",
              true
            )}
            {renderInput(
              t("register.email"),
              "email",
              data,
              errors,
              handleChange,
              "email",
              true
            )}
            {renderInput(
              t("register.password"),
              "password",
              data,
              errors,
              handleChange,
              "password"
            )}
            {renderInput(
              t("register.phone"),
              "phone",
              data,
              errors,
              handleChange
            )}
            {renderInput(
              t("register.nationality"),
              "nationality",
              data,
              errors,
              handleChange
            )}
            <div className='pt-2'>
              {renderButton(
                t("register.createButton"),
                "register",
                validate,
                isSubmtting,
                undefined,
                "submit"
              )}
            </div>
          </form>

          {/* Footer */}
          <p className='text-center text-sm text-gray-400 mt-6'>
            {t("register.haveAccount")}{" "}
            <button
              type='button'
              onClick={() => navigate("/login")}
              className='text-orange-500 hover:text-orange-600 font-medium transition-colors'
            >
              {t("register.signIn")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
