import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BookingSuccess = ({ onDashboard, onHome }) => {
  const { t } = useTranslation();

  const [user, setUser] = useState();

  useEffect(() => {
    userService
      .getMe()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="min-h-screen py-8 px-5 bg-[#f5f4ef] font-['DM_Sans',sans-serif]">
      <div className='max-w-2xl mx-auto flex flex-col gap-3.5'>
        {/* ── Hero card ── */}
        <div
          className='relative text-center rounded-2xl overflow-hidden animate-[fadeUp_0.55s_ease_both]'
          style={{
            background: "linear-gradient(135deg,#1C1107,#2e1d0c)",
            padding: "40px 36px 36px",
          }}
        >
          {/* decorative glows */}
          <div
            className='absolute top-0 right-0 w-64 h-48 pointer-events-none'
            style={{
              background:
                "radial-gradient(circle at top right, rgba(245,158,11,0.18), transparent 65%)",
            }}
          />
          <div
            className='absolute top-0 left-[20%] right-[20%] h-px'
            style={{
              background:
                "linear-gradient(90deg, transparent, #F59E0B66, transparent)",
            }}
          />

          {/* animated checkmark circle */}
          <div className='flex justify-center mb-5'>
            <div
              className='relative flex items-center justify-center rounded-full'
              style={{
                width: 64,
                height: 64,
                border: "1px solid rgba(245,158,11,0.25)",
              }}
            >
              <div
                className='absolute inset-1.5 rounded-full'
                style={{ border: "1px solid rgba(245,158,11,0.4)" }}
              />
              <div
                className='flex items-center justify-center rounded-full'
                style={{
                  width: 42,
                  height: 42,
                  background: "linear-gradient(135deg,#F59E0B,#EA580C)",
                  boxShadow: "0 0 20px rgba(245,158,11,0.35)",
                }}
              >
                <svg width='20' height='20' viewBox='0 0 24 24'>
                  <path
                    className='bs-check-path'
                    d='M5 13l4 4L19 7'
                    stroke='#fff'
                    strokeWidth='2.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    fill='none'
                    strokeDasharray='30'
                    strokeDashoffset='30'
                    style={{
                      animation: "bsDrawCheck 0.55s ease 0.6s forwards",
                    }}
                  />
                </svg>
              </div>
            </div>
          </div>

          <span className='inline-flex items-center gap-1.5 mb-3.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-[#FAEEDA] text-[#633806]'>
            <span className='w-1.5 h-1.5 rounded-full bg-amber-500 inline-block' />
            {t("bookingSuccess.hero.confirmedBadge")}
          </span>
          <h1 className="font-['Playfair_Display',serif] text-[30px] font-bold text-[#f5e6cf] leading-tight mb-2.5">
            {t("bookingSuccess.hero.title")}{" "}
            <em className='text-amber-500 not-italic'>
              {t("bookingSuccess.hero.titleEmphasis")}
            </em>
          </h1>
          <p className='text-[13.5px] font-light text-[#a07848] leading-relaxed max-w-[400px] mx-auto'>
            {t("bookingSuccess.hero.subtext")}
          </p>
        </div>

        {/* ── 3 step cards (grid → flex on mobile) ── */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3.5'>
          {[
            {
              bg: "#FAEEDA",
              stroke: "#854F0B",
              labelKey: "bookingSuccess.step1.label",
              labelColor: "#854F0B",
              titleKey: "bookingSuccess.step1.title",
              descKey: "bookingSuccess.step1.desc",
              icon: (
                <path
                  d='M11 3a8 8 0 100 16A8 8 0 0011 3zM21 21l-4.35-4.35'
                  stroke='#854F0B'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  fill='none'
                />
              ),
              vb: "0 0 24 24",
              delay: "0.05s",
            },
            {
              bg: "#EAF3DE",
              stroke: "#3B6D11",
              labelKey: "bookingSuccess.step2.label",
              labelColor: "#3B6D11",
              titleKey: "bookingSuccess.step2.title",
              descKey: "bookingSuccess.step2.desc",
              icon: (
                <path
                  d='M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.14 2.18 2 2 0 012.12 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.46-.46a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z'
                  stroke='#3B6D11'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  fill='none'
                />
              ),
              vb: "0 0 24 24",
              delay: "0.12s",
            },
            {
              bg: "#E6F1FB",
              stroke: "#185FA5",
              labelKey: "bookingSuccess.step3.label",
              labelColor: "#185FA5",
              titleKey: "bookingSuccess.step3.title",
              descKey: "bookingSuccess.step3.desc",
              icon: (
                <>
                  <rect
                    x='3'
                    y='3'
                    width='18'
                    height='18'
                    rx='2'
                    stroke='#185FA5'
                    strokeWidth='2'
                    strokeLinecap='round'
                    fill='none'
                  />
                  <path
                    d='M3 9h18M9 21V9'
                    stroke='#185FA5'
                    strokeWidth='2'
                    strokeLinecap='round'
                    fill='none'
                  />
                </>
              ),
              vb: "0 0 24 24",
              delay: "0.19s",
            },
          ].map((s) => (
            <div
              key={s.labelKey}
              className='rounded-xl bg-white border border-stone-100 p-5 shadow-sm animate-[fadeUp_0.55s_ease_both]'
              style={{ animationDelay: s.delay }}
            >
              <div
                className='w-9 h-9 rounded-full flex items-center justify-center mb-3.5'
                style={{ background: s.bg }}
              >
                <svg width='16' height='16' viewBox={s.vb}>
                  {s.icon}
                </svg>
              </div>
              <p className='text-xs font-semibold text-stone-800 mb-1.5'>
                {t(s.titleKey)}
              </p>
              <p className='text-xs font-light text-stone-400 leading-relaxed'>
                {t(s.descKey)}
              </p>
              <div className='mt-3.5 pt-3 border-t border-stone-100'>
                <span
                  className='text-[11px] font-semibold'
                  style={{ color: s.labelColor }}
                >
                  {t(s.labelKey)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── New user banner ── */}
        <div
          className='rounded-xl bg-white border border-stone-100 overflow-hidden animate-[fadeUp_0.55s_ease_both]'
          style={{ animationDelay: "0.26s" }}
        >
          <div
            className='h-1'
            style={{
              background: "linear-gradient(90deg,#F59E0B,#FB923C,#EF4444)",
            }}
          />
          <div className='flex gap-3 items-start p-4 bg-[#FAEEDA]'>
            <div className='w-8 h-8 rounded-full bg-[#FAC775] flex items-center justify-center shrink-0 mt-0.5'>
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#854F0B'
                strokeWidth='2.2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <circle cx='12' cy='12' r='10' />
                <path d='M12 8v4m0 4h.01' />
              </svg>
            </div>
            <div>
              <p className='text-[12.5px] font-semibold text-[#412402] mb-1'>
                {t("bookingSuccess.newUserBanner.title")}
              </p>
              <p className='text-xs font-light text-[#633806] leading-relaxed'>
                {t("bookingSuccess.newUserBanner.description")}
              </p>
            </div>
          </div>
        </div>

        {/* ── CTA row ── */}
        <div
          className='rounded-xl bg-white border border-stone-100 p-5 flex flex-wrap items-center justify-between gap-4 animate-[fadeUp_0.55s_ease_both]'
          style={{ animationDelay: "0.33s" }}
        >
          <div>
            <p className='text-sm font-medium text-stone-800 mb-0.5'>
              {t("bookingSuccess.cta.title")}
            </p>
            <p className='text-xs font-light text-stone-400'>
              {t("bookingSuccess.cta.subtitle")}
            </p>
          </div>
          <div className='flex gap-2.5 flex-wrap'>
            <button
              onClick={onHome}
              className='inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-700 hover:border-stone-300 hover:bg-stone-50 transition-all'
            >
              <Link to='/'>{t("bookingSuccess.cta.homeButton")}</Link>
            </button>
            <button
              onClick={onDashboard}
              className='inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-amber-500 text-white hover:opacity-90 transition-all shadow-md shadow-amber-200/50'
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <rect x='3' y='3' width='18' height='18' rx='2' />
                <path d='M3 9h18M9 21V9' />
              </svg>
              <Link
                to={
                  user?.role === "admin"
                    ? "/admin/dashboard"
                    : "/customer/dashboard"
                }
              >
                {t("bookingSuccess.cta.dashboardButton")}
              </Link>
            </button>
          </div>
        </div>
      </div>

      {/* Global animations (tailwind doesn't have draw check by default) */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bsDrawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }
        .bs-check-path {
          stroke-dasharray: 30;
          stroke-dashoffset: 30;
          animation: bsDrawCheck 0.55s ease 0.6s forwards;
        }
      `}</style>
    </div>
  );
};

export default BookingSuccess;
