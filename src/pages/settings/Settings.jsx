import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import settingsService from "../../services/adminSettings";

// ─── primitives ───────────────────────────────────────────────────────────────

const Toggle = ({
  checked,
  onChange,
  color = "bg-amber-400",
  disabled = false,
}) => (
  <button
    type='button'
    role='switch'
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-7 items-center rounded-full transition-colors
      focus:outline-none focus:ring-2 focus:ring-amber-400/30
      ${checked ? color : "bg-stone-200"}
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    style={{ width: 52 }}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform
        ${checked ? "translate-x-7" : "translate-x-1"}`}
    />
  </button>
);

const SectionCard = ({ title, eyebrow, children }) => (
  <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
    <div className='h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400' />
    <div className='p-6'>
      {eyebrow && (
        <p className='text-xs font-bold uppercase tracking-[0.2em] mb-1 text-amber-500'>
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

const ToggleRow = ({ icon, label, desc, checked, onChange, color, saving }) => (
  <div className='flex items-center justify-between gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100'>
    <div className='flex items-center gap-3'>
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors
          ${
            checked
              ? "bg-gradient-to-br from-amber-400 to-orange-500"
              : "bg-stone-100"
          }`}
      >
        <i
          className={`fa ${icon} text-xs ${
            checked ? "text-white" : "text-stone-400"
          }`}
        />
      </div>
      <div>
        <p className='text-sm font-bold text-stone-700'>{label}</p>
        <p className='text-xs text-stone-400 mt-0.5'>{desc}</p>
      </div>
    </div>
    <Toggle
      checked={checked}
      onChange={onChange}
      color={color}
      disabled={saving}
    />
  </div>
);

const StatusBadge = ({ active, activeText, inactiveText }) => (
  <div
    className={`rounded-xl border p-3 flex items-center gap-2
      ${
        active ? "border-green-100 bg-green-50" : "border-stone-100 bg-stone-50"
      }`}
  >
    <span
      className={`w-2 h-2 rounded-full shrink-0 ${
        active ? "bg-green-400" : "bg-stone-300"
      }`}
    />
    <p
      className={`text-xs font-medium ${
        active ? "text-green-700" : "text-stone-400"
      }`}
    >
      {active ? activeText : inactiveText}
    </p>
  </div>
);

const PanelSkeleton = () => (
  <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
    <div className='h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400' />
    <div className='p-6 space-y-4 animate-pulse'>
      <div className='h-3 w-24 bg-stone-100 rounded-full' />
      <div className='h-5 w-48 bg-stone-100 rounded-full' />
      <div className='h-16 bg-stone-50 rounded-xl border border-stone-100' />
    </div>
  </div>
);

// ─── tab panels ───────────────────────────────────────────────────────────────

const LanguagePanel = () => (
  <SectionCard eyebrow='Channels' title='Language Notifications'>
    <div className='rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs text-amber-700 leading-relaxed'>
      <span className='font-bold'>No channel toggles needed.</span> Language is
      applied globally to all outgoing communications. Change the display
      language from your{" "}
      <span className='font-bold underline cursor-pointer'>Profile</span>{" "}
      settings.
    </div>
  </SectionCard>
);

const SMSPanel = ({ settings, onToggle, saving }) => (
  <SectionCard eyebrow='Activation' title='SMS Channel'>
    <div className='space-y-3'>
      <ToggleRow
        icon='fa-comment-alt'
        label='Enable SMS'
        desc='Allow the platform to send SMS notifications to users'
        checked={settings.sms}
        onChange={(val) => onToggle("sms", val)}
        color='bg-amber-400'
        saving={saving}
      />
      <StatusBadge
        active={settings.sms}
        activeText='SMS is active. Booking confirmations, reminders, and alerts will be delivered via SMS.'
        inactiveText='SMS is disabled. No SMS messages will be sent to users.'
      />
    </div>
  </SectionCard>
);

const EmailPanel = ({ settings, onToggle, saving }) => (
  <SectionCard eyebrow='Activation' title='Email Channel'>
    <div className='space-y-3'>
      <ToggleRow
        icon='fa-envelope'
        label='Enable SMTP / Email'
        desc='Allow the platform to send transactional emails to users'
        checked={settings.smtp}
        onChange={(val) => onToggle("smtp", val)}
        color='bg-orange-400'
        saving={saving}
      />
      <StatusBadge
        active={settings.smtp}
        activeText='SMTP is active. Booking emails, newsletters, and account notices will be sent.'
        inactiveText='Email is disabled. No emails will be sent to users.'
      />
    </div>
  </SectionCard>
);

// ─── tabs config ──────────────────────────────────────────────────────────────

const TABS = [
  {
    id: "language",
    label: "Language",
    icon: "fa-globe",
    eyebrow: "Localisation",
  },
  { id: "sms", label: "SMS", icon: "fa-comment-alt", eyebrow: "Notifications" },
  {
    id: "email",
    label: "Email",
    icon: "fa-envelope",
    eyebrow: "Notifications",
  },
];

// ─── Settings ─────────────────────────────────────────────────────────────────

const Settings = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState("language");
  const [settings, setSettings] = useState({ smtp: false, sms: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.get();
        setSettings({ smtp: data.smtp, sms: data.sms });
      } catch {
        toast.error("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // ── optimistic toggle ───────────────────────────────────────────────────────
  const handleToggle = async (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value })); // optimistic
    setSaving(true);

    try {
      const updated = await settingsService.update({ [key]: value });
      setSettings({ smtp: updated.smtp, sms: updated.sms });
      toast.success(
        `${key.toUpperCase()} ${value ? "enabled" : "disabled"} successfully.`
      );
    } catch {
      setSettings((prev) => ({ ...prev, [key]: !value })); // rollback
      toast.error("Failed to update setting.");
    } finally {
      setSaving(false);
    }
  };

  // ── panel renderer ──────────────────────────────────────────────────────────
  const renderPanel = () => {
    if (loading) return <PanelSkeleton />;

    if (activeTab === "language") return <LanguagePanel />;
    if (activeTab === "sms")
      return (
        <SMSPanel settings={settings} onToggle={handleToggle} saving={saving} />
      );
    if (activeTab === "email")
      return (
        <EmailPanel
          settings={settings}
          onToggle={handleToggle}
          saving={saving}
        />
      );
  };

  const current = TABS.find((t) => t.id === activeTab);

  // ── sidebar status dot ──────────────────────────────────────────────────────
  const statusDot = (tabId) => {
    if (loading) return null;
    const active =
      tabId === "sms" ? settings.sms : tabId === "email" ? settings.smtp : null;
    if (active === null) return null;

    return (
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          active ? "bg-green-400" : "bg-stone-300"
        }`}
      />
    );
  };

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className={`min-h-screen bg-stone-50 p-6 md:p-8 ${className}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* page header */}
      <div className='mb-8'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-1'>
          Admin
        </p>
        <h1
          className='text-3xl font-black text-stone-800'
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Settings
        </h1>
        <p className='text-stone-400 text-sm mt-1'>
          Manage platform-wide communication channels
        </p>
      </div>

      {/* two-column layout */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 items-start'>
        {/* sidebar */}
        <aside className='lg:col-span-1'>
          <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
            <div className='h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400' />
            <nav className='p-3 space-y-1'>
              {TABS.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group
                      ${
                        isActive
                          ? "bg-amber-50 border border-amber-200"
                          : "hover:bg-stone-50 border border-transparent"
                      }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
                        ${
                          isActive
                            ? "bg-gradient-to-br from-amber-400 to-orange-500"
                            : "bg-stone-100 group-hover:bg-stone-200"
                        }`}
                    >
                      <i
                        className={`fa ${tab.icon} text-xs
                          ${isActive ? "text-white" : "text-stone-500"}`}
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p
                        className={`text-sm font-bold truncate
                          ${isActive ? "text-amber-700" : "text-stone-600"}`}
                      >
                        {tab.label}
                      </p>
                      <p className='text-[10px] text-stone-400 uppercase tracking-widest'>
                        {tab.eyebrow}
                      </p>
                    </div>
                    {statusDot(tab.id)}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* dynamic panel */}
        <main className='lg:col-span-3'>
          <div className='flex items-center gap-2 mb-5'>
            <span className='text-xs text-stone-400'>Settings</span>
            <i className='fa fa-chevron-right text-[9px] text-stone-300' />
            <span className='text-xs font-bold text-amber-600'>
              {current.label}
            </span>
            {saving && (
              <span className='ml-auto text-[10px] font-bold uppercase tracking-widest text-amber-500 animate-pulse'>
                Saving…
              </span>
            )}
          </div>
          {renderPanel()}
        </main>
      </div>
    </div>
  );
};

export default Settings;
