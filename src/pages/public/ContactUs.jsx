// ─── ContactUs.jsx ────────────────────────────────────────────
import { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Joi from "joi-browser";

// Services
import InquiriesService from "../../services/inquiriesService";

// Utils
import {
  renderButton,
  renderInput,
  renderSelect,
} from "../../utils/formRenders";

// Hooks
import useForm from "../../hooks/useForm";

const CONTACT_INFO = [
  {
    icon: "fa-map-marker-alt",
    labelKey: "contactUs.info.address.label",
    valueKey: "contactUs.info.address.value",
  },
  {
    icon: "fa-phone-alt",
    labelKey: "contactUs.info.phone.label",
    valueKey: "contactUs.info.phone.value",
  },
  {
    icon: "fa-envelope",
    labelKey: "contactUs.info.email.label",
    valueKey: "contactUs.info.email.value",
  },
  {
    icon: "fa-clock",
    labelKey: "contactUs.info.hours.label",
    valueKey: "contactUs.info.hours.value",
  },
];

const SOCIALS = [
  {
    icon: "fa-facebook-f",
    hover: "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200",
  },
  {
    icon: "fa-instagram",
    hover: "hover:bg-pink-50 hover:text-pink-500 hover:border-pink-200",
  },
  {
    icon: "fa-twitter",
    hover: "hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200",
  },
  {
    icon: "fa-youtube",
    hover: "hover:bg-red-50 hover:text-red-500 hover:border-red-200",
  },
];

const subjectOptions = [
  { label: "General Inquiry" },
  { label: "Tour Booking" },
  { label: "Custom Itinerary" },
  { label: "Group Travel" },
  { label: "Cancellation / Refund" },
  { label: "Other" },
];

// Validation schema

const ContactUs = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const schema = {
    full_name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .regex(/^[0-9+\-\s()]*$/)
      .min(0)
      .max(20)
      .allow(""),
    subject: Joi.string().min(3).max(255).required(),
    message: Joi.string().min(10).max(5000).required(),
  };

  const doSubmit = async () => {
    try {
      setIsSubmitting(true);
      await InquiriesService.create(data);
      toast.success(t("contactUs.toasts.success"));
      setSubmitted(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || t("contactUs.toasts.error"));
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
    <div
      className='min-h-screen bg-stone-50'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── HERO ──────────────────────────────────────────── */}
      <div className='relative bg-[#1C1107] overflow-hidden'>
        <div
          className='absolute inset-0 opacity-[0.04]'
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className='absolute top-0 right-0 w-[400px] h-[350px] bg-amber-600/15 rounded-full blur-[100px] pointer-events-none' />
        <div className='relative z-10 max-w-5xl mx-auto px-6 py-24 text-center'>
          <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-4'>
            {t("contactUs.hero.eyebrow")}
          </p>
          <h1
            className='text-5xl md:text-6xl font-black text-white leading-tight mb-5'
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("contactUs.hero.titleLine1")}
            <br />
            <span
              className='text-transparent bg-clip-text'
              style={{
                backgroundImage: "linear-gradient(135deg, #F59E0B, #FB923C)",
              }}
            >
              {t("contactUs.hero.titleLine2")}
            </span>
          </h1>
          <p className='text-stone-400 text-lg max-w-xl mx-auto'>
            {t("contactUs.hero.subtitle")}
          </p>
        </div>
      </div>

      {/* ── MAIN ──────────────────────────────────────────── */}
      <div className='max-w-6xl mx-auto px-6 py-16'>
        <div className='grid lg:grid-cols-3 gap-10'>
          {/* ── Contact Info ────────────────────────────── */}
          <div className='space-y-5'>
            <div>
              <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-2'>
                {t("contactUs.info.eyebrow")}
              </p>
              <h2
                className='text-2xl font-black text-stone-800'
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {t("contactUs.info.title")}
              </h2>
            </div>

            {CONTACT_INFO.map((info) => (
              <div
                key={info.labelKey}
                className='bg-white rounded-2xl border border-stone-100 p-5 flex items-start gap-4 hover:shadow-md hover:shadow-stone-200/60 transition-all'
              >
                <div className='w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0'>
                  <i className={`fa ${info.icon} text-amber-500 text-sm`} />
                </div>
                <div>
                  <p className='text-xs font-bold uppercase tracking-wide text-stone-400 mb-0.5'>
                    {t(info.labelKey)}
                  </p>
                  <p className='text-sm font-semibold text-stone-700'>
                    {t(info.valueKey)}
                  </p>
                </div>
              </div>
            ))}

            {/* Social links */}
            <div className='bg-white rounded-2xl border border-stone-100 p-5'>
              <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-4'>
                {t("contactUs.social.title")}
              </p>
              <div className='flex gap-2'>
                {SOCIALS.map((s) => (
                  <button
                    key={s.icon}
                    className={`flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-400 text-sm transition-all ${s.hover}`}
                  >
                    <i className={`fab ${s.icon}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Contact Form ─────────────────────────────── */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-xl shadow-stone-200/40'>
              <div className='h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400' />
              <div className='p-8'>
                {submitted ? (
                  <div className='text-center py-16'>
                    <div className='w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5'>
                      <i className='fa fa-check text-amber-500 text-2xl' />
                    </div>
                    <h3
                      className='text-2xl font-black text-stone-800 mb-2'
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {t("contactUs.form.successTitle")}
                    </h3>
                    <p className='text-stone-400 text-sm mb-6 max-w-sm mx-auto'>
                      {t("contactUs.form.successMessage")}
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className='text-sm font-semibold text-amber-600 hover:text-amber-700 border border-amber-200 hover:bg-amber-50 px-6 py-2.5 rounded-xl transition-colors'
                    >
                      {t("contactUs.form.sendAnother")}
                    </button>
                  </div>
                ) : (
                  <>
                    <h3
                      className='text-xl font-black text-stone-800 mb-1'
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {t("contactUs.form.title")}
                    </h3>
                    <p className='text-sm text-stone-400 mb-7'>
                      {t("contactUs.form.subtitle")}
                    </p>

                    <form onSubmit={handleSubmit} className='space-y-5'>
                      <div className='grid md:grid-cols-2 gap-5'>
                        {renderInput(
                          t("contactUs.form.fullName"),
                          "full_name",
                          data,
                          errors,
                          handleChange,
                          "text"
                        )}
                        {renderInput(
                          t("contactUs.form.email"),
                          "email",
                          data,
                          errors,
                          handleChange,
                          "email"
                        )}
                      </div>

                      <div className='grid md:grid-cols-2 gap-5'>
                        {renderInput(
                          t("contactUs.form.phone"),
                          "phone",
                          data,
                          errors,
                          handleChange,
                          "tel"
                        )}
                        {renderSelect(
                          t("contactUs.form.subject"),
                          "subject",
                          data,
                          errors,
                          handleChange,
                          subjectOptions,
                          "label",
                          "label"
                        )}
                      </div>

                      {renderInput(
                        t("contactUs.form.message"),
                        "message",
                        data,
                        errors,
                        handleChange,
                        "textarea"
                      )}

                      {renderButton(
                        t("contactUs.form.sendButton"),
                        "submit",
                        validate(),
                        isSubmitting
                      )}

                      {/* <button
                        type='submit'
                        className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 transition-colors px-8 py-3.5 rounded-xl shadow-lg shadow-amber-200'
                      >
                        <i className='fa fa-paper-plane text-xs' /> {}
                      </button> */}
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── MAP ───────────────────────────────────────── */}
        <div className='mt-12'>
          <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm'>
            <iframe
              title={t("contactUs.map.title")}
              width='100%'
              height='380'
              style={{ border: 0 }}
              loading='lazy'
              allowFullScreen
              src='https://maps.google.com/maps?q=Marrakech+Medina,+Morocco&output=embed'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
