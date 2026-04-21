import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Joi from "joi-browser";
import { useTranslation } from "react-i18next";

// Services
import userService from "../../services/userService";

// Hooks
import useForm from "../../hooks/useForm";

// Utils
import renderImage from "../../utils/renderImage";
import {
  renderButton,
  renderInput,
  renderSelect,
} from "../../utils/formRenders";

// Commons
import ToggleSwitcher from "../../common/ToggleSwitcher";
import role from "../../constants/role";

const Sk = ({ className }) => (
  <div className={`animate-pulse bg-stone-100 rounded-xl ${className}`} />
);

const inputClass =
  "w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 transition-all placeholder-stone-300 text-stone-700";

const labelClass =
  "block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5";

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

const Profile = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
    email: "",
    password: "",
    phone: "",
    nationality: "",
    role: "",
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = userService.getCurrentUser();
      if (currentUser?.role === "admin") {
        const fetchedUser = await userService?.getById(currentUser?.id);
        setFormData({
          avatar: fetchedUser?.avatar || "",
          name: fetchedUser?.name || "",
          email: fetchedUser?.email || "",
          password: "",
          phone: fetchedUser?.phone || "",
          nationality: fetchedUser?.nationality || "",
          ...(currentUser?.role === "admin"
            ? {
                role: fetchedUser?.role,
              }
            : {}),
        });
        setUser(fetchedUser);
        console.log("fetchedUser admin: ", fetchedUser);
      } else {
        const fetchedUser = await userService.getMe();
        setFormData({
          avatar: fetchedUser?.avatar || "",
          name: fetchedUser?.name || "",
          email: fetchedUser?.email || "",
          password: "",
          phone: fetchedUser?.phone || "",
          nationality: fetchedUser?.nationality || "",
        });
        setUser(fetchedUser);
        console.log("fetchedUser client: ", fetchedUser);
      }
    };

    fetchUser();
  }, []);

  const ROLES = ["admin", "customer"];

  // Translate role names for select dropdown
  const getRoleOptions = () => {
    return ROLES.map((r) => ({
      value: r,
      label: t(`profile.roles.${r}`, { defaultValue: r }),
    }));
  };

  const baseSchema = {
    avatar: Joi.optional(),
    name: Joi.string().max(100).label(t("profile.schema.name")),
    email: Joi.string().email().max(150).label(t("profile.schema.email")),
    password: Joi.optional().label(t("profile.schema.password")),
    phone: Joi.string().max(20).label(t("profile.schema.phone")),
    nationality: Joi.string().max(100).label(t("profile.schema.nationality")),
  };

  const roleExtensions = {
    admin: {
      role: Joi.string()
        .valid(...ROLES)
        .label(t("profile.schema.role")),
    },
    customer: {},
  };

  const buildUserSchema = () => {
    const currentUser = userService.getCurrentUser();
    if (!roleExtensions[currentUser?.role]) {
      throw new Error(`Unknown role: "${currentUser?.role}"`);
    }

    return {
      ...baseSchema,
      ...roleExtensions[currentUser?.role],
    };
  };

  const doSubmit = async () => {
    try {
      const createData = getFormData();
      setSubmitting(true);
      await userService.update(user?.id, createData);
      toast.success(t("profile.toasts.updateSuccess"));
    } catch (error) {
      console.log("Error: ", error);
      toast.error(t("profile.toasts.updateError"));
    } finally {
      setSubmitting(false);
    }
  };

  const { data, errors, handleChange, handleSubmit, validate, getFormData } =
    useForm(formData, buildUserSchema(), doSubmit);

  console.log("Validate: ", validate());
  return (
    <div
      className='min-h-screen bg-stone-50 p-6 md:p-8'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Page header ──────────────────────────────────── */}
      <div className='mb-8'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-1'>
          {t("profile.header.eyebrow")}
        </p>
        <h1
          className='text-3xl font-black text-stone-800'
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {t("profile.header.title")}
        </h1>
        <p className='text-stone-400 text-sm mt-1'>
          {t("profile.header.description")}
        </p>
      </div>

      {loading ? (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <Sk className='h-64 rounded-2xl lg:row-span-2' />
          <Sk className='h-64 rounded-2xl lg:col-span-2' />
          <Sk className='h-72 rounded-2xl lg:col-span-2' />
          <Sk className='h-48 rounded-2xl lg:col-span-3' />
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* ── Col 1: Avatar + Stats ─────────────────── */}

          <div className='space-y-6'>
            {/* Avatar card */}
            <SectionCard
              eyebrow={t("profile.avatar.eyebrow")}
              title={t("profile.avatar.title")}
            >
              <div className='flex flex-col items-center text-center'>
                <div className='relative mb-4'>
                  <div className='w-28 h-28 rounded-2xl overflow-hidden bg-stone-100 ring-4 ring-amber-400/20 mx-auto'>
                    {data?.avatar ? (
                      <img
                        src={renderImage(data?.avatar)}
                        alt={user?.name}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-3xl'>
                        {user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>

                  <div>
                    <input
                      id='avatar'
                      type='file'
                      name='avatar'
                      onChange={handleChange}
                      accept='image/*'
                      className='hidden'
                    />

                    <label htmlFor='avatar'>
                      <i className='absolute -bottom-2 -right-2 w-8 h-8 bg-amber-400 hover:bg-amber-300 rounded-xl flex items-center justify-center shadow-md transition-colors cursor-pointer'>
                        <i className='fa fa-camera text-amber-900 text-xs' />
                      </i>
                    </label>
                  </div>
                </div>

                <p className='font-black text-stone-800 text-base'>
                  {user?.name}
                </p>
                <p className='text-xs text-stone-400 mb-1'>{user?.email}</p>
                <span className='inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 capitalize mb-5'>
                  <span className='w-1.5 h-1.5 rounded-full bg-amber-400' />
                  {t(`profile.roles.${user?.role}`, {
                    defaultValue: user?.role,
                  })}
                </span>

                <input type='file' accept='image/*' className='hidden' />

                <p className='text-[10px] text-stone-400 mt-3'>
                  {t("profile.avatar.fileHint")}
                </p>
              </div>
            </SectionCard>
          </div>

          {/* ── Col 2-3: Forms ────────────────────────── */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Personal info */}
            <SectionCard
              eyebrow={t("profile.form.eyebrow")}
              title={t("profile.form.title")}
            >
              <form
                onSubmit={handleSubmit}
                className='grid sm:grid-cols-2 gap-4'
              >
                <div>
                  <label className={labelClass}>
                    {t("profile.form.fullName")}
                  </label>
                  {renderInput(
                    "",
                    "name",
                    data,
                    errors,
                    handleChange,
                    "text",
                    true
                  )}
                </div>
                <div>
                  <label className={labelClass}>
                    {t("profile.form.email")}
                  </label>
                  {renderInput(
                    "",
                    "email",
                    data,
                    errors,
                    handleChange,
                    "email",
                    true
                  )}
                </div>
                <div>
                  <label className={labelClass}>
                    {t("profile.form.password")}
                  </label>
                  {renderInput(
                    "",
                    "password",
                    data,
                    errors,
                    handleChange,
                    "password",
                    true
                  )}
                </div>
                <div>
                  <label className={labelClass}>
                    {t("profile.form.phone")}
                  </label>
                  {renderInput(
                    "",
                    "phone",
                    data,
                    errors,
                    handleChange,
                    "phone",
                    true
                  )}
                </div>
                {/* <div>
                  <label className={labelClass}>
                    {t("profile.form.nationality")}
                  </label>
                  {renderInput(
                    "",
                    "nationality",
                    data,
                    errors,
                    handleChange,
                    "text",
                    true
                  )}
                </div>
                                {user?.role === role.ADMIN && (
                  <div>
                    <label className={labelClass}>
                      {t("profile.form.role")}
                    </label>
                    {renderSelect(
                      "",
                      "role",
                      data,
                      errors,
                      handleChange,
                      getRoleOptions(),
                      "label",
                      "value"
                    )}
                  </div>
                )}
                {user?.role === role.ADMIN && (
                  <div className='flex justify-between items-center gap-4'>
                    <div className='flex-col items-center'>
                      <label className={labelClass}>
                        {t("profile.form.verified")}
                      </label>
                      {ToggleSwitcher({
                        name: "verified",
                        data,
                        errors,
                        onChange: handleChange,
                        bg_color: "bg-green-400",
                      })}
                    </div>
                    <div className='flex-col items-center'>
                      <label className={labelClass}>
                        {t("profile.form.active")}
                      </label>
                      {ToggleSwitcher({
                        name: "active",
                        data,
                        errors,
                        onChange: handleChange,
                        bg_color: "bg-blue-400",
                      })}
                    </div>
                  </div>
                )}
 */}{" "}
                <div className='sm:col-span-2 pt-1'>
                  {renderButton(
                    t("profile.form.saveButton"),
                    "submit",
                    validate()
                  )}
                </div>
              </form>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
