import { useState, useEffect, use } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import settingsService from "../../services/adminSettings";
import userService from "../../services/userService";
import LanguageSwitcher from "../../common/LanguageSwitcher";
import role from "../../constants/role";
import LocationPicker from "../../components/LocationPicker";
import Joi from "joi-browser";
import useForm from "../../hooks/useForm";
import {
  renderButton,
  renderInput,
  renderTextarea,
} from "../../utils/formRenders";
import LocationViewer from "../../components/LocationViewer";

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

const GeneralPanel = ({ isEditing, setIsEditing, t, user }) => {
  const [cordinates, setCordinates] = useState({
    lng: "",
    lat: "",
  });
  const [formData, setFormData] = useState({
    company_name: "",
    address: "",
    company_phone: "",
    opening_hours: "",
    facebook_url: "",
    instagram_url: "",
    youtube_url: "",
    twitter_url: "",
    privacy_policy: "",
    terms_of_service: "",
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const schema = {
    company_name: Joi.string().max(255).allow(null, "").optional(),
    address: Joi.string().allow(null, "").optional(),
    company_phone: Joi.string().max(50).allow(null, "").optional(),
    opening_hours: Joi.string().allow(null, "").optional(),
    facebook_url: Joi.string().uri().max(255).allow(null, "").optional(),
    instagram_url: Joi.string().uri().max(255).allow(null, "").optional(),
    youtube_url: Joi.string().uri().max(255).allow(null, "").optional(),
    twitter_url: Joi.string().uri().max(255).allow(null, "").optional(),
    privacy_policy: Joi.string()
      .allow(null, "")
      .optional()
      .label("Privacy Policy"),
    terms_of_service: Joi.string()
      .allow(null, "")
      .optional()
      .label("Terms of Service"),
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsService.get();
        setCordinates({
          lat: response?.lat || "",
          lng: response?.lng || "",
        });
        setFormData({
          company_name: response.company_name || "",
          address: response.address || "",
          company_phone: response.company_phone || "",
          opening_hours: response.opening_hours || "",
          facebook_url: response.facebook_url || "",
          instagram_url: response.instagram_url || "",
          youtube_url: response.youtube_url || "",
          twitter_url: response.twitter_url || "",
          privacy_policy: response.privacy_policy || "",
          terms_of_service: response.terms_of_service || "",
        });
        console.log("Response: ", response);
      } catch (error) {
        console.log("Error: ", error);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    console.log("cordinates: ", cordinates);
  }, [cordinates]);

  const doSubmit = async () => {
    try {
      const updateData = {
        ...data,
        lat: cordinates?.lat,
        lng: cordinates?.lng,
      };

      await settingsService.update(updateData);
      toast.success("Settings updated successfully!");
      setTimeout(() => {
        setIsEditing(false);
      }, 1500);
    } catch (error) {
      console.log("Error: ", error);
      toast.error("Error updating Settings!");
    }
  };

  const { data, errors, handleChange, handleSubmit, validate } = useForm(
    formData,
    schema,
    doSubmit
  );

  // Placeholder edit handler – replace with actual logic
  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  console.log("Validate: ", validate());

  return (
    <SectionCard
      eyebrow={t("settings.general.eyebrow", "PREFERENCES")}
      title={t("settings.general.title", "General Settings")}
    >
      <div className='space-y-6'>
        {/* Dark mode toggle */}
        {/*         <ToggleRow
          icon='fa-moon'
          label={t("settings.general.darkModeLabel", "Dark Mode")}
          desc={t(
            "settings.general.darkModeDesc",
            "Switch between light and dark appearance"
          )}
          checked={darkMode}
          onChange={setDarkMode}
          color='bg-indigo-400'
          saving={false}
        /> */}

        {/* User information card */}
        <div className='rounded-xl border border-stone-200 bg-white p-4'>
          <div className='flex justify-between items-center mb-3'>
            <p className='text-sm font-bold text-stone-700'>
              {t(
                "settings.general.profile",
                `${
                  isEditing ? "Edit Profile Information" : "Profile Information"
                }`
              )}
            </p>
            <button
              onClick={handleEdit}
              className={`${
                isEditing ? "bg-red-600" : "bg-amber-600"
              } text-white rounded-xl text w-20 h-7 cursor-pointer text-center text-md font-medium hover:bg-amber-700 transition-colors`}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          {!isEditing ? (
            <div className='space-y-4'>
              {/* Company & contact info - two columns */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3'>
                <div className='flex justify-between items-center border-b border-stone-100 pb-2'>
                  <span className='text-stone-500 text-sm'>
                    {t("settings.general.company_name", "Company name")}:
                  </span>
                  <span className='font-medium text-stone-800 text-sm'>
                    {data?.company_name || "-"}
                  </span>
                </div>
                <div className='flex justify-between items-center border-b border-stone-100 pb-2'>
                  <span className='text-stone-500 text-sm'>
                    {t("settings.general.address", "Address")}:
                  </span>
                  <span className='font-medium text-stone-800 text-sm'>
                    {data?.address || "-"}
                  </span>
                </div>
                <div className='flex justify-between items-center border-b border-stone-100 pb-2'>
                  <span className='text-stone-500 text-sm'>
                    {t("settings.general.company_phone", "Phone number")}:
                  </span>
                  <span className='font-medium text-stone-800 text-sm'>
                    {data?.company_phone || "-"}
                  </span>
                </div>
                <div className='flex justify-between items-center border-b border-stone-100 pb-2'>
                  <span className='text-stone-500 text-sm'>
                    {t("settings.general.opening_hours", "Opening hours")}:
                  </span>
                  <span className='font-medium text-stone-800 text-sm'>
                    {data?.opening_hours || "-"}
                  </span>
                </div>
              </div>

              {/* Social media section */}
              {(data?.facebook_url ||
                data?.instagram_url ||
                data?.youtube_url ||
                data?.twitter_url) && (
                <div className='pt-2'>
                  <p className='text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3'>
                    {t("settings.general.social_media", "Social Media")}
                  </p>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {data?.facebook_url && (
                      <a
                        href={data.facebook_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-2 text-sm text-stone-600 hover:text-blue-600 transition-colors'
                      >
                        <i className='fab fa-facebook-f w-4 text-blue-500'></i>
                        <span className='truncate'>{data.facebook_url}</span>
                      </a>
                    )}
                    {data?.instagram_url && (
                      <a
                        href={data.instagram_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-2 text-sm text-stone-600 hover:text-pink-600 transition-colors'
                      >
                        <i className='fab fa-instagram w-4 text-pink-500'></i>
                        <span className='truncate'>{data.instagram_url}</span>
                      </a>
                    )}
                    {data?.youtube_url && (
                      <a
                        href={data.youtube_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-2 text-sm text-stone-600 hover:text-red-600 transition-colors'
                      >
                        <i className='fab fa-youtube w-4 text-red-500'></i>
                        <span className='truncate'>{data.youtube_url}</span>
                      </a>
                    )}
                    {data?.twitter_url && (
                      <a
                        href={data.twitter_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-2 text-sm text-stone-600 hover:text-sky-600 transition-colors'
                      >
                        <i className='fab fa-twitter w-4 text-sky-500'></i>
                        <span className='truncate'>{data.twitter_url}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
              <LocationViewer />
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className='bg-white rounded-xl shadow-md p-6'
            >
              <h2 className='text-xl font-bold text-stone-800 mb-6 pb-2 border-b border-stone-200'>
                Company Settings
              </h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2'>
                {/* Basic info */}
                {renderInput(
                  "Company name",
                  "company_name",
                  data,
                  errors,
                  handleChange
                )}
                {renderInput("Address", "address", data, errors, handleChange)}
                {renderInput(
                  "Phone number",
                  "company_phone",
                  data,
                  errors,
                  handleChange
                )}
                {renderInput(
                  "Opening hours",
                  "opening_hours",
                  data,
                  errors,
                  handleChange
                )}

                {/* Social media */}
                {renderInput(
                  "Facebook URL",
                  "facebook_url",
                  data,
                  errors,
                  handleChange
                )}
                {renderInput(
                  "Instagram URL",
                  "instagram_url",
                  data,
                  errors,
                  handleChange
                )}
                {renderInput(
                  "YouTube URL",
                  "youtube_url",
                  data,
                  errors,
                  handleChange
                )}
                {renderInput(
                  "Twitter URL",
                  "twitter_url",
                  data,
                  errors,
                  handleChange
                )}
                {renderTextarea(
                  "Privacy Policy",
                  "privacy_policy",
                  data,
                  errors,
                  handleChange,
                  "text",
                  5
                )}
                {renderTextarea(
                  "Terms of service",
                  "terms_of_service",
                  data,
                  errors,
                  handleChange,
                  "text",
                  5
                )}
              </div>

              <LocationPicker
                onChange={(cords) => setCordinates(cords)}
                initialPosition={cordinates}
              />
              <div className='mt-8 flex justify-end'>
                {renderButton("Save changes", "submit", validate())}
              </div>
            </form>
          )}
        </div>
      </div>
    </SectionCard>
  );
};

const LanguagePanel = ({ t }) => (
  <SectionCard
    eyebrow={t("settings.language.eyebrow")}
    title={t("settings.language.title")}
  >
    <div className='flex w-auto'>
      <LanguageSwitcher />
    </div>
  </SectionCard>
);

const SMSPanel = ({ settings, onToggle, saving, t }) => (
  <SectionCard
    eyebrow={t("settings.sms.eyebrow")}
    title={t("settings.sms.title")}
  >
    <div className='space-y-3'>
      <ToggleRow
        icon='fa-comment-alt'
        label={t("settings.sms.toggleLabel")}
        desc={t("settings.sms.toggleDesc")}
        checked={settings.sms}
        onChange={(val) => onToggle("sms", val)}
        color='bg-amber-400'
        saving={saving}
      />
      <StatusBadge
        active={settings.sms}
        activeText={t("settings.sms.activeText")}
        inactiveText={t("settings.sms.inactiveText")}
      />
    </div>
  </SectionCard>
);

const EmailPanel = ({ settings, onToggle, saving, t }) => (
  <SectionCard
    eyebrow={t("settings.email.eyebrow")}
    title={t("settings.email.title")}
  >
    <div className='space-y-3'>
      <ToggleRow
        icon='fa-envelope'
        label={t("settings.email.toggleLabel")}
        desc={t("settings.email.toggleDesc")}
        checked={settings.smtp}
        onChange={(val) => onToggle("smtp", val)}
        color='bg-orange-400'
        saving={saving}
      />
      <StatusBadge
        active={settings.smtp}
        activeText={t("settings.email.activeText")}
        inactiveText={t("settings.email.inactiveText")}
      />
    </div>
  </SectionCard>
);

// ─── Settings ─────────────────────────────────────────────────────────────────

const Settings = ({ className = "" }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("general"); // default to general
  const [settings, setSettings] = useState({ smtp: false, sms: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({});

  const isAdmin = user?.role === role.ADMIN;

  // TABS definition – General is always first
  const TABS = [
    {
      id: "general",
      label: t("settings.tabs.general.label", "General"),
      icon: "fa-sliders-h",
      eyebrow: t("settings.tabs.general.eyebrow", "BASIC"),
    },
    {
      id: "language",
      label: t("settings.tabs.language.label"),
      icon: "fa-globe",
      eyebrow: t("settings.tabs.language.eyebrow"),
    },
    ...(isAdmin
      ? [
          {
            id: "sms",
            label: t("settings.tabs.sms.label"),
            icon: "fa-comment-alt",
            eyebrow: t("settings.tabs.sms.eyebrow"),
          },
          {
            id: "email",
            label: t("settings.tabs.email.label"),
            icon: "fa-envelope",
            eyebrow: t("settings.tabs.email.eyebrow"),
          },
        ]
      : []),
  ];

  // ── fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const currentUser = userService.getCurrentUser();
        setUser(currentUser);
        console.log("CurrentUser: ", currentUser);
        if (currentUser?.role !== role.ADMIN) return;

        const data = await settingsService.get();
        setSettings({ smtp: data.smtp, sms: data.sms });
      } catch {
        toast.error(t("settings.errors.loadFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [t]);

  // ── optimistic toggle ───────────────────────────────────────────────────────
  const handleToggle = async (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value })); // optimistic
    setSaving(true);

    try {
      const updated = await settingsService.update({ [key]: value });
      setSettings({ smtp: updated.smtp, sms: updated.sms });
      toast.success(
        value
          ? t("settings.toasts.enabled", { channel: key.toUpperCase() })
          : t("settings.toasts.disabled", { channel: key.toUpperCase() })
      );
    } catch {
      setSettings((prev) => ({ ...prev, [key]: !value })); // rollback
      toast.error(t("settings.errors.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  // ── panel renderer ──────────────────────────────────────────────────────────
  const renderPanel = () => {
    if (loading) return <PanelSkeleton />;

    if (activeTab === "general")
      return (
        <GeneralPanel
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          t={t}
          user={user}
        />
      );

    if (activeTab === "language") return <LanguagePanel t={t} />;
    if (activeTab === "sms" && user?.role === role?.ADMIN)
      return (
        <SMSPanel
          settings={settings}
          onToggle={handleToggle}
          saving={saving}
          t={t}
        />
      );
    if (activeTab === "email" && user?.role === role?.ADMIN)
      return (
        <EmailPanel
          settings={settings}
          onToggle={handleToggle}
          saving={saving}
          t={t}
        />
      );
  };

  const current = TABS.find((t) => t.id === activeTab);

  // ── sidebar status dot (no dot for general) ─────────────────────────────────
  const statusDot = (tabId) => {
    if (loading || tabId === "general") return null;
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
          {t("settings.admin")}
        </p>
        <h1
          className='text-3xl font-black text-stone-800'
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {t("settings.title")}
        </h1>
        <p className='text-stone-400 text-sm mt-1'>
          {t("settings.description")}
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
            <span className='text-xs text-stone-400'>
              {t("settings.breadcrumb.settings")}
            </span>
            <i className='fa fa-chevron-right text-[9px] text-stone-300' />
            <span className='text-xs font-bold text-amber-600'>
              {current?.label}
            </span>
            {saving && (
              <span className='ml-auto text-[10px] font-bold uppercase tracking-widest text-amber-500 animate-pulse'>
                {t("settings.savingIndicator")}
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
