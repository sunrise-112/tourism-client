// ── UserForm.jsx ──────────────────────────────────────────────
import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  renderImageUpload,
  renderInput,
  renderSelect,
} from "../../utils/formRenders";
import ToggleSwitcher from "../../common/ToggleSwitcher";
import userService from "../../services/userService";
import renderImage from "../../utils/renderImage";
import useForm from "../../hooks/useForm";
import role from "../../constants/role";
import Joi from "joi-browser";
import { toast } from "react-toastify";

// ─── Constants ────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Identity", icon: "fa-user" },
  { id: 2, label: "Access", icon: "fa-shield-alt" },
];

const ROLE_META = {
  admin: {
    color: "from-rose-400 to-pink-500",
    ring: "ring-rose-200",
    icon: "fa-crown",
    badge: "bg-rose-100 text-rose-700",
  },
  guide: {
    color: "from-blue-400 to-indigo-500",
    ring: "ring-blue-200",
    icon: "fa-map",
    badge: "bg-blue-100 text-blue-700",
  },
  customer: {
    color: "from-amber-400 to-orange-500",
    ring: "ring-amber-200",
    icon: "fa-user",
    badge: "bg-amber-100 text-amber-700",
  },
};

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  nationality: "",
  avatar: "",
  password: "",
  role: "customer",
  verified: false,
  active: true,
};

// ─── Avatar preview helper ────────────────────────────────────
const AvatarPreview = ({
  name,
  src,
  size = "w-20 h-20",
  textSize = "text-2xl",
  role = "customer",
}) => {
  const { t } = useTranslation();
  const meta = ROLE_META[role] ?? ROLE_META.customer;
  return src ? (
    <img
      src={renderImage(src)}
      alt={name}
      className={`${size} rounded-2xl object-cover ring-4 ${meta.ring}`}
    />
  ) : (
    <div
      className={`${size} rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-white font-black ${textSize} ring-4 ${meta.ring} shadow-lg`}
    >
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
};

// ─── Live Preview Panel ───────────────────────────────────────
const LivePreview = ({ data, isEdit }) => {
  const { t } = useTranslation();
  const meta = ROLE_META[data.role] ?? ROLE_META.customer;
  const translatedRole = t(`userForm.roles.${data.role}`, {
    defaultValue: data.role,
  });
  return (
    <div className='sticky top-6 bg-[#1C1107] rounded-2xl overflow-hidden shadow-2xl'>
      {/* Header glow */}
      <div className='absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none' />
      <div
        className='absolute inset-0 opacity-[0.03]'
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Top accent */}
      <div className={`h-1 bg-gradient-to-r ${meta.color}`} />

      <div className='relative z-10 p-6'>
        {/* Preview label */}
        <p className='text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400/70 mb-5'>
          {isEdit
            ? t("userForm.preview.editModeLabel")
            : t("userForm.preview.newModeLabel")}
        </p>

        {/* Avatar + name */}
        <div className='flex flex-col items-center text-center mb-6'>
          <AvatarPreview
            name={data.name}
            src={data.avatar || null}
            size='w-20 h-20'
            textSize='text-2xl'
            role={data.role}
          />
          <h3
            className='mt-4 text-xl font-black text-white leading-tight'
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {data.name || (
              <span className='text-white/20 italic font-normal text-base'>
                {t("userForm.preview.placeholderName")}
              </span>
            )}
          </h3>
          <p className='text-stone-400 text-xs mt-1 truncate max-w-full'>
            {data.email || (
              <span className='text-white/20 italic'>
                {t("userForm.preview.placeholderEmail")}
              </span>
            )}
          </p>

          {/* Role badge */}
          <span
            className={`mt-3 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${meta.badge}`}
          >
            <i className={`fa ${meta.icon} text-[10px]`} />
            {translatedRole}
          </span>
        </div>

        {/* Info rows */}
        <div className='space-y-3 border-t border-white/10 pt-5'>
          {[
            {
              icon: "fa-phone",
              label: t("userForm.preview.phoneLabel"),
              value: data.phone,
            },
            {
              icon: "fa-flag",
              label: t("userForm.preview.nationalityLabel"),
              value: data.nationality,
            },
          ].map((row) => (
            <div key={row.label} className='flex items-center gap-3'>
              <div className='w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0'>
                <i className={`fa ${row.icon} text-amber-400/70 text-[10px]`} />
              </div>
              <div className='min-w-0'>
                <p className='text-[10px] text-white/30 uppercase tracking-wider'>
                  {row.label}
                </p>
                <p className='text-xs font-semibold text-white/70 truncate'>
                  {row.value || (
                    <span className='text-white/20 italic font-normal'>—</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Status pills */}
        <div className='flex gap-2 mt-5 pt-5 border-t border-white/10'>
          <span
            className={`flex-1 text-center text-[10px] font-bold py-1.5 rounded-lg ${
              data.active
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "bg-white/5 text-white/30 border border-white/10"
            }`}
          >
            <i className='fa fa-circle mr-1 text-[8px]' />
            {data.active
              ? t("userForm.preview.active")
              : t("userForm.preview.inactive")}
          </span>
          <span
            className={`flex-1 text-center text-[10px] font-bold py-1.5 rounded-lg ${
              data.verified
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                : "bg-white/5 text-white/30 border border-white/10"
            }`}
          >
            <i
              className={`fa ${
                data.verified ? "fa-check-circle" : "fa-times-circle"
              } mr-1 text-[10px]`}
            />
            {data.verified
              ? t("userForm.preview.verified")
              : t("userForm.preview.unverified")}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────
const UserForm = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState("forward");
  const [formData, setFormData] = useState({ ...EMPTY });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingUser, setLoadingUser] = useState(isEdit);

  // Translated roles for select dropdown
  const roleOptions = useMemo(() => {
    const roles = [
      { name: "admin", label: t("userForm.roles.admin") },
      { name: "customer", label: t("userForm.roles.customer") },
    ];
    return roles;
  }, [t]);

  // ── Fetch existing user if editing ──────────────────────────
  useEffect(() => {
    if (!isEdit) return;
    const fetchUser = async () => {
      try {
        setLoadingUser(true);
        const user = await userService.getById(id);
        setFormData({
          name: user.name ?? "",
          email: user.email ?? "",
          phone: user.phone ?? "",
          nationality: user.nationality ?? "",
          avatar: user.avatar ?? "",
          password: "", // never pre-fill password
          role: user.role ?? "customer",
          verified: user.verified ?? false,
          active: user.active ?? true,
        });
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [id]);

  const schema = {
    avatar: Joi.optional(),
    name: Joi.string().max(100).label("Name"),
    email: Joi.string().email().max(150).label("Email"),
    password: Joi.optional().label("Password"),
    phone: Joi.string().max(20).label("Phone"),
    nationality: Joi.string().max(100).label("Nationality"),
    role: Joi.optional(),
    verified: Joi.boolean().label("Verified"),
    active: Joi.boolean().label("Active"),
  };

  const { data, errors, handleChange, handleSubmit, validate, getFormData } =
    useForm(formData, schema, doSubmit);

  const validateStep1 = () => {
    const e = {};
    if (!data.name?.trim()) e.name = t("userForm.errors.nameRequired");
    if (!data.email?.trim()) e.email = t("userForm.errors.emailRequired");
    else if (!/\S+@\S+\.\S+/.test(data.email))
      e.email = t("userForm.errors.emailInvalid");
    if (!data.phone?.trim()) e.phone = t("userForm.errors.phoneRequired");
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!data.role) e.role = t("userForm.errors.roleRequired");
    if (!isEdit && !data.password?.trim())
      e.password = t("userForm.errors.passwordRequired");
    return e;
  };

  const isStep1Valid = !Object.keys(validateStep1()).length;
  const isStep2Valid = !Object.keys(validateStep2()).length;

  // ── Navigation ───────────────────────────────────────────────
  const goTo = (next) => {
    if (next > step) {
      const stepErrors = step === 1 ? validateStep1() : {};
      if (Object.keys(stepErrors).length) {
        return;
      }
    }
    setDirection(next > step ? "forward" : "back");
    setStep(next);
  };

  // ── Submit ───────────────────────────────────────────────────
  async function doSubmit(e) {
    const payload = getFormData();
    try {
      setIsSubmitting(true);
      if (isEdit) {
        await userService.update(id, payload);
      } else {
        await userService.create(payload);
      }
      toast.success(t("userForm.toasts.updateSuccess"));
      // navigate("/admin/users");
    } catch (err) {
      console.log("Error: ", err);
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Loading skeleton ─────────────────────────────────────────
  if (loadingUser) {
    return (
      <div className='min-h-screen bg-stone-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mx-auto mb-4 animate-pulse' />
          <p className='text-sm text-stone-400 font-semibold'>
            {t("userForm.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-stone-100 p-4 md:p-8'>
      <div className='max-w-5xl mx-auto space-y-6'>
        {/* ── Page header ──────────────────────────────────── */}
        <div className='flex items-center gap-4'>
          <button
            onClick={() => navigate(-1)}
            className='w-9 h-9 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-all'
          >
            <i className='fa fa-arrow-left text-xs' />
          </button>
          <div>
            <p className='text-xs font-bold uppercase tracking-widest text-stone-400'>
              {isEdit
                ? t("userForm.pageHeader.editLabel")
                : t("userForm.pageHeader.createLabel")}
            </p>
            <h1
              className='text-2xl font-black text-stone-800'
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {isEdit
                ? t("userForm.pageHeader.editTitle", {
                    name: data.name || t("userForm.pageHeader.unknownUser"),
                  })
                : t("userForm.pageHeader.createTitle")}
            </h1>
          </div>
        </div>

        {/* ── Two-column layout ─────────────────────────────── */}
        <div className='grid lg:grid-cols-5 gap-6 items-start'>
          {/* ── Form card ──────────────────────────────────── */}
          <div className='lg:col-span-3 bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-xl shadow-stone-200/50'>
            {/* Top accent */}
            <div className='h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400' />

            <div className='p-6'>
              {/* ── Step indicator ─────────────────────────── */}
              <div className='flex items-center gap-2 mb-7'>
                {STEPS.map((s, i) => {
                  const isActive = step === s.id;
                  const isDone = step > s.id;
                  const stepLabel = t(
                    `userForm.steps.${s.id === 1 ? "identity" : "access"}.label`
                  );
                  return (
                    <div key={s.id} className='flex items-center gap-2 flex-1'>
                      <div className='flex items-center gap-2 flex-1'>
                        <button
                          type='button'
                          onClick={() => isDone && goTo(s.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black transition-all duration-300 ${
                            isDone
                              ? "bg-amber-400 text-amber-900 cursor-pointer hover:scale-105"
                              : isActive
                              ? "bg-amber-400 text-amber-900 ring-4 ring-amber-400/20"
                              : "bg-stone-100 text-stone-400 cursor-default"
                          }`}
                        >
                          {isDone ? (
                            <i className='fa fa-check text-[10px]' />
                          ) : (
                            <i className={`fa ${s.icon} text-[10px]`} />
                          )}
                        </button>
                        <div className='flex-1'>
                          <p
                            className={`text-xs font-bold transition-colors duration-200 ${
                              isActive ? "text-stone-800" : "text-stone-400"
                            }`}
                          >
                            {stepLabel}
                          </p>
                          <p className='text-[10px] text-stone-400'>
                            {isDone
                              ? t("userForm.steps.status.completed")
                              : isActive
                              ? t("userForm.steps.status.inProgress")
                              : t("userForm.steps.status.upcoming")}
                          </p>
                        </div>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className='w-8 shrink-0 h-px bg-stone-200 mx-1 relative overflow-hidden'>
                          <div
                            className='absolute inset-y-0 left-0 bg-amber-400 transition-all duration-500'
                            style={{ width: isDone ? "100%" : "0%" }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                <span
                  className={`ml-auto shrink-0 text-[10px] font-bold px-2.5 py-1 rounded border transition-all duration-300 ${
                    step === STEPS.length
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-amber-50 text-amber-600 border-amber-200"
                  }`}
                >
                  {step === STEPS.length
                    ? t("userForm.steps.lastStep")
                    : t("userForm.steps.stepsLeft", {
                        count: STEPS.length - step,
                      })}
                </span>
              </div>

              {/* ── Steps ──────────────────────────────────── */}
              <form onSubmit={handleSubmit}>
                <div className='relative overflow-hidden'>
                  {/* Step 1 — Identity */}
                  <div
                    className={`space-y-3 transition-all duration-300 ${
                      step === 1
                        ? "opacity-100 translate-x-0"
                        : direction === "forward"
                        ? "opacity-0 -translate-x-8 absolute inset-0 pointer-events-none"
                        : "opacity-0 translate-x-8 absolute inset-0 pointer-events-none"
                    }`}
                  >
                    <p className='text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3'>
                      {t("userForm.form.personalInfo")}
                    </p>

                    {renderInput(
                      t("userForm.form.fullName"),
                      "name",
                      data,
                      errors,
                      handleChange,
                      "text"
                    )}
                    {renderInput(
                      t("userForm.form.email"),
                      "email",
                      data,
                      errors,
                      handleChange,
                      "email"
                    )}
                    {renderInput(
                      t("userForm.form.phone"),
                      "phone",
                      data,
                      errors,
                      handleChange,
                      "tel"
                    )}
                    {renderInput(
                      t("userForm.form.nationality"),
                      "nationality",
                      data,
                      errors,
                      handleChange,
                      "text"
                    )}
                    {renderImageUpload(
                      t("userForm.form.avatar"),
                      "avatar",
                      data,
                      errors,
                      handleChange
                    )}

                    <button
                      type='button'
                      disabled={!isStep1Valid}
                      onClick={() => goTo(2)}
                      className='w-full mt-2 py-3 rounded-xl text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2'
                    >
                      {t("userForm.buttons.continue")}{" "}
                      <i className='fa fa-arrow-right text-xs' />
                    </button>
                  </div>

                  {/* Step 2 — Access */}
                  <div
                    className={`space-y-4 transition-all duration-300 ${
                      step === 2
                        ? "opacity-100 translate-x-0"
                        : direction === "forward"
                        ? "opacity-0 translate-x-8 absolute inset-0 pointer-events-none"
                        : "opacity-0 -translate-x-8 absolute inset-0 pointer-events-none"
                    }`}
                  >
                    <p className='text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3'>
                      {t("userForm.form.roleAndAccess")}
                    </p>

                    {renderSelect(
                      t("userForm.form.role"),
                      "role",
                      data,
                      errors,
                      handleChange,
                      roleOptions,
                      "label",
                      "name"
                    )}
                    {renderInput(
                      isEdit
                        ? t("userForm.form.newPassword")
                        : t("userForm.form.password"),
                      "password",
                      data,
                      errors,
                      handleChange,
                      "password"
                    )}

                    {/* Divider */}
                    <div className='border-t border-stone-100 pt-4'>
                      <p className='text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3'>
                        {t("userForm.form.accountStatus")}
                      </p>
                      <div className='space-y-3'>
                        <ToggleSwitcher
                          label={t("userForm.form.active.label")}
                          name='active'
                          data={data}
                          errors={errors}
                          onChange={handleChange}
                          icon='fa-circle'
                          selected={data.active}
                          description={t("userForm.form.active.description")}
                          bg_color='bg-emerald-500'
                        />

                        <ToggleSwitcher
                          label={t("userForm.form.verified.label")}
                          name='verified'
                          data={data}
                          errors={errors}
                          onChange={handleChange}
                          icon='fa-check-circle'
                          selected={data.verified}
                          description={t("userForm.form.verified.description")}
                          bg_color='bg-blue-500'
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='flex gap-2 pt-1'>
                      <button
                        type='button'
                        onClick={() => goTo(1)}
                        className='py-3 px-4 rounded-xl text-sm font-semibold text-stone-500 border border-stone-200 hover:border-stone-300 hover:text-stone-700 transition-all duration-200 flex items-center gap-2 shrink-0'
                      >
                        <i className='fa fa-arrow-left text-xs' />{" "}
                        {t("userForm.buttons.back")}
                      </button>

                      <button
                        type='submit'
                        disabled={!isStep2Valid || isSubmitting}
                        className='flex-1 py-3 rounded-xl text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2'
                      >
                        {isSubmitting ? (
                          <>
                            <i className='fa fa-spinner fa-spin text-xs' />
                            {isEdit
                              ? t("userForm.buttons.saving")
                              : t("userForm.buttons.creating")}
                          </>
                        ) : (
                          <>
                            <i
                              className={`fa ${
                                isEdit ? "fa-save" : "fa-user-plus"
                              } text-xs`}
                            />
                            {isEdit
                              ? t("userForm.buttons.saveChanges")
                              : t("userForm.buttons.createUser")}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* ── Live preview ───────────────────────────────── */}
          <div className='lg:col-span-2'>
            <LivePreview data={data} isEdit={isEdit} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
