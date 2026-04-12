import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const links = {
    Explore: [
      { labelKey: "footer.links.explore.allTours", to: "/tours" },
      {
        labelKey: "footer.links.explore.featured",
        to: "/tours?is_featured=true",
      },
      {
        labelKey: "footer.links.explore.hotDeals",
        to: "/tours?is_hot_deal=true",
      },
      {
        labelKey: "footer.links.explore.adventure",
        to: "/tours?category=adventure",
      },
      { labelKey: "footer.links.explore.beach", to: "/tours?category=beach" },
    ],
    Company: [
      { labelKey: "footer.links.company.aboutUs", to: "/about" },
      { labelKey: "footer.links.company.contactUs", to: "/contact" },
      { labelKey: "footer.links.company.ourTeam", to: "/about#team" },
    ],
    Account: [
      { labelKey: "footer.links.account.login", to: "/login" },
      { labelKey: "footer.links.account.register", to: "/register" },
      { labelKey: "footer.links.account.myBookings", to: "/bookings/my" },
      { labelKey: "footer.links.account.myReviews", to: "/reviews/my" },
      { labelKey: "footer.links.account.profile", to: "/profile/me" },
    ],
  };

  const socials = [
    { icon: "fa-facebook-f", href: "#", labelKey: "footer.socials.facebook" },
    { icon: "fa-instagram", href: "#", labelKey: "footer.socials.instagram" },
    { icon: "fa-twitter", href: "#", labelKey: "footer.socials.twitter" },
    { icon: "fa-youtube", href: "#", labelKey: "footer.socials.youtube" },
  ];

  const contacts = [
    { icon: "fa-map-marker-alt", textKey: "footer.contacts.address" },
    { icon: "fa-phone", textKey: "footer.contacts.phone" },
    { icon: "fa-envelope", textKey: "footer.contacts.email" },
    { icon: "fa-clock", textKey: "footer.contacts.hours" },
  ];

  return (
    <footer className='bg-base-100 border-t border-base-200'>
      {/* ── Main footer ───────────────────────────────── */}
      <div className='max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10'>
        {/* Brand col — spans 2 on lg */}
        <div className='lg:col-span-2 flex flex-col gap-5'>
          {/* Logo */}
          <Link
            to='/'
            className='flex items-center gap-2 text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent w-fit'
          >
            <div className='w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0'>
              <i className='fa fa-globe text-black text-sm' />
            </div>
            <div className='text-black'>
              {import.meta.env.VITE_COMPANY || "TourApp"}
            </div>
          </Link>

          <p className='text-sm text-base-content/50 leading-relaxed max-w-xs'>
            {t("footer.brand.description")}
          </p>

          {/* Contact info */}
          <ul className='space-y-2.5'>
            {contacts.map((c) => (
              <li
                key={c.textKey}
                className='flex items-start gap-3 text-sm text-base-content/60'
              >
                <i
                  className={`fa ${c.icon} text-accent mt-0.5 w-4 text-center flex-shrink-0`}
                />
                <span>{t(c.textKey)}</span>
              </li>
            ))}
          </ul>

          {/* Socials */}
          <div className='flex items-center gap-2 pt-1'>
            {socials.map((s) => (
              <a
                key={s.labelKey}
                href={s.href}
                aria-label={t(s.labelKey)}
                className='w-9 h-9 rounded-xl border border-base-300 flex items-center justify-center
                  text-base-content/40 hover:text-accent hover:border-accent
                  transition-colors duration-200'
              >
                <i className={`fab ${s.icon} text-sm`} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(links).map(([title, items]) => (
          <div key={title}>
            <h4 className='text-sm font-bold text-base-content uppercase tracking-widest mb-4'>
              {t(`footer.sections.${title.toLowerCase()}`)}
            </h4>
            <ul className='space-y-2.5'>
              {items.map((item) => (
                <li key={item.labelKey}>
                  <Link
                    to={item.to}
                    className='text-sm text-base-content/50 hover:text-accent transition-colors duration-150 flex items-center gap-1.5 group'
                  >
                    <span className='w-0 group-hover:w-2 h-px bg-accent transition-all duration-200 rounded' />
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Newsletter strip ──────────────────────────── */}
      <div className='border-t border-base-200 bg-base-200/50'>
        <div className='max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6'>
          <div>
            <p className='text-sm font-semibold text-base-content'>
              {t("footer.newsletter.title")}
            </p>
            <p className='text-xs text-base-content/40 mt-0.5'>
              {t("footer.newsletter.subtitle")}
            </p>
          </div>
          <form
            className='flex items-center gap-2 w-full sm:w-auto'
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type='email'
              placeholder={t("footer.newsletter.placeholder")}
              className='input input-bordered input-sm rounded-xl flex-1 sm:w-64 text-sm'
            />
            <button
              type='submit'
              className='btn btn-accent btn-sm rounded-xl gap-1.5'
            >
              {t("footer.newsletter.button")}{" "}
              <i className='fa fa-paper-plane text-xs' />
            </button>
          </form>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────── */}
      <div className='border-t border-base-200'>
        <div className='max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3'>
          <p className='text-xs text-base-content/40'>
            {t("footer.copyright", {
              year,
              company: import.meta.env.VITE_COMPANY || "TourApp",
            })}
          </p>
          <div className='flex items-center gap-4'>
            <Link
              to='/privacy'
              className='text-xs text-base-content/40 hover:text-accent transition-colors'
            >
              {t("footer.bottomLinks.privacy")}
            </Link>
            <Link
              to='/terms'
              className='text-xs text-base-content/40 hover:text-accent transition-colors'
            >
              {t("footer.bottomLinks.terms")}
            </Link>
            <Link
              to='/sitemap'
              className='text-xs text-base-content/40 hover:text-accent transition-colors'
            >
              {t("footer.bottomLinks.sitemap")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
