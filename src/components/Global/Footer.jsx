import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  const links = {
    Explore: [
      { label: "All Tours", to: "/tours" },
      { label: "Featured", to: "/tours?is_featured=true" },
      { label: "Hot Deals", to: "/tours?is_hot_deal=true" },
      { label: "Adventure", to: "/tours?category=adventure" },
      { label: "Beach", to: "/tours?category=beach" },
    ],
    Company: [
      { label: "About Us", to: "/about" },
      { label: "Contact Us", to: "/contact" },
      { label: "Our Team", to: "/about#team" },
    ],
    Account: [
      { label: "Login", to: "/login" },
      { label: "Register", to: "/register" },
      { label: "My Bookings", to: "/bookings/my" },
      { label: "My Reviews", to: "/reviews/my" },
      { label: "Profile", to: "/profile/me" },
    ],
  };

  const socials = [
    { icon: "fa-facebook-f", href: "#", label: "Facebook" },
    { icon: "fa-instagram", href: "#", label: "Instagram" },
    { icon: "fa-twitter", href: "#", label: "Twitter" },
    { icon: "fa-youtube", href: "#", label: "YouTube" },
  ];

  const contacts = [
    { icon: "fa-map-marker-alt", text: "123 Atlas Street, Marrakech, Morocco" },
    { icon: "fa-phone", text: "+212 600 000 000" },
    { icon: "fa-envelope", text: "hello@tourapp.com" },
    { icon: "fa-clock", text: "Mon – Sat: 9:00am – 6:00pm" },
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
              <i className='fa fa-globe text-white text-sm' />
            </div>
            {import.meta.env.VITE_COMPANY || "TourApp"}
          </Link>

          <p className='text-sm text-base-content/50 leading-relaxed max-w-xs'>
            Crafting unforgettable journeys since 2012. We believe travel
            transforms lives — let us show you the world.
          </p>

          {/* Contact info */}
          <ul className='space-y-2.5'>
            {contacts.map((c) => (
              <li
                key={c.text}
                className='flex items-start gap-3 text-sm text-base-content/60'
              >
                <i
                  className={`fa ${c.icon} text-accent mt-0.5 w-4 text-center flex-shrink-0`}
                />
                <span>{c.text}</span>
              </li>
            ))}
          </ul>

          {/* Socials */}
          <div className='flex items-center gap-2 pt-1'>
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
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
              {title}
            </h4>
            <ul className='space-y-2.5'>
              {items.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className='text-sm text-base-content/50 hover:text-accent transition-colors duration-150 flex items-center gap-1.5 group'
                  >
                    <span className='w-0 group-hover:w-2 h-px bg-accent transition-all duration-200 rounded' />
                    {item.label}
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
              Get travel inspiration in your inbox
            </p>
            <p className='text-xs text-base-content/40 mt-0.5'>
              No spam. Unsubscribe anytime.
            </p>
          </div>
          <form
            className='flex items-center gap-2 w-full sm:w-auto'
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type='email'
              placeholder='your@email.com'
              className='input input-bordered input-sm rounded-xl flex-1 sm:w-64 text-sm'
            />
            <button
              type='submit'
              className='btn btn-accent btn-sm rounded-xl gap-1.5'
            >
              Subscribe <i className='fa fa-paper-plane text-xs' />
            </button>
          </form>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────── */}
      <div className='border-t border-base-200'>
        <div className='max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3'>
          <p className='text-xs text-base-content/40'>
            © {year} {import.meta.env.VITE_COMPANY || "TourApp"}. All rights
            reserved.
          </p>
          <div className='flex items-center gap-4'>
            <Link
              to='/privacy'
              className='text-xs text-base-content/40 hover:text-accent transition-colors'
            >
              Privacy Policy
            </Link>
            <Link
              to='/terms'
              className='text-xs text-base-content/40 hover:text-accent transition-colors'
            >
              Terms of Service
            </Link>
            <Link
              to='/sitemap'
              className='text-xs text-base-content/40 hover:text-accent transition-colors'
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
