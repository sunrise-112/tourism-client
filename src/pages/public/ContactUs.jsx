// ─── ContactUs.jsx ────────────────────────────────────────────
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Joi from "joi-browser";

// Services
import InquiriesService from "../../services/inquiriesService";
import settingsService from "../../services/adminSettings";

// Utils
import {
  renderButton,
  renderInput,
  renderSelect,
  renderTextarea,
} from "../../utils/formRenders";

// Hooks
import useForm from "../../hooks/useForm";
import LocationViewer from "../../components/LocationViewer";

// Static contact info structure (values will be replaced dynamically)
const CONTACT_INFO_TEMPLATE = [
  {
    icon: "fa-map-marker-alt",
    labelKey: "contactUs.info.address.label",
    valueKey: "address", // will come from settings
  },
  {
    icon: "fa-phone-alt",
    labelKey: "contactUs.info.phone.label",
    valueKey: "company_phone",
  },
  {
    icon: "fa-envelope",
    labelKey: "contactUs.info.email.label",
    valueKey: "email", // static fallback; you can add an email field in settings if needed
  },
  {
    icon: "fa-clock",
    labelKey: "contactUs.info.hours.label",
    valueKey: "opening_hours",
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

  // Admin settings state
  const [adminSettings, setAdminSettings] = useState({
    company_name: "",
    address: "",
    company_phone: "",
    opening_hours: "",
    facebook_url: "",
    instagram_url: "",
    youtube_url: "",
    twitter_url: "",
    lat: null,
    lng: null,
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Fetch admin settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsService.get();
        setAdminSettings({
          company_name: response.company_name || "",
          address: response.address || "",
          company_phone: response.company_phone || "",
          opening_hours: response.opening_hours || "",
          facebook_url: response.facebook_url || "",
          instagram_url: response.instagram_url || "",
          youtube_url: response.youtube_url || "",
          twitter_url: response.twitter_url || "",
          lat: response.lat || null,
          lng: response.lng || null,
        });
      } catch (error) {
        console.error("Error fetching admin settings:", error);
        toast.error(t("contactUs.errors.settingsLoadFailed"));
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, [t]);

  // Prepare dynamic contact info items
  const contactInfoItems = CONTACT_INFO_TEMPLATE.map((item) => {
    let value;
    if (item.valueKey === "email") {
      // Fallback email – replace with a real admin email if available in settings
      value = t("contactUs.info.email.value");
    } else {
      value =
        adminSettings[item.valueKey] ||
        t(`contactUs.info.${item.valueKey}.fallback`);
    }
    return { ...item, value };
  });

  // Prepare social links – only show if URL exists
  const socialLinks = [
    {
      icon: "fa-facebook-f",
      url: adminSettings.facebook_url,
      hover: "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200",
    },
    {
      icon: "fa-instagram",
      url: adminSettings.instagram_url,
      hover: "hover:bg-pink-50 hover:text-pink-500 hover:border-pink-200",
    },
    {
      icon: "fa-twitter",
      url: adminSettings.twitter_url,
      hover: "hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200",
    },
    {
      icon: "fa-youtube",
      url: adminSettings.youtube_url,
      hover: "hover:bg-red-50 hover:text-red-500 hover:border-red-200",
    },
  ].filter((social) => social.url); // only show if URL exists

  // Validation schema
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

            {contactInfoItems.map((info) => (
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
                    {info.value || t("contactUs.info.notAvailable")}
                  </p>
                </div>
              </div>
            ))}

            {/* Social links – only if at least one URL exists */}
            {socialLinks.length > 0 && (
              <div className='bg-white rounded-2xl border border-stone-100 p-5'>
                <p className='text-xs font-bold uppercase tracking-widest text-stone-400 mb-4'>
                  {t("contactUs.social.title")}
                </p>
                <div className='flex gap-2'>
                  {socialLinks.map((social) => (
                    <a
                      key={social.icon}
                      href={social.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className={`flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-400 text-sm transition-all text-center ${social.hover}`}
                    >
                      <i className={`fab ${social.icon}`} />
                    </a>
                  ))}
                </div>
              </div>
            )}
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

                      {renderTextarea(
                        t("contactUs.form.message"),
                        "message",
                        data,
                        errors,
                        handleChange,
                        "textarea",
                        5
                      )}

                      {renderButton(
                        t("contactUs.form.sendButton"),
                        "submit",
                        validate(),
                        isSubmitting
                      )}
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
            {/* Pass coordinates to LocationViewer to avoid extra API call */}
            <LocationViewer
              isPublic={true}
              initialLocation={
                adminSettings.lat && adminSettings.lng
                  ? { lat: adminSettings.lat, lng: adminSettings.lng }
                  : null
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
