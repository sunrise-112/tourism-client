// ─── AboutUs.jsx ──────────────────────────────────────────────
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const STATS = [
  { value: "120+", labelKey: "aboutUs.stats.destinations" },
  { value: "8K+", labelKey: "aboutUs.stats.happyTravelers" },
  { value: "4.9★", labelKey: "aboutUs.stats.avgRating" },
  { value: "12yr", labelKey: "aboutUs.stats.experience" },
];

const TEAM = [
  {
    nameKey: "aboutUs.team.youssef.name",
    roleKey: "aboutUs.team.youssef.role",
    bioKey: "aboutUs.team.youssef.bio",
    initials: "YA",
  },
  {
    nameKey: "aboutUs.team.fatima.name",
    roleKey: "aboutUs.team.fatima.role",
    bioKey: "aboutUs.team.fatima.bio",
    initials: "FB",
  },
  {
    nameKey: "aboutUs.team.karim.name",
    roleKey: "aboutUs.team.karim.role",
    bioKey: "aboutUs.team.karim.bio",
    initials: "KT",
  },
];

const VALUES = [
  {
    icon: "fa-heart",
    titleKey: "aboutUs.values.authentic.title",
    descKey: "aboutUs.values.authentic.desc",
  },
  {
    icon: "fa-leaf",
    titleKey: "aboutUs.values.responsible.title",
    descKey: "aboutUs.values.responsible.desc",
  },
  {
    icon: "fa-shield-alt",
    titleKey: "aboutUs.values.safety.title",
    descKey: "aboutUs.values.safety.desc",
  },
  {
    icon: "fa-star",
    titleKey: "aboutUs.values.quality.title",
    descKey: "aboutUs.values.quality.desc",
  },
];

const AboutUs = () => {
  const { t } = useTranslation();

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
        <div className='absolute top-0 right-0 w-[500px] h-[400px] bg-amber-600/15 rounded-full blur-[100px] pointer-events-none' />
        <div className='absolute bottom-0 left-0 w-[400px] h-[300px] bg-orange-800/15 rounded-full blur-[80px] pointer-events-none' />

        <div className='relative z-10 max-w-5xl mx-auto px-6 py-24 md:py-32 text-center'>
          <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-4'>
            {t("aboutUs.hero.eyebrow")}
          </p>
          <h1
            className='text-5xl md:text-7xl font-black text-white leading-tight mb-6'
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("aboutUs.hero.titleLine1")}
            <br />
            <span
              className='text-transparent bg-clip-text'
              style={{
                backgroundImage: "linear-gradient(135deg, #F59E0B, #FB923C)",
              }}
            >
              {t("aboutUs.hero.titleLine2")}
            </span>
          </h1>
          <p className='text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed'>
            {t("aboutUs.hero.subtitle")}
          </p>
        </div>
      </div>

      {/* ── STATS ─────────────────────────────────────────── */}
      <div className='bg-amber-500'>
        <div className='max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-amber-400/40'>
          {STATS.map((s) => (
            <div key={s.labelKey} className='text-center px-4'>
              <p className='text-3xl font-black text-amber-900'>{s.value}</p>
              <p className='text-sm text-amber-800/70 font-medium mt-1 uppercase tracking-wider'>
                {t(s.labelKey)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MISSION ───────────────────────────────────────── */}
      <div className='max-w-6xl mx-auto px-6 py-20'>
        <div className='grid md:grid-cols-2 gap-12 items-center'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-3'>
              {t("aboutUs.mission.eyebrow")}
            </p>
            <h2
              className='text-3xl md:text-4xl font-black text-stone-800 mb-6 leading-tight'
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t("aboutUs.mission.title")}
            </h2>
            <p className='text-stone-500 leading-relaxed mb-4 text-[15px]'>
              {t("aboutUs.mission.paragraph1")}
            </p>
            <p className='text-stone-500 leading-relaxed text-[15px]'>
              {t("aboutUs.mission.paragraph2")}
            </p>
            <Link
              to='/tours'
              className='inline-flex items-center gap-2 mt-8 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-6 py-3 rounded-xl shadow-md shadow-amber-200'
            >
              {t("aboutUs.mission.button")}{" "}
              <i className='fa fa-arrow-right text-xs' />
            </Link>
          </div>

          {/* Visual card stack */}
          <div className='relative h-80 md:h-96'>
            <div className='absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-50 rounded-3xl' />
            <div className='absolute top-6 left-6 right-6 bottom-6 bg-white rounded-2xl border border-stone-100 shadow-lg overflow-hidden'>
              <img
                src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Jamaa_el_Fna_at_dusk.jpg/1280px-Jamaa_el_Fna_at_dusk.jpg'
                alt='Morocco'
                className='w-full h-full object-cover opacity-90'
              />
            </div>
            <div className='absolute -bottom-4 -right-4 bg-amber-400 rounded-2xl px-5 py-3 shadow-lg'>
              <p className='text-amber-900 font-black text-2xl'>12+</p>
              <p className='text-amber-800 text-xs font-semibold'>
                {t("aboutUs.mission.badge")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── VALUES ────────────────────────────────────────── */}
      <div className='bg-white py-20'>
        <div className='max-w-6xl mx-auto px-6'>
          <div className='text-center mb-12'>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-3'>
              {t("aboutUs.values.eyebrow")}
            </p>
            <h2
              className='text-3xl md:text-4xl font-black text-stone-800'
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t("aboutUs.values.title")}
            </h2>
          </div>
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {VALUES.map((v) => (
              <div
                key={v.titleKey}
                className='bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:shadow-lg hover:shadow-stone-200/60 hover:-translate-y-1 transition-all duration-200'
              >
                <div className='w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-4'>
                  <i className={`fa ${v.icon} text-amber-500`} />
                </div>
                <h3 className='font-black text-stone-800 mb-2'>
                  {t(v.titleKey)}
                </h3>
                <p className='text-sm text-stone-400 leading-relaxed'>
                  {t(v.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TEAM ──────────────────────────────────────────── */}
      <div className='max-w-6xl mx-auto px-6 py-20'>
        <div className='text-center mb-12'>
          <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-3'>
            {t("aboutUs.team.eyebrow")}
          </p>
          <h2
            className='text-3xl md:text-4xl font-black text-stone-800'
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("aboutUs.team.title")}
          </h2>
        </div>
        <div className='grid md:grid-cols-3 gap-8'>
          {TEAM.map((member) => (
            <div
              key={member.nameKey}
              className='bg-white rounded-2xl border border-stone-100 p-7 text-center hover:shadow-xl hover:shadow-stone-200/60 hover:-translate-y-1 transition-all duration-200'
            >
              <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-2xl mx-auto mb-5 shadow-lg shadow-amber-200'>
                {member.initials}
              </div>
              <h3 className='font-black text-stone-800 text-lg mb-1'>
                {t(member.nameKey)}
              </h3>
              <p className='text-xs font-bold uppercase tracking-widest text-amber-500 mb-4'>
                {t(member.roleKey)}
              </p>
              <p className='text-sm text-stone-400 leading-relaxed'>
                {t(member.bioKey)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────────── */}
      <div className='max-w-6xl mx-auto px-6 pb-20'>
        <div className='relative bg-[#1C1107] rounded-3xl overflow-hidden p-14 text-center'>
          <div
            className='absolute inset-0 opacity-[0.04]'
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-amber-500/20 rounded-full blur-[70px] pointer-events-none' />
          <div className='relative z-10'>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-4'>
              {t("aboutUs.cta.eyebrow")}
            </p>
            <h2
              className='text-4xl font-black text-white mb-4'
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t("aboutUs.cta.title")}
            </h2>
            <p className='text-stone-400 text-lg mb-8 max-w-xl mx-auto'>
              {t("aboutUs.cta.subtitle")}
            </p>
            <div className='flex items-center justify-center gap-4 flex-wrap'>
              <Link
                to='/tours'
                className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-8 py-3.5 rounded-xl'
              >
                {t("aboutUs.cta.browseButton")}{" "}
                <i className='fa fa-arrow-right' />
              </Link>
              <Link
                to='/contact'
                className='flex items-center gap-2 text-sm font-semibold text-stone-300 hover:text-white border border-white/15 hover:border-white/30 px-8 py-3.5 rounded-xl transition-all'
              >
                {t("aboutUs.cta.contactButton")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
