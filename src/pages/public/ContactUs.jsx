// ─── ContactUs.jsx ────────────────────────────────────────────
import { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

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

const ContactUs = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Replace with: await contactService.send(form)
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
    toast.success(t("contactUs.toast.success"));
  };

  // Pre-translated subject options
  const subjectOptions = [
    "General Inquiry",
    "Tour Booking",
    "Custom Itinerary",
    "Group Travel",
    "Cancellation / Refund",
    "Other",
  ];

  const inputClass =
    "w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 transition-all placeholder-stone-300 text-stone-700";

  const labelClass =
    "block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5";

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
                        <div>
                          <label className={labelClass}>
                            {t("contactUs.form.fullName")} *
                          </label>
                          <input
                            name='name'
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder={t(
                              "contactUs.form.fullNamePlaceholder"
                            )}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            {t("contactUs.form.email")} *
                          </label>
                          <input
                            name='email'
                            value={form.email}
                            onChange={handleChange}
                            required
                            type='email'
                            placeholder={t("contactUs.form.emailPlaceholder")}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className='grid md:grid-cols-2 gap-5'>
                        <div>
                          <label className={labelClass}>
                            {t("contactUs.form.phone")}
                          </label>
                          <input
                            name='phone'
                            value={form.phone}
                            onChange={handleChange}
                            placeholder={t("contactUs.form.phonePlaceholder")}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            {t("contactUs.form.subject")} *
                          </label>
                          <select
                            name='subject'
                            value={form.subject}
                            onChange={handleChange}
                            required
                            className={inputClass}
                          >
                            <option value=''>
                              {t("contactUs.form.subjectPlaceholder")}
                            </option>
                            {subjectOptions.map((s) => (
                              <option key={s} value={s}>
                                {t(
                                  `contactUs.subjects.${s.replace(
                                    /[ /]/g,
                                    "_"
                                  )}`,
                                  { defaultValue: s }
                                )}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>
                          {t("contactUs.form.message")} *
                        </label>
                        <textarea
                          name='message'
                          value={form.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          placeholder={t("contactUs.form.messagePlaceholder")}
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      <button
                        type='submit'
                        disabled={submitting}
                        className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 transition-colors px-8 py-3.5 rounded-xl shadow-lg shadow-amber-200'
                      >
                        {submitting ? (
                          <>
                            <i className='fa fa-spinner fa-spin text-xs' />{" "}
                            {t("contactUs.form.sending")}
                          </>
                        ) : (
                          <>
                            <i className='fa fa-paper-plane text-xs' />{" "}
                            {t("contactUs.form.sendButton")}
                          </>
                        )}
                      </button>
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
