import { useState } from "react";

// ─── shared classes (mirrors your Profile.jsx tokens) ─────────────────────────
const labelClass =
  "block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5";

const inputClass =
  "w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 transition-all placeholder-stone-300 text-stone-700";

const selectClass =
  "w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 transition-all text-stone-700 appearance-none cursor-pointer";

// ─── reusable primitives ──────────────────────────────────────────────────────
const SectionCard = ({ title, eyebrow, children, danger = false }) => (
  <div
    className={`bg-white rounded-2xl border overflow-hidden ${
      danger ? "border-red-100" : "border-stone-100"
    }`}
  >
    <div
      className={`h-1 ${
        danger
          ? "bg-gradient-to-r from-red-400 to-rose-500"
          : "bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400"
      }`}
    />
    <div className='p-6'>
      {eyebrow && (
        <p
          className={`text-xs font-bold uppercase tracking-[0.2em] mb-1 ${
            danger ? "text-red-400" : "text-amber-500"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className='text-base font-black text-stone-800 mb-5'
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {title}
      </h2>
      {children}
    </div>
  </div>
);

const SaveButton = ({ label = "Save Changes" }) => (
  <button
    type='submit'
    className='px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-900 font-bold text-sm rounded-xl transition-all shadow-sm shadow-amber-200 active:scale-95'
  >
    {label}
  </button>
);

const Toggle = ({ checked, onChange, color = "bg-amber-400" }) => (
  <button
    type='button'
    role='switch'
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? color : "bg-stone-200"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

// ─── tab panels ───────────────────────────────────────────────────────────────

const LanguagePanel = () => {
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [currency, setCurrency] = useState("USD");

  return (
    <div className='space-y-6'>
      <SectionCard eyebrow='Localisation' title='Language & Region'>
        <form className='grid sm:grid-cols-2 gap-4'>
          <div>
            <label className={labelClass}>Display Language</label>
            <div className='relative'>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={selectClass}
              >
                <option value='en'>English</option>
                <option value='fr'>Français</option>
                <option value='es'>Español</option>
                <option value='de'>Deutsch</option>
                <option value='ar'>العربية</option>
                <option value='zh'>中文</option>
              </select>
              <i className='fa fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none' />
            </div>
          </div>
          <div>
            <label className={labelClass}>Timezone</label>
            <div className='relative'>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={selectClass}
              >
                <option value='UTC'>UTC +00:00</option>
                <option value='EST'>EST −05:00</option>
                <option value='PST'>PST −08:00</option>
                <option value='CET'>CET +01:00</option>
                <option value='GST'>GST +04:00</option>
                <option value='JST'>JST +09:00</option>
              </select>
              <i className='fa fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none' />
            </div>
          </div>
          <div>
            <label className={labelClass}>Date Format</label>
            <div className='relative'>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className={selectClass}
              >
                <option value='MM/DD/YYYY'>MM/DD/YYYY</option>
                <option value='DD/MM/YYYY'>DD/MM/YYYY</option>
                <option value='YYYY-MM-DD'>YYYY-MM-DD</option>
              </select>
              <i className='fa fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none' />
            </div>
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <div className='relative'>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={selectClass}
              >
                <option value='USD'>USD — US Dollar</option>
                <option value='EUR'>EUR — Euro</option>
                <option value='GBP'>GBP — British Pound</option>
                <option value='AED'>AED — UAE Dirham</option>
                <option value='JPY'>JPY — Japanese Yen</option>
              </select>
              <i className='fa fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none' />
            </div>
          </div>
          <div className='sm:col-span-2 pt-1'>
            <SaveButton />
          </div>
        </form>
      </SectionCard>

      <SectionCard eyebrow='Accessibility' title='Display Preferences'>
        <div className='space-y-4'>
          {[
            {
              label: "RTL Layout",
              desc: "Mirror the interface for right-to-left languages",
              color: "bg-amber-400",
            },
            {
              label: "High Contrast Mode",
              desc: "Increase contrast ratios for better readability",
              color: "bg-orange-400",
            },
          ].map((item) => {
            const [on, setOn] = useState(false);
            return (
              <div
                key={item.label}
                className='flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100'
              >
                <div>
                  <p className='text-sm font-bold text-stone-700'>
                    {item.label}
                  </p>
                  <p className='text-xs text-stone-400 mt-0.5'>{item.desc}</p>
                </div>
                <Toggle checked={on} onChange={setOn} color={item.color} />
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
};

const SMSPanel = () => {
  const [phone, setPhone] = useState("");
  const [prefs, setPrefs] = useState({
    bookingConfirmation: true,
    reminders: true,
    promotions: false,
    securityAlerts: true,
  });

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const notifications = [
    {
      key: "bookingConfirmation",
      label: "Booking Confirmations",
      desc: "Receive an SMS when a booking is confirmed or cancelled",
      color: "bg-amber-400",
    },
    {
      key: "reminders",
      label: "Trip Reminders",
      desc: "Get reminders 24 h before your departure",
      color: "bg-orange-400",
    },
    {
      key: "promotions",
      label: "Offers & Promotions",
      desc: "Exclusive deals sent directly to your phone",
      color: "bg-rose-400",
    },
    {
      key: "securityAlerts",
      label: "Security Alerts",
      desc: "Be notified of any suspicious activity on your account",
      color: "bg-red-400",
    },
  ];

  return (
    <div className='space-y-6'>
      <SectionCard eyebrow='Phone' title='SMS Number'>
        <form className='space-y-4'>
          <div>
            <label className={labelClass}>Mobile Number</label>
            <input
              type='tel'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='+1 (555) 000-0000'
              className={inputClass}
            />
            <p className='text-xs text-stone-400 mt-1.5'>
              We only use this number to send you notifications — never shared.
            </p>
          </div>
          <SaveButton label='Verify & Save' />
        </form>
      </SectionCard>

      <SectionCard eyebrow='Preferences' title='SMS Notifications'>
        <div className='space-y-3'>
          {notifications.map((n) => (
            <div
              key={n.key}
              className='flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100'
            >
              <div>
                <p className='text-sm font-bold text-stone-700'>{n.label}</p>
                <p className='text-xs text-stone-400 mt-0.5'>{n.desc}</p>
              </div>
              <Toggle
                checked={prefs[n.key]}
                onChange={() => toggle(n.key)}
                color={n.color}
              />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

const EmailPanel = () => {
  const [email, setEmail] = useState("");
  const [digest, setDigest] = useState("weekly");
  const [prefs, setPrefs] = useState({
    bookings: true,
    newsletter: false,
    reviews: true,
    account: true,
  });

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const notifications = [
    {
      key: "bookings",
      label: "Booking Updates",
      desc: "Confirmations, itinerary changes, and cancellations",
      color: "bg-amber-400",
    },
    {
      key: "newsletter",
      label: "Newsletter",
      desc: "Travel inspiration, curated destinations, and tips",
      color: "bg-orange-400",
    },
    {
      key: "reviews",
      label: "Review Requests",
      desc: "Prompted to leave a review after completing a trip",
      color: "bg-rose-400",
    },
    {
      key: "account",
      label: "Account Notices",
      desc: "Password changes, login alerts, and billing receipts",
      color: "bg-stone-400",
    },
  ];

  return (
    <div className='space-y-6'>
      <SectionCard eyebrow='Address' title='Email Settings'>
        <form className='space-y-4'>
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@example.com'
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Digest Frequency</label>
            <div className='relative'>
              <select
                value={digest}
                onChange={(e) => setDigest(e.target.value)}
                className={selectClass}
              >
                <option value='realtime'>Real-time</option>
                <option value='daily'>Daily digest</option>
                <option value='weekly'>Weekly digest</option>
                <option value='never'>Never</option>
              </select>
              <i className='fa fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none' />
            </div>
          </div>
          <SaveButton />
        </form>
      </SectionCard>

      <SectionCard eyebrow='Subscriptions' title='Email Notifications'>
        <div className='space-y-3'>
          {notifications.map((n) => (
            <div
              key={n.key}
              className='flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100'
            >
              <div>
                <p className='text-sm font-bold text-stone-700'>{n.label}</p>
                <p className='text-xs text-stone-400 mt-0.5'>{n.desc}</p>
              </div>
              <Toggle
                checked={prefs[n.key]}
                onChange={() => toggle(n.key)}
                color={n.color}
              />
            </div>
          ))}
        </div>
        <p className='text-xs text-stone-400 mt-4'>
          You can unsubscribe from any category at any time.
        </p>
      </SectionCard>
    </div>
  );
};

// ─── sidebar nav config ───────────────────────────────────────────────────────
const TABS = [
  {
    id: "language",
    label: "Language",
    icon: "fa-globe",
    eyebrow: "Localisation",
    panel: LanguagePanel,
  },
  {
    id: "sms",
    label: "SMS",
    icon: "fa-comment-alt",
    eyebrow: "Notifications",
    panel: SMSPanel,
  },
  {
    id: "email",
    label: "Email",
    icon: "fa-envelope",
    eyebrow: "Notifications",
    panel: EmailPanel,
  },
];

// ─── main Settings component ──────────────────────────────────────────────────
const Settings = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState("language");

  const current = TABS.find((t) => t.id === activeTab);
  const Panel = current.panel;

  return (
    <div
      className={`min-h-screen bg-stone-50 p-6 md:p-8 ${className}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Page header ───────────────────────────────── */}
      <div className='mb-8'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-1'>
          Account
        </p>
        <h1
          className='text-3xl font-black text-stone-800'
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Settings
        </h1>
        <p className='text-stone-400 text-sm mt-1'>
          Configure your preferences and notification channels
        </p>
      </div>

      {/* ── Two-column layout ─────────────────────────── */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 items-start'>
        {/* ── Left sidebar ──────────────────────────── */}
        <aside className='lg:col-span-1'>
          <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
            {/* accent strip */}
            <div className='h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400' />
            <nav className='p-3 space-y-1'>
              {TABS.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group ${
                      isActive
                        ? "bg-amber-50 border border-amber-200"
                        : "hover:bg-stone-50 border border-transparent"
                    }`}
                  >
                    {/* icon bubble */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "bg-gradient-to-br from-amber-400 to-orange-500"
                          : "bg-stone-100 group-hover:bg-stone-200"
                      }`}
                    >
                      <i
                        className={`fa ${tab.icon} text-xs ${
                          isActive ? "text-white" : "text-stone-500"
                        }`}
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p
                        className={`text-sm font-bold truncate ${
                          isActive ? "text-amber-700" : "text-stone-600"
                        }`}
                      >
                        {tab.label}
                      </p>
                      <p className='text-[10px] text-stone-400 uppercase tracking-widest'>
                        {tab.eyebrow}
                      </p>
                    </div>
                    {isActive && (
                      <span className='w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0' />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* sidebar footer hint */}
            <div className='px-5 pb-5 pt-2'>
              <div className='rounded-xl bg-amber-50 border border-amber-100 p-3'>
                <p className='text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1'>
                  Need help?
                </p>
                <p className='text-xs text-amber-700/70 leading-relaxed'>
                  Visit our{" "}
                  <span className='font-bold text-amber-600 cursor-pointer hover:underline'>
                    Help Centre
                  </span>{" "}
                  for guidance on settings.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Right dynamic panel ───────────────────── */}
        <main className='lg:col-span-3'>
          {/* breadcrumb / panel eyebrow */}
          <div className='flex items-center gap-2 mb-5'>
            <span className='text-xs text-stone-400'>Settings</span>
            <i className='fa fa-chevron-right text-[9px] text-stone-300' />
            <span className='text-xs font-bold text-amber-600'>
              {current.label}
            </span>
          </div>
          <Panel key={activeTab} />
        </main>
      </div>
    </div>
  );
};

export default Settings;
