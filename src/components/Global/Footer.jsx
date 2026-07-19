import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import settingsService from "../../services/adminSettings";

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.get();
        setCompanyInfo(data);
      } catch (error) {
        console.log("Error: ", error);
      }
    };
    fetchSettings();
  }, []);

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
    ],
    Account: [
      { labelKey: "footer.links.account.login", to: "/login" },
      { labelKey: "footer.links.account.register", to: "/register" },
      { labelKey: "footer.links.account.profile", to: "/profile/me" },
    ],
  };

  const contactFields = [
    {
      icon: "fa-map-marker-alt",
      value: companyInfo?.address,
    },
    {
      icon: "fa-phone",
      value: companyInfo?.company_phone,
    },
    {
      icon: "fa-clock",
      value: companyInfo?.opening_hours,
    },
  ];

  const socialLinks = [
    {
      icon: "fa-facebook-f",
      url: companyInfo?.facebook_url,
      labelKey: "footer.socials.facebook",
    },
    {
      icon: "fa-instagram",
      url: companyInfo?.instagram_url,
      labelKey: "footer.socials.instagram",
    },
    {
      icon: "fa-twitter",
      url: companyInfo?.twitter_url,
      labelKey: "footer.socials.twitter",
    },
    {
      icon: "fa-youtube",
      url: companyInfo?.youtube_url,
      labelKey: "footer.socials.youtube",
    },
  ].filter((item) => item.url && item.url.trim() !== "");

  return (
    <footer className='bg-stone-50 border-t border-stone-200'>
      {/* Main footer */}
      <div className='max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10'>
        {/* Brand column */}
        <div className='lg:col-span-2 flex flex-col gap-5'>
          <Link
            to='/'
            className='flex items-center gap-2 text-xl font-black w-fit'
          >
            <div className='w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm'>
              {companyInfo?.logo ? (
                <img
                  src={companyInfo?.logo}
                  className='w-full h-full object-cover'
                />
              ) : (
                <i className='fa fa-globe text-white text-sm' />
              )}
            </div>
            <div className='text-stone-800'>
              {import.meta.env.VITE_COMPANY || companyInfo?.company_name}
            </div>
          </Link>

          <p className='text-sm text-stone-500 leading-relaxed max-w-xs'>
            {t("footer.brand.description")}
          </p>

          {/* Contact info */}
          <ul className='space-y-2.5'>
            {contactFields.map((field) => (
              <li
                key={field.icon}
                className='flex items-start gap-3 text-sm text-stone-600'
              >
                <i
                  className={`fa ${field.icon} text-orange-500 mt-0.5 w-4 text-center flex-shrink-0`}
                />
                <span>
                  <span className='font-medium'>{t(field.labelKey)}</span>{" "}
                  {field.value || "-"}
                </span>
              </li>
            ))}
          </ul>

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className='flex items-center gap-2 pt-1'>
              {socialLinks.map((s) => (
                <a
                  key={s.labelKey}
                  href={s.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label={t(s.labelKey)}
                  className='w-9 h-9 rounded-xl border border-stone-300 flex items-center justify-center
                    text-stone-400 hover:text-orange-500 hover:border-orange-500
                    transition-colors duration-200'
                >
                  <i className={`fab ${s.icon} text-sm`} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Link columns */}
        {Object.entries(links).map(([title, items]) => (
          <div key={title}>
            <h4 className='text-sm font-bold text-stone-700 uppercase tracking-widest mb-4'>
              {t(`footer.sections.${title.toLowerCase()}`)}
            </h4>
            <ul className='space-y-2.5'>
              {items.map((item) => (
                <li key={item.labelKey}>
                  <Link
                    to={item.to}
                    className='text-sm text-stone-500 hover:text-orange-500 transition-colors duration-150 flex items-center gap-1.5 group'
                  >
                    <span className='w-0 group-hover:w-2 h-px bg-orange-500 transition-all duration-200 rounded' />
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Newsletter strip */}
      {/*       <div className='border-t border-stone-200 bg-stone-100/50'>
        <div className='max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6'>
          <div>
            <p className='text-sm font-semibold text-stone-800'>
              {t("footer.newsletter.title")}
            </p>
            <p className='text-xs text-stone-400 mt-0.5'>
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
              className='input border-stone-300 rounded-xl flex-1 sm:w-64 text-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500'
            />
            <button
              type='submit'
              className='bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors'
            >
              {t("footer.newsletter.button")}{" "}
              <i className='fa fa-paper-plane text-xs' />
            </button>
          </form>
        </div>
      </div> */}

      {/* Bottom bar */}
      <div className='border-t border-stone-200'>
        <div className='max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3'>
          <p className='text-xs text-stone-400'>
            {t("footer.copyright", {
              year,
              company: import.meta.env.VITE_COMPANY || "TourApp",
            })}
          </p>
          <div className='flex items-center gap-4'>
            <Link
              to='/privacy'
              className='text-xs text-stone-400 hover:text-orange-500 transition-colors'
            >
              {t("footer.bottomLinks.privacy")}
            </Link>
            <Link
              to='/terms'
              className='text-xs text-stone-400 hover:text-orange-500 transition-colors'
            >
              {t("footer.bottomLinks.terms")}
            </Link>
            <Link
              to='/sitemap'
              className='text-xs text-stone-400 hover:text-orange-500 transition-colors'
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
